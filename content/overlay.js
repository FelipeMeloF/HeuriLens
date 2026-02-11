/**
 * overlay.js — Overlay Visual de Alertas no DOM
 * 
 * Injeta ícones de alerta diretamente sobre os elementos problemáticos
 * da página ativa, usando getBoundingClientRect para posicionamento.
 * Cada tipo de problema possui um ícone SVG distinto, inspirado no WAVE.
 */

(function () {
    'use strict';

    const OVERLAY_CONTAINER_ID = '__heuristic-auditor-overlay';
    const TOOLTIP_CLASS = '__ha-tooltip';
    const BADGE_CLASS = '__ha-badge';

    let isOverlayVisible = false;

    /**
     * Cores por nível de severidade.
     */
    const SEVERITY_COLORS = {
        critical: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'Crítico', emoji: '🔴' },
        serious: { color: '#ea580c', bg: '#fff7ed', border: '#fdba74', label: 'Sério', emoji: '🟠' },
        moderate: { color: '#ca8a04', bg: '#fefce8', border: '#fde047', label: 'Moderado', emoji: '🟡' },
        minor: { color: '#2563eb', bg: '#eff6ff', border: '#93c5fd', label: 'Menor', emoji: '🔵' }
    };

    /**
     * Ícones SVG para cada categoria de problema — estilo WAVE.
     * Cada ícone é desenhado em 24x24 viewBox para máxima nitidez.
     */
    const ISSUE_ICONS = {
        // Imagem sem alt / alternativa de texto
        'image-alt': {
            label: 'Img Alt',
            svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="white" stroke-width="1.5"/><circle cx="8" cy="10" r="2" fill="white"/><path d="M2 17l5-5 3 3 4-4 8 8" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="1" y1="23" x2="23" y2="1" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`
        },
        'role-img-alt': { alias: 'image-alt' },
        'svg-img-alt': { alias: 'image-alt' },
        'input-image-alt': { alias: 'image-alt' },
        'image-redundant-alt': { alias: 'image-alt' },
        'area-alt': { alias: 'image-alt' },
        'object-alt': { alias: 'image-alt' },

        // Contraste de cor
        'color-contrast': {
            label: 'Contraste',
            svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="1.5"/><path d="M12 2a10 10 0 0 1 0 20" fill="white"/><path d="M9 9l6 6M15 9l-6 6" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/></svg>`
        },
        'color-contrast-enhanced': { alias: 'color-contrast' },
        'link-in-text-block': { alias: 'color-contrast' },

        // Label de formulário
        'label': {
            label: 'Label',
            svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="white" stroke-width="1.5"/><path d="M7 9h4M7 13h8" stroke="white" stroke-width="1.5" stroke-linecap="round"/><circle cx="18" cy="17" r="4" fill="white" opacity="0.9"/><text x="18" y="19.5" text-anchor="middle" fill="currentColor" font-size="7" font-weight="bold">?</text></svg>`
        },
        'select-name': { alias: 'label' },
        'input-button-name': { alias: 'label' },
        'form-field-multiple-labels': { alias: 'label' },
        'label-title-only': { alias: 'label' },
        'autocomplete-valid': { alias: 'label' },

        // Heading / Cabeçalho
        'heading-order': {
            label: 'Heading',
            svg: `<svg viewBox="0 0 24 24" fill="none"><text x="4" y="17" fill="white" font-size="16" font-weight="900" font-family="Arial">H</text><path d="M17 6v12M17 6l4 4M17 6l-4 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        },
        'empty-heading': { alias: 'heading-order' },
        'page-has-heading-one': { alias: 'heading-order' },
        'empty-table-header': { alias: 'heading-order' },

        // Link
        'link-name': {
            label: 'Link',
            svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M10 13a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1.5 1.5" stroke="white" stroke-width="1.8" stroke-linecap="round"/><path d="M14 11a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1.5-1.5" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>`
        },
        'identical-links-same-purpose': { alias: 'link-name' },

        // ARIA
        'aria-required-attr': {
            label: 'ARIA',
            svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="1.5"/><path d="M12 7a3 3 0 0 1 3 3c0 1.66-3 3-3 3" stroke="white" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="white"/></svg>`
        },
        'aria-required-children': { alias: 'aria-required-attr' },
        'aria-required-parent': { alias: 'aria-required-attr' },
        'aria-valid-attr': { alias: 'aria-required-attr' },
        'aria-valid-attr-value': { alias: 'aria-required-attr' },
        'aria-allowed-attr': { alias: 'aria-required-attr' },
        'aria-allowed-role': { alias: 'aria-required-attr' },
        'aria-deprecated-role': { alias: 'aria-required-attr' },
        'aria-dialog-name': { alias: 'aria-required-attr' },
        'aria-hidden-body': { alias: 'aria-required-attr' },
        'aria-hidden-focus': { alias: 'aria-required-attr' },
        'aria-roles': { alias: 'aria-required-attr' },
        'aria-text': { alias: 'aria-required-attr' },
        'aria-label': { alias: 'aria-required-attr' },
        'aria-labelledby': { alias: 'aria-required-attr' },
        'aria-command-name': { alias: 'aria-required-attr' },
        'aria-input-field-name': { alias: 'aria-required-attr' },
        'aria-meter-name': { alias: 'aria-required-attr' },
        'aria-toggle-field-name': { alias: 'aria-required-attr' },
        'aria-tooltip-name': { alias: 'aria-required-attr' },
        'aria-treeitem-name': { alias: 'aria-required-attr' },
        'aria-progressbar-name': { alias: 'aria-required-attr' },
        'aria-live-region': { alias: 'aria-required-attr' },
        'status-messages': { alias: 'aria-required-attr' },
        'duplicate-id-aria': { alias: 'aria-required-attr' },

        // Teclado / Foco
        'tabindex': {
            label: 'Teclado',
            svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="13" rx="2" stroke="white" stroke-width="1.5"/><rect x="5" y="9" width="3" height="2" rx="0.5" fill="white"/><rect x="10" y="9" width="3" height="2" rx="0.5" fill="white"/><rect x="15" y="9" width="4" height="2" rx="0.5" fill="white"/><rect x="5" y="13" width="14" height="2" rx="0.5" fill="white"/></svg>`
        },
        'focus-order-semantics': { alias: 'tabindex' },
        'focusable-content': { alias: 'tabindex' },
        'focusable-disabled': { alias: 'tabindex' },
        'focusable-no-name': { alias: 'tabindex' },
        'frame-focusable-content': { alias: 'tabindex' },
        'no-autofocus': { alias: 'tabindex' },
        'scrollable-region-focusable': { alias: 'tabindex' },
        'nested-interactive': { alias: 'tabindex' },

        // Landmark / Estrutura
        'landmark-one-main': {
            label: 'Landmark',
            svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="4" rx="1" stroke="white" stroke-width="1.5"/><rect x="3" y="10" width="10" height="8" rx="1" stroke="white" stroke-width="1.5"/><rect x="15" y="10" width="6" height="8" rx="1" stroke="white" stroke-width="1.5"/><rect x="3" y="20" width="18" height="2" rx="0.5" fill="white" opacity="0.6"/></svg>`
        },
        'landmark-banner-is-top-level': { alias: 'landmark-one-main' },
        'landmark-complementary-is-top-level': { alias: 'landmark-one-main' },
        'landmark-contentinfo-is-top-level': { alias: 'landmark-one-main' },
        'landmark-main-is-top-level': { alias: 'landmark-one-main' },
        'landmark-navigation-is-top-level': { alias: 'landmark-one-main' },
        'landmark-no-duplicate-banner': { alias: 'landmark-one-main' },
        'landmark-no-duplicate-contentinfo': { alias: 'landmark-one-main' },
        'landmark-no-duplicate-main': { alias: 'landmark-one-main' },
        'landmark-unique': { alias: 'landmark-one-main' },
        'region': { alias: 'landmark-one-main' },

        // Idioma / Linguagem
        'html-has-lang': {
            label: 'Idioma',
            svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="4" ry="10" stroke="white" stroke-width="1.2"/><path d="M2 12h20" stroke="white" stroke-width="1.2"/><path d="M4 7h16M4 17h16" stroke="white" stroke-width="1" opacity="0.7"/></svg>`
        },
        'html-lang-valid': { alias: 'html-has-lang' },
        'html-xml-lang-mismatch': { alias: 'html-has-lang' },
        'valid-lang': { alias: 'html-has-lang' },

        // Documento / Título
        'document-title': {
            label: 'Documento',
            svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="white" stroke-width="1.5"/><path d="M14 2v6h6" stroke="white" stroke-width="1.5"/><path d="M8 13h8M8 17h5" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>`
        },

        // Tabela
        'td-has-header': {
            label: 'Tabela',
            svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="white" stroke-width="1.5"/><path d="M3 9h18M3 15h18M9 3v18" stroke="white" stroke-width="1.5"/></svg>`
        },
        'th-has-data-cells': { alias: 'td-has-header' },
        'table-duplicate-name': { alias: 'td-has-header' },
        'table-fake-caption': { alias: 'td-has-header' },
        'scope-attr-valid': { alias: 'td-has-header' },

        // Mídia / Vídeo / Áudio
        'video-caption': {
            label: 'Mídia',
            svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="15" height="13" rx="2" stroke="white" stroke-width="1.5"/><path d="M17 8l5-3v13l-5-3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="4" y="14" width="5" height="2" rx="0.5" fill="white" opacity="0.8"/><text x="5" y="15.5" fill="currentColor" font-size="3" font-weight="bold">CC</text></svg>`
        },
        'audio-caption': { alias: 'video-caption' },
        'video-description': { alias: 'video-caption' },
        'no-autoplay-audio': { alias: 'video-caption' },

        // Frame / Iframe
        'frame-title': {
            label: 'Frame',
            svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="white" stroke-width="1.5"/><path d="M2 8h20" stroke="white" stroke-width="1.5"/><circle cx="5" cy="5.5" r="1" fill="white"/><circle cx="8" cy="5.5" r="1" fill="white"/><circle cx="11" cy="5.5" r="1" fill="white"/><rect x="5" y="11" width="14" height="7" rx="1" stroke="white" stroke-width="1" stroke-dasharray="2 2"/></svg>`
        },
        'frame-title-unique': { alias: 'frame-title' },
        'iframe-title': { alias: 'frame-title' },

        // Botão
        'button-name': {
            label: 'Botão',
            svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="10" rx="5" stroke="white" stroke-width="1.5"/><circle cx="12" cy="12" r="3" fill="white" opacity="0.9"/></svg>`
        },
        'summary-name': { alias: 'button-name' },

        // Lista
        'list': {
            label: 'Lista',
            svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="5" cy="6" r="1.5" fill="white"/><path d="M9 6h12" stroke="white" stroke-width="1.5" stroke-linecap="round"/><circle cx="5" cy="12" r="1.5" fill="white"/><path d="M9 12h12" stroke="white" stroke-width="1.5" stroke-linecap="round"/><circle cx="5" cy="18" r="1.5" fill="white"/><path d="M9 18h12" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>`
        },
        'listitem': { alias: 'list' },
        'definition-list': { alias: 'list' },
        'dlitem': { alias: 'list' },

        // Skip / Atalho
        'bypass': {
            label: 'Skip Nav',
            svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="white" stroke-width="1.8" stroke-linecap="round"/><path d="M13 6l6 6-6 6" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 6v12" stroke="white" stroke-width="1.8" stroke-linecap="round" opacity="0.5"/></svg>`
        },
        'skip-link': { alias: 'bypass' },
        'accesskeys': { alias: 'bypass' },

        // Viewport / Responsivo
        'meta-viewport': {
            label: 'Viewport',
            svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" stroke="white" stroke-width="1.5"/><path d="M5 18h14" stroke="white" stroke-width="1.2"/><circle cx="12" cy="20" r="0.5" fill="white"/><path d="M9 8l3-2 3 2M9 14l3 2 3-2" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        },
        'meta-viewport-large': { alias: 'meta-viewport' },
        'target-size': { alias: 'meta-viewport' },

        // Animação / Motion
        'marquee': {
            label: 'Animação',
            svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="1.5"/><path d="M12 8v4l2 2" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        },
        'blink': { alias: 'marquee' },
        'meta-refresh': { alias: 'marquee' },

        // Semântica / Role conflict
        'presentation-role-conflict': {
            label: 'Semântica',
            svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h10" stroke="white" stroke-width="1.5" stroke-linecap="round"/><path d="M17 14l4 4m0-4l-4 4" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>`
        },

        // Image map (server-side)
        'server-side-image-map': {
            label: 'Map',
            svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="white" stroke-width="1.5"/><circle cx="12" cy="9" r="2.5" fill="white"/></svg>`
        }
    };

    /**
     * Ícone genérico fallback quando nenhum tipo específico é encontrado.
     */
    const FALLBACK_ICON = {
        label: 'Problema',
        svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 20h20L12 2z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 10v4" stroke="white" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="white"/></svg>`
    };

    /**
     * Retorna o ícone SVG e label para um dado ID de regra.
     */
    function getIconForRule(ruleId) {
        let entry = ISSUE_ICONS[ruleId];
        if (!entry) return FALLBACK_ICON;

        // Resolver alias
        while (entry.alias) {
            entry = ISSUE_ICONS[entry.alias];
            if (!entry) return FALLBACK_ICON;
        }
        return entry;
    }

    /**
     * Cria o container principal do overlay.
     */
    function createOverlayContainer() {
        let container = document.getElementById(OVERLAY_CONTAINER_ID);
        if (container) {
            container.innerHTML = '';
            return container;
        }

        container = document.createElement('div');
        container.id = OVERLAY_CONTAINER_ID;
        container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2147483647;
    `;
        document.body.appendChild(container);
        return container;
    }

    /**
     * Cria um badge de alerta sobre um elemento problemático.
     */
    function createBadge(issue, targetElement, container) {
        if (!targetElement || !targetElement.getBoundingClientRect) return;

        const rect = targetElement.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        const sev = SEVERITY_COLORS[issue.severity?.level] || SEVERITY_COLORS.minor;
        const icon = getIconForRule(issue.id);

        // Badge container (retângulo arredondado com ícone + label)
        const badge = document.createElement('div');
        badge.className = BADGE_CLASS;
        badge.dataset.severity = issue.severity?.level || 'minor';
        badge.dataset.ruleId = issue.id || '';
        badge.dataset.targetSelector = issue.targetSelector || '';
        badge.style.cssText = `
      position: fixed;
      top: ${rect.top - 12}px;
      left: ${rect.left + rect.width - 12}px;
      height: 26px;
      padding: 0 8px 0 4px;
      border-radius: 13px;
      background: ${sev.color};
      color: white;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 10px;
      font-weight: 700;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      cursor: pointer;
      pointer-events: all;
      box-shadow: 0 2px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
      z-index: 2147483647;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      animation: __ha-pulse 2.5s ease-in-out infinite;
      white-space: nowrap;
      line-height: 1;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      border: 1.5px solid rgba(255,255,255,0.25);
    `;

        // SVG icon
        const iconEl = document.createElement('span');
        iconEl.style.cssText = `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    `;
        iconEl.innerHTML = icon.svg;

        // Label text
        const labelEl = document.createElement('span');
        labelEl.textContent = icon.label;

        badge.appendChild(iconEl);
        badge.appendChild(labelEl);
        badge.title = `${sev.label}: ${issue.description || ''}`;

        // Hover interactions
        badge.addEventListener('mouseenter', () => {
            badge.style.transform = 'scale(1.15)';
            badge.style.boxShadow = `0 4px 20px rgba(0,0,0,0.45), 0 0 0 3px ${sev.color}44`;
            badge.style.zIndex = '2147483647';
            targetElement.style.outline = `3px solid ${sev.color}`;
            targetElement.style.outlineOffset = '2px';
            showTooltip(badge, issue, sev, icon);
        });

        badge.addEventListener('mouseleave', () => {
            badge.style.transform = 'scale(1)';
            badge.style.boxShadow = '0 2px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)';
            targetElement.style.outline = '';
            targetElement.style.outlineOffset = '';
            hideTooltip();
        });

        container.appendChild(badge);
    }

    /**
     * Mostra um tooltip detalhado com informações da falha.
     */
    function showTooltip(badge, issue, sev, icon) {
        hideTooltip();

        const tooltip = document.createElement('div');
        tooltip.className = TOOLTIP_CLASS;

        const badgeTop = parseInt(badge.style.top);
        const badgeLeft = parseInt(badge.style.left);

        tooltip.style.cssText = `
      position: fixed;
      top: ${badgeTop + 32}px;
      left: ${Math.max(10, badgeLeft - 120)}px;
      width: 300px;
      background: ${sev.bg};
      border: 2px solid ${sev.border};
      border-radius: 12px;
      padding: 14px 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      color: #1e293b;
      pointer-events: all;
      z-index: 2147483647;
      box-shadow: 0 8px 30px rgba(0,0,0,0.18);
      animation: __ha-fadeIn 0.2s ease;
    `;

        const heuristicName = issue.nielsenHeuristic?.name || 'Não mapeada';
        const heuristicId = issue.nielsenHeuristic?.id || '';
        const wcagCriteria = (issue.wcagCriteria || []).join(', ') || 'N/A';
        const wcagLevel = issue.wcagLevel ? ` (${issue.wcagLevel})` : '';

        tooltip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <div style="width:28px;height:28px;border-radius:8px;background:${sev.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:${sev.color};">
          ${icon.svg.replace('stroke="white"', `stroke="white"`)}
        </div>
        <div>
          <div style="font-weight:800;color:${sev.color};font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">
            ${sev.label} — ${icon.label}
          </div>
          <div style="font-size:10px;color:#94a3b8;font-weight:600;">
            Regra: ${issue.id || 'N/A'}
          </div>
        </div>
      </div>
      <div style="margin-bottom:8px;line-height:1.5;font-size:12px;">${issue.description || 'Sem descrição'}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;font-size:11px;color:#64748b;border-top:1px solid ${sev.border};padding-top:8px;">
        <div><strong>Heurística:</strong></div>
        <div>${heuristicId ? heuristicId + ' — ' : ''}${heuristicName}</div>
        <div><strong>WCAG:</strong></div>
        <div>${wcagCriteria}${wcagLevel}</div>
        <div><strong>Instâncias:</strong></div>
        <div>${issue.severity?.frequency || 1}</div>
        <div><strong>Impacto:</strong></div>
        <div style="text-transform:capitalize;">${issue.severity?.impact || 'N/A'}</div>
      </div>
    `;

        document.getElementById(OVERLAY_CONTAINER_ID)?.appendChild(tooltip);
    }

    /**
     * Esconde o tooltip ativo.
     */
    function hideTooltip() {
        const tooltips = document.querySelectorAll(`.${TOOLTIP_CLASS}`);
        tooltips.forEach(t => t.remove());
    }

    /**
     * Renderiza o overlay com todos os badges de alerta.
     */
    function renderOverlay(issues) {
        removeOverlay();
        if (!issues || issues.length === 0) return;

        const container = createOverlayContainer();
        isOverlayVisible = true;

        for (const issue of issues) {
            const nodes = issue.nodes || [];
            for (const node of nodes) {
                const selector = (node.target || [])[0];
                if (!selector) continue;

                try {
                    const targetElement = document.querySelector(selector);
                    if (targetElement) {
                        createBadge({
                            ...issue,
                            targetSelector: selector
                        }, targetElement, container);
                    }
                } catch (e) {
                    // Seletor inválido, ignorar
                }
            }
        }

        startRepositioning(issues);
    }

    /**
     * Reposiciona badges ao scroll/resize.
     */
    function startRepositioning(issues) {
        stopRepositioning();

        const repositionAll = () => {
            if (!isOverlayVisible) return;
            const badges = document.querySelectorAll(`.${BADGE_CLASS}`);
            badges.forEach(badge => {
                const selector = badge.dataset.targetSelector;
                if (!selector) return;
                try {
                    const el = document.querySelector(selector);
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        badge.style.top = `${rect.top - 12}px`;
                        badge.style.left = `${rect.left + rect.width - 12}px`;
                    }
                } catch (e) { /* ignore */ }
            });
        };

        window.addEventListener('scroll', repositionAll, { passive: true });
        window.addEventListener('resize', repositionAll, { passive: true });

        window.__ha_repositionCleanup = () => {
            window.removeEventListener('scroll', repositionAll);
            window.removeEventListener('resize', repositionAll);
        };
    }

    function stopRepositioning() {
        if (window.__ha_repositionCleanup) {
            window.__ha_repositionCleanup();
            window.__ha_repositionCleanup = null;
        }
    }

    function removeOverlay() {
        const container = document.getElementById(OVERLAY_CONTAINER_ID);
        if (container) container.remove();
        hideTooltip();
        stopRepositioning();
        isOverlayVisible = false;
    }

    function toggleOverlay() {
        if (isOverlayVisible) {
            removeOverlay();
        } else if (window.__heuristicAuditor_lastIssues) {
            renderOverlay(window.__heuristicAuditor_lastIssues);
        }
        return isOverlayVisible;
    }

    // Exportar
    window.__heuristicAuditor_overlay = { renderOverlay, removeOverlay, toggleOverlay };
    window.__heuristicAuditor_toggleOverlay = toggleOverlay;
})();
