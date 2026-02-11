/**
 * panel.js — Painel Flutuante Reposicionável
 * 
 * Injeta um painel arrastável na página com o dashboard da auditoria.
 * O usuário pode reposicionar livremente na tela com drag & drop.
 */

(function () {
  'use strict';

  const PANEL_ID = '__heuristic-auditor-panel';

  // Se já existe, remover e recriar
  if (document.getElementById(PANEL_ID)) {
    document.getElementById(PANEL_ID).remove();
  }

  // === Ícones SVG por tipo de problema ===
  const PANEL_RULE_ICONS = {
    'image-alt': { label: 'Img Alt', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="10" r="2" fill="currentColor"/><path d="M2 17l5-5 3 3 4-4 8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="1" y1="23" x2="23" y2="1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' },
    'color-contrast': { label: 'Contraste', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M12 2a10 10 0 0 1 0 20" fill="currentColor"/></svg>' },
    'label': { label: 'Label', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M7 9h4M7 13h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
    'heading-order': { label: 'Heading', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><text x="4" y="17" fill="currentColor" font-size="16" font-weight="900" font-family="Arial">H</text></svg>' },
    'link-name': { label: 'Link', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M10 13a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1.5 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M14 11a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1.5-1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' },
    'aria-required-attr': { label: 'ARIA', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M12 7a3 3 0 0 1 3 3c0 1.66-3 3-3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>' },
    'tabindex': { label: 'Teclado', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><rect x="2" y="6" width="20" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="5" y="9" width="3" height="2" rx="0.5" fill="currentColor"/><rect x="10" y="9" width="3" height="2" rx="0.5" fill="currentColor"/><rect x="5" y="13" width="14" height="2" rx="0.5" fill="currentColor"/></svg>' },
    'landmark-one-main': { label: 'Landmark', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><rect x="3" y="3" width="18" height="4" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="10" width="10" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="15" y="10" width="6" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>' },
    'html-has-lang': { label: 'Idioma', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" stroke-width="1.2"/><path d="M2 12h20" stroke="currentColor" stroke-width="1.2"/></svg>' },
    'document-title': { label: 'Documento', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="1.5"/><path d="M14 2v6h6" stroke="currentColor" stroke-width="1.5"/></svg>' },
    'td-has-header': { label: 'Tabela', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M3 9h18M3 15h18M9 3v18" stroke="currentColor" stroke-width="1.5"/></svg>' },
    'video-caption': { label: 'Mídia', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><rect x="2" y="4" width="15" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M17 8l5-3v13l-5-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
    'frame-title': { label: 'Frame', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M2 8h20" stroke="currentColor" stroke-width="1.5"/></svg>' },
    'button-name': { label: 'Botão', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><rect x="3" y="7" width="18" height="10" rx="5" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5"/></svg>' },
    'list': { label: 'Lista', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><circle cx="5" cy="6" r="1.5" fill="currentColor"/><path d="M9 6h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="5" cy="12" r="1.5" fill="currentColor"/><path d="M9 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="5" cy="18" r="1.5" fill="currentColor"/><path d="M9 18h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
    'bypass': { label: 'Skip Nav', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
    'meta-viewport': { label: 'Viewport', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M5 18h14" stroke="currentColor" stroke-width="1.2"/></svg>' },
    'marquee': { label: 'Animação', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v4l2 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
    'presentation-role-conflict': { label: 'Semântica', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
    'server-side-image-map': { label: 'Map', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="9" r="2.5" fill="currentColor"/></svg>' }
  };

  const PANEL_ALIASES = {
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

  const FALLBACK_ICON = { label: 'Problema', svg: '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M12 2L2 20h20L12 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 10v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>' };

  function getIcon(ruleId) { return PANEL_RULE_ICONS[PANEL_ALIASES[ruleId] || ruleId] || FALLBACK_ICON; }

  // === Severity colors ===
  const SEV = {
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Crítico' },
    serious: { color: '#f97316', bg: 'rgba(249,115,22,0.12)', label: 'Sério' },
    moderate: { color: '#eab308', bg: 'rgba(234,179,8,0.12)', label: 'Moderado' },
    minor: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Menor' }
  };

  function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

  // === Criar painel ===
  const panel = document.createElement('div');
  panel.id = PANEL_ID;

  // Carregar posição salva ou usar padrão
  const savedPos = localStorage.getItem('__ha_panel_pos');
  let startX = 20, startY = 20;
  if (savedPos) {
    try { const p = JSON.parse(savedPos); startX = p.x; startY = p.y; } catch (e) { }
  }

  panel.style.cssText = `
    position: fixed;
    top: ${startY}px;
    left: ${startX}px;
    width: 420px;
    max-height: 80vh;
    background: #0f0f1a;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
    z-index: 2147483646;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
    font-size: 13px;
    color: #f1f5f9;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    resize: both;
    animation: __ha-panel-entrance 0.3s ease;
  `;

  // === Estilos do painel (injetados inline) ===
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes __ha-panel-entrance {
      from { opacity: 0; transform: scale(0.95) translateY(-10px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    #${PANEL_ID} * { box-sizing: border-box; }
    #${PANEL_ID}::-webkit-scrollbar { width: 5px; }
    #${PANEL_ID}::-webkit-scrollbar-track { background: transparent; }
    #${PANEL_ID}::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
    #${PANEL_ID} .ha-panel-scrollable::-webkit-scrollbar { width: 5px; }
    #${PANEL_ID} .ha-panel-scrollable::-webkit-scrollbar-track { background: transparent; }
    #${PANEL_ID} .ha-panel-scrollable::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
  `;
  document.head.appendChild(styleTag);

  // === Header (drag handle) ===
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #1a1a2e;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    cursor: grab;
    user-select: none;
    border-radius: 16px 16px 0 0;
    flex-shrink: 0;
  `;

  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="14" fill="url(#__ha_pg1)"/>
        <path d="M8 14.5L12 18.5L20 10.5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <defs><linearGradient id="__ha_pg1" x1="0" y1="0" x2="28" y2="28"><stop offset="0%" stop-color="#667eea"/><stop offset="100%" stop-color="#764ba2"/></linearGradient></defs>
      </svg>
      <div>
        <div style="font-size:14px;font-weight:800;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">HeuriLens</div>
        <div style="font-size:9px;color:#64748b;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">WCAG 2.1 + NIELSEN • ARRASTE PARA MOVER</div>
      </div>
    </div>
    <div style="display:flex;gap:6px;" id="__ha-panel-controls"></div>
  `;

  // Botão legendas
  const btnLegendPanel = document.createElement('button');
  btnLegendPanel.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.3"/><path d="M6 6.5a2 2 0 1 1 2.5 1.94c-.41.12-.5.38-.5.56v.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><circle cx="8" cy="12" r="0.7" fill="currentColor"/></svg>`;
  btnLegendPanel.style.cssText = `width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#94a3b8;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;`;
  btnLegendPanel.title = 'Guia de Legendas';

  // Botão minimizar
  const btnMinimize = document.createElement('button');
  btnMinimize.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  btnMinimize.style.cssText = `width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#94a3b8;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;`;
  btnMinimize.title = 'Minimizar';

  // Botão fechar
  const btnClose = document.createElement('button');
  btnClose.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  btnClose.style.cssText = `width:26px;height:26px;border-radius:50%;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#ef4444;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;`;
  btnClose.title = 'Fechar painel';

  header.querySelector('#__ha-panel-controls').appendChild(btnLegendPanel);
  header.querySelector('#__ha-panel-controls').appendChild(btnMinimize);
  header.querySelector('#__ha-panel-controls').appendChild(btnClose);

  // === Legend drawer ===
  let legendOpen = false;
  let savedBodyContent = '';

  function buildLegendHTML() {
    const NIELSEN = [
      { id: 'H1', name: 'Visibilidade do Status do Sistema', desc: 'O sistema deve informar o usuário sobre o que está acontecendo, com feedback apropriado e em tempo razoável.' },
      { id: 'H2', name: 'Correspondência com o Mundo Real', desc: 'O sistema deve usar linguagem familiar ao usuário, com palavras, frases e conceitos conhecidos.' },
      { id: 'H3', name: 'Controle e Liberdade do Usuário', desc: 'Usuários devem poder desfazer ações e sair de estados indesejados facilmente.' },
      { id: 'H4', name: 'Consistência e Padrões', desc: 'Palavras, situações e ações iguais devem ter os mesmos significados em todo o sistema.' },
      { id: 'H5', name: 'Prevenção de Erros', desc: 'O design deve prevenir erros antes que eles aconteçam, eliminando condições propícias a falhas.' },
      { id: 'H6', name: 'Reconhecimento em vez de Recordação', desc: 'Minimizar a carga de memória do usuário tornando opções e ações visíveis e acessíveis.' },
      { id: 'H7', name: 'Flexibilidade e Eficiência de Uso', desc: 'Atalhos e aceleradores para usuários experientes sem prejudicar iniciantes.' },
      { id: 'H8', name: 'Design Estético e Minimalista', desc: 'Interfaces não devem conter informações irrelevantes. Cada unidade extra compete com as relevantes.' },
      { id: 'H9', name: 'Reconhecimento e Recuperação de Erros', desc: 'Mensagens de erro devem ser claras, indicar o problema e sugerir uma solução construtiva.' },
      { id: 'H10', name: 'Ajuda e Documentação', desc: 'Pode ser necessário fornecer ajuda e documentação, fácil de buscar e focada na tarefa do usuário.' }
    ];

    const WCAG_LEVELS = [
      { badge: 'A', cls: 'a', name: 'Nível A — Essencial', desc: 'Requisitos básicos de acessibilidade. Sem eles, usuários com deficiência <strong>não conseguem</strong> usar o conteúdo. Ex: textos alternativos, navegação por teclado.' },
      { badge: 'AA', cls: 'aa', name: 'Nível AA — Recomendado', desc: 'Padrão adotado pela maioria das legislações (ex: LGPD, EN 301 549). Remove barreiras significativas. Ex: contraste mínimo 4.5:1, redimensionamento de texto.' },
      { badge: 'AAA', cls: 'aaa', name: 'Nível AAA — Ideal', desc: 'Máximo nível de acessibilidade. Difícil de atingir em todas as páginas, mas recomendado onde possível. Ex: contraste 7:1, linguagem de sinais em vídeos.' }
    ];

    const wcagColors = { a: 'linear-gradient(135deg,#22c55e,#16a34a)', aa: 'linear-gradient(135deg,#3b82f6,#2563eb)', aaa: 'linear-gradient(135deg,#a855f7,#7c3aed)' };

    let html = `
        <div style="margin-bottom:14px;">
          <button id="__ha-legend-back" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#94a3b8;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.2s;">
            ← Voltar
          </button>
        </div>

        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#64748b;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid rgba(255,255,255,0.06);">
          Níveis de Conformidade WCAG 2.1
        </div>`;

    WCAG_LEVELS.forEach(w => {
      html += `
            <div style="display:flex;align-items:flex-start;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.03);">
              <div style="width:28px;height:28px;border-radius:7px;background:${wcagColors[w.cls]};color:white;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;">${w.badge}</div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:11px;font-weight:700;color:#f1f5f9;margin-bottom:1px;">${w.name}</div>
                <div style="font-size:10px;color:#94a3b8;line-height:1.4;">${w.desc}</div>
              </div>
            </div>`;
    });

    html += `
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#64748b;margin:14px 0 8px;padding-bottom:5px;border-bottom:1px solid rgba(255,255,255,0.06);">
          Níveis de Severidade
        </div>`;

    ['critical', 'serious', 'moderate', 'minor'].forEach(lev => {
      const descs = { critical: 'Impede completamente o uso por pessoas com deficiência. Correção urgente.', serious: 'Causa dificuldade significativa. Funcionalidade comprometida para muitos usuários.', moderate: 'Causa alguma dificuldade. Impacta a experiência mas não impede o uso.', minor: 'Melhoria recomendada. Impacto baixo, mas contribui para uma experiência melhor.' };
      html += `
            <div style="display:flex;align-items:flex-start;gap:10px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.03);">
              <div style="width:12px;height:12px;border-radius:50%;background:${SEV[lev].color};flex-shrink:0;margin-top:3px;"></div>
              <div style="flex:1;"><div style="font-size:11px;font-weight:700;color:#f1f5f9;">${SEV[lev].label}</div><div style="font-size:10px;color:#94a3b8;line-height:1.3;">${descs[lev]}</div></div>
            </div>`;
    });

    html += `
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#64748b;margin:14px 0 8px;padding-bottom:5px;border-bottom:1px solid rgba(255,255,255,0.06);">
          Ícones por Tipo de Problema
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;">`;

    Object.entries(PANEL_RULE_ICONS).forEach(([key, ic]) => {
      html += `
            <div style="display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:5px;background:rgba(255,255,255,0.03);">
              <div style="width:20px;height:20px;border-radius:4px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;color:#94a3b8;flex-shrink:0;">${ic.svg}</div>
              <span style="font-size:10px;font-weight:600;color:#f1f5f9;">${ic.label}</span>
            </div>`;
    });

    html += `</div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#64748b;margin:14px 0 8px;padding-bottom:5px;border-bottom:1px solid rgba(255,255,255,0.06);">
          10 Heurísticas de Nielsen
        </div>`;

    NIELSEN.forEach(h => {
      html += `
            <div style="display:flex;align-items:flex-start;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.03);">
              <div style="width:26px;height:26px;border-radius:6px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;flex-shrink:0;">${h.id}</div>
              <div style="flex:1;">
                <div style="font-size:11px;font-weight:700;color:#f1f5f9;margin-bottom:1px;">${h.name}</div>
                <div style="font-size:10px;color:#94a3b8;line-height:1.3;">${h.desc}</div>
              </div>
            </div>`;
    });

    return html;
  }

  btnLegendPanel.addEventListener('click', () => {
    if (legendOpen) return;
    legendOpen = true;
    savedBodyContent = body.innerHTML;
    body.innerHTML = buildLegendHTML();
    body.scrollTop = 0;

    document.getElementById('__ha-legend-back')?.addEventListener('click', () => {
      legendOpen = false;
      body.innerHTML = savedBodyContent;
      // Re-bind event listeners for results
      bindResultActions();
    });
  });

  function bindResultActions() {
    body.querySelectorAll('.__ha-pnl-btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => { btn.style.background = btn.dataset.action === 'export' ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'rgba(255,255,255,0.08)'; });
      btn.addEventListener('mouseleave', () => { btn.style.background = btn.dataset.action === 'export' ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'rgba(255,255,255,0.04)'; });
      btn.addEventListener('click', () => {
        if (btn.dataset.action === 'reanalyze') {
          body.innerHTML = '<div style="text-align:center;padding:30px;"><div style="font-weight:600;">Reanalisando...</div></div>';
          chrome.runtime.sendMessage({ action: 'runAudit' }, (res) => {
            if (res && !res.error) { window.__heuristicAuditor_lastResults = res; renderResults(res); }
            else { body.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;">⚠️ ${res?.error || 'Erro'}</div>`; }
          });
        } else if (btn.dataset.action === 'overlay') {
          if (typeof window.__heuristicAuditor_toggleOverlay === 'function') {
            window.__heuristicAuditor_toggleOverlay();
          }
        } else if (btn.dataset.action === 'export') {
          chrome.runtime.sendMessage({ action: 'exportReport' }, (report) => {
            if (!report) return;
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `heuristic-audit-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            a.click();
            URL.revokeObjectURL(url);
          });
        }
      });
    });
    body.querySelectorAll('.__ha-hheader').forEach(hh => {
      hh.addEventListener('click', () => {
        const details = hh.nextElementSibling;
        const chev = hh.querySelector('.__ha-chev');
        const isOpen = details.style.maxHeight !== '0px' && details.style.maxHeight !== '';
        if (isOpen) { details.style.maxHeight = '0px'; chev.style.transform = ''; }
        else { details.style.maxHeight = details.scrollHeight + 'px'; chev.style.transform = 'rotate(180deg)'; }
      });
    });
  }

  // === Body ===
  const body = document.createElement('div');
  body.className = 'ha-panel-scrollable';
  body.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    min-height: 0;
  `;

  panel.appendChild(header);
  panel.appendChild(body);
  document.body.appendChild(panel);

  // === Drag & Drop ===
  let isDragging = false;
  let dragOffsetX = 0, dragOffsetY = 0;

  header.addEventListener('mousedown', (e) => {
    if (e.target.closest('button')) return;
    isDragging = true;
    dragOffsetX = e.clientX - panel.offsetLeft;
    dragOffsetY = e.clientY - panel.offsetTop;
    header.style.cursor = 'grabbing';
    panel.style.transition = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const x = Math.max(0, Math.min(window.innerWidth - 50, e.clientX - dragOffsetX));
    const y = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dragOffsetY));
    panel.style.left = x + 'px';
    panel.style.top = y + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    header.style.cursor = 'grab';
    panel.style.transition = '';
    // Salvar posição
    localStorage.setItem('__ha_panel_pos', JSON.stringify({
      x: parseInt(panel.style.left),
      y: parseInt(panel.style.top)
    }));
  });

  // === Minimize/Close ===
  let isMinimized = false;
  btnMinimize.addEventListener('click', () => {
    isMinimized = !isMinimized;
    body.style.display = isMinimized ? 'none' : '';
    panel.style.maxHeight = isMinimized ? 'auto' : '80vh';
    btnMinimize.innerHTML = isMinimized
      ? `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3" y="3" width="8" height="8" stroke="currentColor" stroke-width="1.5" rx="1"/></svg>`
      : `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    btnMinimize.title = isMinimized ? 'Expandir' : 'Minimizar';
  });

  btnClose.addEventListener('click', () => {
    panel.style.animation = 'none';
    panel.style.opacity = '0';
    panel.style.transform = 'scale(0.95)';
    panel.style.transition = 'all 0.2s ease';
    setTimeout(() => panel.remove(), 200);
  });

  // === Renderizar conteúdo ===
  function renderContent() {
    const results = window.__heuristicAuditor_lastResults;

    if (!results || !results.issues) {
      body.innerHTML = `
        <div style="text-align:center;padding:30px 20px;">
          <div style="font-size:32px;margin-bottom:12px;opacity:0.6;">🔍</div>
          <div style="color:#94a3b8;margin-bottom:16px;">Nenhuma auditoria realizada ainda.</div>
          <button id="__ha-panel-analyze" style="
            display:inline-flex;align-items:center;gap:8px;padding:10px 20px;
            background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;
            border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;
            box-shadow:0 4px 15px rgba(102,126,234,0.3);transition:all 0.2s;
          ">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" stroke-width="2"/><path d="M11.5 11.5L16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Analisar Página
          </button>
        </div>
      `;
      document.getElementById('__ha-panel-analyze')?.addEventListener('click', () => {
        body.innerHTML = `
          <div style="text-align:center;padding:30px;">
            <div style="display:flex;justify-content:center;gap:6px;margin-bottom:16px;">
              <div style="width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);animation:bounce 1.4s ease-in-out infinite;"></div>
              <div style="width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);animation:bounce 1.4s ease-in-out 0.2s infinite;"></div>
              <div style="width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);animation:bounce 1.4s ease-in-out 0.4s infinite;"></div>
            </div>
            <div style="font-weight:600;margin-bottom:4px;">Analisando a página...</div>
            <div style="font-size:11px;color:#64748b;">Executando axe-core e mapeando heurísticas</div>
          </div>
        `;
        chrome.runtime.sendMessage({ action: 'runAudit' }, (res) => {
          if (res && !res.error) {
            window.__heuristicAuditor_lastResults = res;
            renderResults(res);
          } else {
            body.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;">⚠️ ${res?.error || 'Erro desconhecido'}</div>`;
          }
        });
      });
      return;
    }

    renderResults(results);
  }

  function renderResults(results) {
    const s = results.summary || {};
    let html = `
      <!-- Severity cards -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px;">
        ${['critical', 'serious', 'moderate', 'minor'].map(level => `
          <div style="padding:10px 6px;border-radius:10px;text-align:center;background:${SEV[level].bg};border:1px solid rgba(255,255,255,0.06);position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;right:0;height:2px;background:${SEV[level].color};"></div>
            <div style="font-size:22px;font-weight:800;color:${SEV[level].color};line-height:1;">${s[level] || 0}</div>
            <div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;color:#94a3b8;">${SEV[level].label}</div>
          </div>
        `).join('')}
      </div>

      <!-- Stats -->
      <div style="display:flex;gap:6px;margin-bottom:14px;">
        <div style="flex:1;text-align:center;padding:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:8px;">
          <div style="font-size:14px;font-weight:700;">${s.totalNodes || 0}</div>
          <div style="font-size:9px;color:#64748b;">Instâncias</div>
        </div>
        <div style="flex:1;text-align:center;padding:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:8px;">
          <div style="font-size:14px;font-weight:700;">${results.passes || 0}</div>
          <div style="font-size:9px;color:#64748b;">Aprovados</div>
        </div>
        <div style="flex:1;text-align:center;padding:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:8px;">
          <div style="font-size:14px;font-weight:700;">${results.inapplicable || 0}</div>
          <div style="font-size:9px;color:#64748b;">N/A</div>
        </div>
      </div>

      <!-- Actions -->
      <div style="display:flex;gap:6px;margin-bottom:14px;">
        <button class="__ha-pnl-btn" data-action="reanalyze" style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#94a3b8;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:inherit;">
          ↻ Reanalisar
        </button>
        <button class="__ha-pnl-btn" data-action="overlay" style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#94a3b8;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:inherit;">
          ◉ Overlay
        </button>
        <button class="__ha-pnl-btn" data-action="export" style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:8px;background:linear-gradient(135deg,#667eea,#764ba2);border:none;border-radius:8px;color:white;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:inherit;box-shadow:0 2px 8px rgba(102,126,234,0.25);">
          ↓ JSON
        </button>
      </div>

      <!-- Issues header -->
      <div style="font-size:12px;font-weight:700;color:#f1f5f9;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.08);">
        Problemas por Heurística
      </div>
    `;

    // Issues by heuristic
    const byH = results.byHeuristic || {};
    const entries = Object.entries(byH).sort((a, b) => b[1].issues.length - a[1].issues.length);

    if (entries.length === 0) {
      html += `<div style="text-align:center;padding:20px;color:#22c55e;font-weight:600;">🎉 Nenhum problema encontrado!</div>`;
    }

    entries.forEach(([hId, data], idx) => {
      const h = data.heuristic || { id: hId, name: 'Não classificada' };
      const count = data.issues.length;

      html += `
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;margin-bottom:6px;overflow:hidden;" class="__ha-hgroup">
          <div class="__ha-hheader" style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;cursor:pointer;transition:background 0.2s;" data-idx="${idx}">
            <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">
              <div style="width:26px;height:26px;border-radius:7px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;flex-shrink:0;">${h.id || '?'}</div>
              <span style="font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${h.name || 'Sem categoria'}</span>
            </div>
            <span style="padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;background:rgba(255,255,255,0.06);color:#94a3b8;flex-shrink:0;margin-left:8px;">${count}</span>
            <svg class="__ha-chev" style="transition:transform 0.3s;color:#64748b;flex-shrink:0;margin-left:6px;" width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="__ha-hdetails" style="max-height:0;overflow:hidden;transition:max-height 0.3s ease;">
      `;

      data.issues.forEach(issue => {
        const sLevel = issue.severity?.level || 'minor';
        const icon = getIcon(issue.id);
        const wcag = (issue.wcagCriteria || []).map(c => `<span style="font-size:9px;padding:1px 5px;border-radius:3px;background:rgba(167,139,250,0.1);color:#a78bfa;font-weight:500;">WCAG ${c}</span>`).join(' ');
        const nCount = (issue.nodes || []).length;

        html += `
          <div style="padding:8px 12px;border-top:1px solid rgba(255,255,255,0.04);display:flex;align-items:flex-start;gap:8px;">
            <div style="width:24px;height:24px;border-radius:6px;background:${SEV[sLevel].color};color:white;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">${icon.svg}</div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:11px;line-height:1.4;margin-bottom:3px;">${esc(issue.help || issue.description || '')}</div>
              <div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;">
                <span style="font-size:9px;padding:1px 5px;border-radius:3px;background:rgba(103,232,249,0.1);color:#67e8f9;font-weight:600;text-transform:uppercase;letter-spacing:0.3px;">${icon.label}</span>
                ${wcag}
                <span style="font-size:9px;padding:1px 5px;border-radius:3px;background:rgba(255,255,255,0.04);color:#64748b;">${nCount} inst.</span>
              </div>
            </div>
          </div>
        `;
      });

      html += '</div></div>';
    });

    body.innerHTML = html;

    // Bind actions
    body.querySelectorAll('.__ha-pnl-btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => { btn.style.background = btn.dataset.action === 'export' ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'rgba(255,255,255,0.08)'; });
      btn.addEventListener('mouseleave', () => { btn.style.background = btn.dataset.action === 'export' ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'rgba(255,255,255,0.04)'; });

      btn.addEventListener('click', () => {
        if (btn.dataset.action === 'reanalyze') {
          body.innerHTML = '<div style="text-align:center;padding:30px;"><div style="font-weight:600;">Reanalisando...</div></div>';
          chrome.runtime.sendMessage({ action: 'runAudit' }, (res) => {
            if (res && !res.error) { window.__heuristicAuditor_lastResults = res; renderResults(res); }
            else { body.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;">⚠️ ${res?.error || 'Erro'}</div>`; }
          });
        } else if (btn.dataset.action === 'overlay') {
          if (typeof window.__heuristicAuditor_toggleOverlay === 'function') {
            window.__heuristicAuditor_toggleOverlay();
          }
        } else if (btn.dataset.action === 'export') {
          chrome.runtime.sendMessage({ action: 'exportReport' }, (report) => {
            if (!report) return;
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `heuristic-audit-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            a.click();
            URL.revokeObjectURL(url);
          });
        }
      });
    });

    // Expand/collapse heuristic groups
    body.querySelectorAll('.__ha-hheader').forEach(hh => {
      hh.addEventListener('click', () => {
        const details = hh.nextElementSibling;
        const chev = hh.querySelector('.__ha-chev');
        const isOpen = details.style.maxHeight !== '0px' && details.style.maxHeight !== '';
        if (isOpen) {
          details.style.maxHeight = '0px';
          chev.style.transform = '';
        } else {
          details.style.maxHeight = details.scrollHeight + 'px';
          chev.style.transform = 'rotate(180deg)';
        }
      });
    });
  }

  // Iniciar renderização
  renderContent();

  // Armazenar referência global
  window.__heuristicAuditor_panel = panel;
  window.__heuristicAuditor_lastResults = window.__heuristicAuditor_lastResults || null;
})();
