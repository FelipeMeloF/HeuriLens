/**
 * background.js — Service Worker da Extensão
 * 
 * Gerencia a comunicação entre popup e content scripts.
 * Injeta scripts de análise na aba ativa e armazena resultados.
 */

// Armazena os resultados da última auditoria
let lastAuditResults = null;

/**
 * Injeta todos os scripts necessários na aba ativa e executa a auditoria.
 */
async function runAuditOnTab(tabId, persona = 'completo', customPersonaConfig = null) {
  try {
    // Injetar axe-core e o locale adequado
    const lang = chrome.i18n.getUILanguage();
    const scriptFiles = ['lib/axe-core.min.js'];
    if (lang.startsWith('pt')) scriptFiles.push('lib/axe-pt-br.js');

    await chrome.scripting.executeScript({
      target: { tabId },
      files: scriptFiles
    });

    // Injetar módulos de análise
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [
        'content/heuristics-mapper.js',
        'content/severity-calculator.js',
        'content/overlay.js',
        'content/content-script.js'
      ]
    });

    // Injetar CSS do overlay
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['assets/overlay-icons.css']
    });

    // Executar a auditoria
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: (persona, config) => {
        if (typeof window.__heuristicAuditor_runAudit === 'function') {
          return window.__heuristicAuditor_runAudit(persona, config);
        }
        return { error: 'Função de auditoria não encontrada.' };
      },
      args: [persona, customPersonaConfig]
    });

    if (results && results[0] && results[0].result) {
      lastAuditResults = results[0].result;
      // Salvar no storage
      await chrome.storage.local.set({ lastAuditResults: lastAuditResults });
      await saveToHistory(lastAuditResults);
      return lastAuditResults;
    }

    return { error: 'Nenhum resultado retornado pela auditoria.' };
  } catch (error) {
    console.error('[HeuristicAuditor] Erro ao executar auditoria:', error);
    return { error: error.message };
  }
}

/**
 * Salva o resultado no histórico (limite de 10 por domínio).
 */
async function saveToHistory(results) {
  try {
    if (!results || !results.url) return;
    const urlObj = new URL(results.url);
    const hostname = urlObj.hostname;
    if (!hostname) return;

    const historyKey = `history_${hostname}`;
    const data = await chrome.storage.local.get(historyKey);
    let history = data[historyKey] || [];

    const snapshot = {
      timestamp: results.timestamp || new Date().toISOString(),
      url: results.url,
      summary: results.summary
    };

    history.unshift(snapshot);
    if (history.length > 10) {
      history = history.slice(0, 10);
    }

    await chrome.storage.local.set({ [historyKey]: history });
  } catch (err) {
    console.error('Erro ao salvar histórico:', err);
  }
}

/**
 * Gera o relatório JSON para exportação (formato Lighthouse).
 */
function generateExportReport(auditResults) {
  if (!auditResults || !auditResults.issues) {
    return null;
  }

  const report = {
    meta: {
      toolName: 'HeuriLens - Heuristic Accessibility and Usability Auditor',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      url: auditResults.url || '',
      title: auditResults.pageTitle || ''
    },
    summary: {
      totalIssues: auditResults.summary?.total || 0,
      bySeverity: {
        critical: auditResults.summary?.critical || 0,
        serious: auditResults.summary?.serious || 0,
        moderate: auditResults.summary?.moderate || 0,
        minor: auditResults.summary?.minor || 0
      },
      byHeuristic: {}
    },
    issues: (auditResults.issues || []).map(issue => ({
      id: issue.id,
      description: issue.description,
      help: issue.help,
      helpUrl: issue.helpUrl,
      wcagCriteria: issue.wcagCriteria || [],
      wcagLevel: issue.wcagLevel || '',
      nielsenHeuristic: {
        id: issue.nielsenHeuristic?.id || '',
        name: issue.nielsenHeuristic?.name || '',
        description: issue.nielsenHeuristic?.description || ''
      },
      severity: {
        level: issue.severity?.level || '',
        score: issue.severity?.score || 0,
        impact: issue.severity?.impact || '',
        frequency: issue.severity?.frequency || 0
      },
      nodes: (issue.nodes || []).map(node => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary
      }))
    })),
    passes: auditResults.passes || 0,
    inapplicable: auditResults.inapplicable || 0
  };

  // Contagem por heurística
  report.issues.forEach(issue => {
    const hId = issue.nielsenHeuristic.id;
    if (hId) {
      report.summary.byHeuristic[hId] = (report.summary.byHeuristic[hId] || 0) + 1;
    }
  });

  return report;
}

/**
 * Listener de mensagens do popup e content scripts.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'runAudit') {
    const persona = message.persona || 'completo';
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        chrome.storage.sync.get('customPersonaConfig', async (configData) => {
          const results = await runAuditOnTab(tabs[0].id, persona, configData.customPersonaConfig);
          sendResponse(results);
        });
      } else {
        sendResponse({ error: 'Nenhuma aba ativa encontrada.' });
      }
    });
    return true; // Mantém o canal aberto para resposta assíncrona
  }

  if (message.action === 'getHistory') {
    try {
      const urlObj = new URL(message.url);
      const hostname = urlObj.hostname;
      const historyKey = `history_${hostname}`;
      chrome.storage.local.get(historyKey, (data) => {
        sendResponse(data[historyKey] || []);
      });
    } catch (err) {
      sendResponse([]);
    }
    return true;
  }


  if (message.action === 'getLastResults') {
    chrome.storage.local.get('lastAuditResults', (data) => {
      sendResponse(data.lastAuditResults || null);
    });
    return true;
  }

  if (message.action === 'exportReport') {
    chrome.storage.local.get('lastAuditResults', (data) => {
      const report = generateExportReport(data.lastAuditResults);
      sendResponse(report);
    });
    return true;
  }

  if (message.action === 'toggleOverlay') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            if (typeof window.__heuristicAuditor_toggleOverlay === 'function') {
              window.__heuristicAuditor_toggleOverlay();
            }
          }
        });
        sendResponse({ success: true });
      }
    });
    return true;
  }

  if (message.action === 'openPanel') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        const tabId = tabs[0].id;

        // Passar os resultados da última auditoria para a página
        const data = await chrome.storage.local.get('lastAuditResults');
        if (data.lastAuditResults) {
          await chrome.scripting.executeScript({
            target: { tabId },
            func: (results) => { window.__heuristicAuditor_lastResults = results; },
            args: [data.lastAuditResults]
          });
        }

        // Injetar o painel
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['content/panel.js']
        });

        sendResponse({ success: true });
      }
    });
    return true;
  }
});

