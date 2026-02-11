/**
 * popup.js — Lógica do Dashboard Popup
 * 
 * Gerencia os estados da interface, comunicação com o background
 * e renderização dos resultados de auditoria.
 */

(function () {
    'use strict';

    // === Ícones SVG por tipo de problema (espelha o overlay) ===
    const POPUP_RULE_ICONS = {
        'image-alt': { label: 'Img Alt', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="10" r="2" fill="currentColor"/><path d="M2 17l5-5 3 3 4-4 8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="1" y1="23" x2="23" y2="1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' },
        'color-contrast': { label: 'Contraste', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M12 2a10 10 0 0 1 0 20" fill="currentColor"/></svg>' },
        'label': { label: 'Label', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M7 9h4M7 13h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
        'heading-order': { label: 'Heading', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><text x="4" y="17" fill="currentColor" font-size="16" font-weight="900" font-family="Arial">H</text><path d="M17 6v12M17 6l4 4M17 6l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
        'link-name': { label: 'Link', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M10 13a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1.5 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M14 11a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1.5-1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' },
        'aria-required-attr': { label: 'ARIA', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M12 7a3 3 0 0 1 3 3c0 1.66-3 3-3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>' },
        'tabindex': { label: 'Teclado', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><rect x="2" y="6" width="20" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="5" y="9" width="3" height="2" rx="0.5" fill="currentColor"/><rect x="10" y="9" width="3" height="2" rx="0.5" fill="currentColor"/><rect x="15" y="9" width="4" height="2" rx="0.5" fill="currentColor"/><rect x="5" y="13" width="14" height="2" rx="0.5" fill="currentColor"/></svg>' },
        'landmark-one-main': { label: 'Landmark', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><rect x="3" y="3" width="18" height="4" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="10" width="10" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="15" y="10" width="6" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>' },
        'html-has-lang': { label: 'Idioma', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" stroke-width="1.2"/><path d="M2 12h20" stroke="currentColor" stroke-width="1.2"/></svg>' },
        'document-title': { label: 'Documento', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="1.5"/><path d="M14 2v6h6" stroke="currentColor" stroke-width="1.5"/><path d="M8 13h8M8 17h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
        'td-has-header': { label: 'Tabela', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M3 9h18M3 15h18M9 3v18" stroke="currentColor" stroke-width="1.5"/></svg>' },
        'video-caption': { label: 'Mídia', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><rect x="2" y="4" width="15" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M17 8l5-3v13l-5-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
        'frame-title': { label: 'Frame', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M2 8h20" stroke="currentColor" stroke-width="1.5"/><circle cx="5" cy="5.5" r="1" fill="currentColor"/><circle cx="8" cy="5.5" r="1" fill="currentColor"/></svg>' },
        'button-name': { label: 'Botão', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><rect x="3" y="7" width="18" height="10" rx="5" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5"/></svg>' },
        'list': { label: 'Lista', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="5" cy="6" r="1.5" fill="currentColor"/><path d="M9 6h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="5" cy="12" r="1.5" fill="currentColor"/><path d="M9 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="5" cy="18" r="1.5" fill="currentColor"/><path d="M9 18h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
        'bypass': { label: 'Skip Nav', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
        'meta-viewport': { label: 'Viewport', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M5 18h14" stroke="currentColor" stroke-width="1.2"/></svg>' },
        'marquee': { label: 'Animação', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v4l2 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
        'presentation-role-conflict': { label: 'Semântica', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M17 14l4 4m0-4l-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' },
        'server-side-image-map': { label: 'Map', svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="9" r="2.5" fill="currentColor"/></svg>' }
    };

    // Alias map: rules that share icons with a primary rule
    const POPUP_RULE_ALIASES = {
        'role-img-alt': 'image-alt', 'svg-img-alt': 'image-alt', 'input-image-alt': 'image-alt',
        'image-redundant-alt': 'image-alt', 'area-alt': 'image-alt', 'object-alt': 'image-alt',
        'color-contrast-enhanced': 'color-contrast', 'link-in-text-block': 'color-contrast',
        'select-name': 'label', 'input-button-name': 'label', 'form-field-multiple-labels': 'label',
        'label-title-only': 'label', 'autocomplete-valid': 'label',
        'empty-heading': 'heading-order', 'page-has-heading-one': 'heading-order', 'empty-table-header': 'heading-order',
        'identical-links-same-purpose': 'link-name',
        'aria-required-children': 'aria-required-attr', 'aria-required-parent': 'aria-required-attr',
        'aria-valid-attr': 'aria-required-attr', 'aria-valid-attr-value': 'aria-required-attr',
        'aria-allowed-attr': 'aria-required-attr', 'aria-allowed-role': 'aria-required-attr',
        'aria-deprecated-role': 'aria-required-attr', 'aria-dialog-name': 'aria-required-attr',
        'aria-hidden-body': 'aria-required-attr', 'aria-hidden-focus': 'aria-required-attr',
        'aria-roles': 'aria-required-attr', 'aria-text': 'aria-required-attr',
        'aria-label': 'aria-required-attr', 'aria-labelledby': 'aria-required-attr',
        'aria-command-name': 'aria-required-attr', 'aria-input-field-name': 'aria-required-attr',
        'aria-meter-name': 'aria-required-attr', 'aria-toggle-field-name': 'aria-required-attr',
        'aria-tooltip-name': 'aria-required-attr', 'aria-treeitem-name': 'aria-required-attr',
        'aria-progressbar-name': 'aria-required-attr', 'aria-live-region': 'aria-required-attr',
        'status-messages': 'aria-required-attr', 'duplicate-id-aria': 'aria-required-attr',
        'focus-order-semantics': 'tabindex', 'focusable-content': 'tabindex',
        'focusable-disabled': 'tabindex', 'focusable-no-name': 'tabindex',
        'frame-focusable-content': 'tabindex', 'no-autofocus': 'tabindex',
        'scrollable-region-focusable': 'tabindex', 'nested-interactive': 'tabindex',
        'landmark-banner-is-top-level': 'landmark-one-main', 'landmark-complementary-is-top-level': 'landmark-one-main',
        'landmark-contentinfo-is-top-level': 'landmark-one-main', 'landmark-main-is-top-level': 'landmark-one-main',
        'landmark-navigation-is-top-level': 'landmark-one-main', 'landmark-no-duplicate-banner': 'landmark-one-main',
        'landmark-no-duplicate-contentinfo': 'landmark-one-main', 'landmark-no-duplicate-main': 'landmark-one-main',
        'landmark-unique': 'landmark-one-main', 'region': 'landmark-one-main',
        'html-lang-valid': 'html-has-lang', 'html-xml-lang-mismatch': 'html-has-lang', 'valid-lang': 'html-has-lang',
        'th-has-data-cells': 'td-has-header', 'table-duplicate-name': 'td-has-header',
        'table-fake-caption': 'td-has-header', 'scope-attr-valid': 'td-has-header',
        'audio-caption': 'video-caption', 'video-description': 'video-caption', 'no-autoplay-audio': 'video-caption',
        'frame-title-unique': 'frame-title', 'iframe-title': 'frame-title',
        'summary-name': 'button-name',
        'listitem': 'list', 'definition-list': 'list', 'dlitem': 'list',
        'skip-link': 'bypass', 'accesskeys': 'bypass',
        'meta-viewport-large': 'meta-viewport', 'target-size': 'meta-viewport',
        'blink': 'marquee', 'meta-refresh': 'marquee'
    };

    const POPUP_FALLBACK_ICON = {
        label: 'Problema',
        svg: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M12 2L2 20h20L12 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 10v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>'
    };

    function getPopupIconForRule(ruleId) {
        const resolved = POPUP_RULE_ALIASES[ruleId] || ruleId;
        return (POPUP_RULE_ICONS[resolved] || POPUP_FALLBACK_ICON).svg;
    }

    function getPopupLabelForRule(ruleId) {
        const resolved = POPUP_RULE_ALIASES[ruleId] || ruleId;
        return (POPUP_RULE_ICONS[resolved] || POPUP_FALLBACK_ICON).label;
    }


    // === Elementos do DOM ===
    const stateIdle = document.getElementById('state-idle');
    const stateAnalyzing = document.getElementById('state-analyzing');
    const stateResults = document.getElementById('state-results');
    const stateError = document.getElementById('state-error');

    const btnAnalyze = document.getElementById('btn-analyze');
    const btnReanalyze = document.getElementById('btn-reanalyze');
    const btnExport = document.getElementById('btn-export');
    const btnToggleOverlay = document.getElementById('btn-toggle-overlay');
    const btnRetry = document.getElementById('btn-retry');

    const countCritical = document.getElementById('count-critical');
    const countSerious = document.getElementById('count-serious');
    const countModerate = document.getElementById('count-moderate');
    const countMinor = document.getElementById('count-minor');

    const statTotalNodes = document.getElementById('stat-total-nodes');
    const statPasses = document.getElementById('stat-passes');
    const statInapplicable = document.getElementById('stat-inapplicable');

    const pageTitle = document.getElementById('page-title');
    const pageUrl = document.getElementById('page-url');
    const issuesList = document.getElementById('issues-list');
    const errorMessage = document.getElementById('error-message');

    // === Gerenciamento de Estado ===
    let currentResults = null;
    let activeSeverityFilter = null; // null = todos, 'critical', 'serious', etc.

    function showState(state) {
        [stateIdle, stateAnalyzing, stateResults, stateError].forEach(el => {
            el.classList.add('hidden');
        });

        switch (state) {
            case 'idle': stateIdle.classList.remove('hidden'); break;
            case 'analyzing': stateAnalyzing.classList.remove('hidden'); break;
            case 'results': stateResults.classList.remove('hidden'); break;
            case 'error': stateError.classList.remove('hidden'); break;
        }
    }

    // === Event Listeners Filtro ===
    document.querySelectorAll('.severity-card').forEach(card => {
        card.addEventListener('click', () => {
            if (!currentResults) return;
            const severity = card.dataset.severity;

            // Toggle filtro
            if (activeSeverityFilter === severity) {
                activeSeverityFilter = null;
            } else {
                activeSeverityFilter = severity;
            }

            // Atualizar UI dos cards
            updateFilterUI();

            // Re-renderizar lista
            renderIssuesByHeuristic(currentResults.byHeuristic || {});
        });
    });

    function updateFilterUI() {
        document.querySelectorAll('.severity-card').forEach(card => {
            const sev = card.dataset.severity;
            if (activeSeverityFilter === sev) {
                card.classList.add('active');
                card.style.opacity = '1';
            } else if (activeSeverityFilter) {
                card.classList.remove('active');
                card.style.opacity = '0.4'; // Diminui opacidade dos não selecionados
            } else {
                card.classList.remove('active');
                card.style.opacity = '1'; // Todos visíveis normal
            }
        });
    }

    // === Auditoria ===
    function startAudit() {
        showState('analyzing');
        activeSeverityFilter = null; // Resetar filtro ao iniciar nova análise
        updateFilterUI();

        chrome.runtime.sendMessage({ action: 'runAudit' }, (response) => {
            if (chrome.runtime.lastError) {
                showError('Erro de comunicação: ' + chrome.runtime.lastError.message);
                return;
            }

            if (!response || response.error) {
                showError(response?.error || 'Erro desconhecido durante a auditoria.');
                return;
            }

            currentResults = response;
            renderResults(response);
        });
    }

    function showError(message) {
        errorMessage.textContent = message;
        showState('error');
    }

    // === Renderização dos Resultados ===
    function renderResults(results) {
        // Informações da página
        pageTitle.textContent = results.pageTitle || 'Sem título';
        pageUrl.textContent = results.url || '';

        // Cards de severidade com animação de contagem
        animateCount(countCritical, results.summary?.critical || 0);
        animateCount(countSerious, results.summary?.serious || 0);
        animateCount(countModerate, results.summary?.moderate || 0);
        animateCount(countMinor, results.summary?.minor || 0);

        // Estatísticas extras
        statTotalNodes.textContent = results.summary?.totalNodes || 0;
        statPasses.textContent = results.passes || 0;
        statInapplicable.textContent = results.inapplicable || 0;

        // Lista de problemas por heurística
        renderIssuesByHeuristic(results.byHeuristic || {});

        showState('results');
    }

    /**
     * Animação de contagem nos cards de severidade.
     */
    function animateCount(element, target) {
        const duration = 600;
        const start = 0;
        const startTime = Date.now();

        function update() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (target - start) * easeOut);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    /**
     * Renderiza os problemas agrupados por heurística de Nielsen.
     */
    function renderIssuesByHeuristic(byHeuristic) {
        issuesList.innerHTML = '';

        let heuristicEntries = Object.entries(byHeuristic);

        // Filtrar heurísticas se houver filtro de severidade ativo
        if (activeSeverityFilter) {
            heuristicEntries = heuristicEntries
                .map(([id, data]) => {
                    const filteredIssues = data.issues.filter(issue => issue.severity.level === activeSeverityFilter);
                    return [id, { ...data, issues: filteredIssues }];
                })
                .filter(([, data]) => data.issues.length > 0);
        }

        if (heuristicEntries.length === 0) {
            const emptyMessage = activeSeverityFilter
                ? 'Nenhum problema com esta severidade.'
                : 'Nenhum problema encontrado!';

            issuesList.innerHTML = `
        <div class="all-clear">
          <div class="all-clear-icon">🎉</div>
          ${emptyMessage}
        </div>
      `;
            return;
        }

        // Ordenar por quantidade de problemas (mais problemas primeiro)
        heuristicEntries.sort((a, b) => b[1].issues.length - a[1].issues.length);

        heuristicEntries.forEach(([heuristicId, data], index) => {
            const group = document.createElement('div');
            group.className = 'heuristic-group';
            group.style.animationDelay = `${index * 0.05}s`;

            const heuristic = data.heuristic || { id: heuristicId, name: 'Não classificada' };
            const issueCount = data.issues.length;

            // Header do grupo
            const header = document.createElement('div');
            header.className = 'heuristic-header';
            header.innerHTML = `
        <div class="heuristic-info">
          <div class="heuristic-id">${heuristic.id || '?'}</div>
          <span class="heuristic-name" title="${heuristic.name || ''}">${heuristic.name || 'Sem categoria'}</span>
        </div>
        <span class="heuristic-badge">${issueCount}</span>
        <svg class="chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;

            // Container de detalhes (colapsível)
            const details = document.createElement('div');
            details.className = 'heuristic-details';

            // Se houver filtro, manter aberto por padrão para facilitar visualização
            if (activeSeverityFilter) {
                details.classList.add('open');
                header.querySelector('.chevron').classList.add('open');
            }

            data.issues.forEach(issue => {
                const item = document.createElement('div');
                item.className = 'issue-item';

                const severityLevel = issue.severity?.level || 'minor';
                const wcagTags = (issue.wcagCriteria || [])
                    .map(c => `<span class="issue-tag wcag">WCAG ${c}</span>`)
                    .join('');
                const nodeCount = (issue.nodes || []).length;
                const iconSvg = getPopupIconForRule(issue.id);
                const ruleLabel = getPopupLabelForRule(issue.id);

                item.innerHTML = `
          <div class="issue-icon-badge ${severityLevel}" title="${ruleLabel}">
            ${iconSvg}
          </div>
          <div class="issue-content">
            <div class="issue-desc">${escapeHtml(issue.help || issue.description || '')}</div>
            <div class="issue-meta">
              <span class="issue-tag rule">${ruleLabel}</span>
              ${wcagTags}
              <span class="issue-tag count">${nodeCount} instância${nodeCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        `;

                details.appendChild(item);
            });

            // Toggle expand/collapse
            header.addEventListener('click', () => {
                const isOpen = details.classList.toggle('open');
                header.querySelector('.chevron').classList.toggle('open', isOpen);
            });

            group.appendChild(header);
            group.appendChild(details);
            issuesList.appendChild(group);
        });
    }

    /**
     * Escapa HTML para prevenir XSS.
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // === Exportação JSON ===
    function exportReport() {
        chrome.runtime.sendMessage({ action: 'exportReport' }, (report) => {
            if (chrome.runtime.lastError || !report) {
                showError('Não foi possível gerar o relatório.');
                return;
            }

            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

            const a = document.createElement('a');
            a.href = url;
            a.download = `heuristic-audit-${timestamp}.json`;
            a.click();

            URL.revokeObjectURL(url);
        });
    }

    // === Toggle Overlay ===
    function toggleOverlay() {
        chrome.runtime.sendMessage({ action: 'toggleOverlay' });
    }

    // === Event Listeners ===
    btnAnalyze.addEventListener('click', startAudit);
    btnReanalyze.addEventListener('click', startAudit);
    btnRetry.addEventListener('click', startAudit);
    btnExport.addEventListener('click', exportReport);
    btnToggleOverlay.addEventListener('click', toggleOverlay);

    // === Destacar na Página (painel flutuante) ===
    const btnOpenPanel = document.getElementById('btn-open-panel');
    if (btnOpenPanel) {
        btnOpenPanel.addEventListener('click', () => {
            btnOpenPanel.disabled = true;
            btnOpenPanel.textContent = 'Abrindo painel...';
            chrome.runtime.sendMessage({ action: 'openPanel' });
            // Dar tempo para o background injetar o painel antes de fechar
            setTimeout(() => window.close(), 600);
        });
    }

    // === Guia de Legendas ===
    const btnLegend = document.getElementById('btn-legend');
    const legendOverlay = document.getElementById('legend-overlay');
    const btnCloseLegend = document.getElementById('btn-close-legend');
    const legendIconsGrid = document.getElementById('legend-icons-grid');

    if (btnLegend && legendOverlay) {
        btnLegend.addEventListener('click', () => {
            legendOverlay.classList.remove('hidden');
            populateLegendIcons();
        });
    }

    if (btnCloseLegend) {
        btnCloseLegend.addEventListener('click', () => {
            legendOverlay.classList.add('hidden');
        });
    }

    function populateLegendIcons() {
        if (!legendIconsGrid || legendIconsGrid.children.length > 0) return;

        const iconEntries = [
            { label: 'Img Alt', desc: 'Texto alternativo de imagem', key: 'image-alt' },
            { label: 'Contraste', desc: 'Contraste de cor', key: 'color-contrast' },
            { label: 'Label', desc: 'Rótulo de formulário', key: 'label' },
            { label: 'Heading', desc: 'Hierarquia de cabeçalhos', key: 'heading-order' },
            { label: 'Link', desc: 'Nome de link', key: 'link-name' },
            { label: 'ARIA', desc: 'Atributos ARIA', key: 'aria-required-attr' },
            { label: 'Teclado', desc: 'Navegação por teclado', key: 'tabindex' },
            { label: 'Landmark', desc: 'Regiões estruturais', key: 'landmark-one-main' },
            { label: 'Idioma', desc: 'Idioma da página', key: 'html-has-lang' },
            { label: 'Documento', desc: 'Título do documento', key: 'document-title' },
            { label: 'Tabela', desc: 'Acessibilidade de tabelas', key: 'td-has-header' },
            { label: 'Mídia', desc: 'Legendas de vídeo/áudio', key: 'video-caption' },
            { label: 'Frame', desc: 'Título de iframe', key: 'frame-title' },
            { label: 'Botão', desc: 'Nome de botão', key: 'button-name' },
            { label: 'Lista', desc: 'Estrutura de listas', key: 'list' },
            { label: 'Skip Nav', desc: 'Link de saltar navegação', key: 'bypass' },
            { label: 'Viewport', desc: 'Configuração de viewport', key: 'meta-viewport' },
            { label: 'Animação', desc: 'Conteúdo em movimento', key: 'marquee' },
            { label: 'Semântica', desc: 'Conflito de roles', key: 'presentation-role-conflict' },
            { label: 'Map', desc: 'Mapa de imagem', key: 'server-side-image-map' }
        ];

        iconEntries.forEach(entry => {
            const svg = getPopupIconForRule(entry.key);
            const item = document.createElement('div');
            item.className = 'legend-icon-item';
            item.innerHTML = `
                <div class="icon-preview">${svg}</div>
                <div class="icon-label" title="${entry.desc}">${entry.label}</div>
            `;
            legendIconsGrid.appendChild(item);
        });
    }

    // === Inicialização ===
    // Tentar carregar resultados anteriores
    chrome.runtime.sendMessage({ action: 'getLastResults' }, (results) => {
        if (results && !results.error && results.issues) {
            currentResults = results;
            renderResults(results);
        } else {
            showState('idle');
        }
    });
})();
