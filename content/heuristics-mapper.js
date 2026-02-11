/**
 * heuristics-mapper.js — Mapeamento de Regras axe-core → Heurísticas de Nielsen
 * 
 * Cada regra do axe-core é mapeada para uma ou mais das 10 Heurísticas de Usabilidade de Nielsen.
 * O mapeamento é baseado na natureza da falha e sua relação com princípios de usabilidade.
 */

(function () {
    'use strict';

    /**
     * As 10 Heurísticas de Usabilidade de Nielsen
     */
    const NIELSEN_HEURISTICS = {
        H1: {
            id: 'H1',
            name: 'Visibilidade do Status do Sistema',
            description: 'O sistema deve sempre manter os usuários informados sobre o que está acontecendo, através de feedback apropriado dentro de um tempo razoável.'
        },
        H2: {
            id: 'H2',
            name: 'Correspondência entre o Sistema e o Mundo Real',
            description: 'O sistema deve falar a linguagem dos usuários, com palavras, frases e conceitos familiares, seguindo convenções do mundo real.'
        },
        H3: {
            id: 'H3',
            name: 'Controle e Liberdade do Usuário',
            description: 'Usuários frequentemente escolhem funções por engano e precisam de uma "saída de emergência" claramente marcada.'
        },
        H4: {
            id: 'H4',
            name: 'Consistência e Padrões',
            description: 'Usuários não devem ter que adivinhar se palavras, situações ou ações diferentes significam a mesma coisa.'
        },
        H5: {
            id: 'H5',
            name: 'Prevenção de Erros',
            description: 'Melhor do que boas mensagens de erro é um design cuidadoso que previne que um problema ocorra.'
        },
        H6: {
            id: 'H6',
            name: 'Reconhecimento em vez de Recordação',
            description: 'Minimize a carga de memória do usuário tornando objetos, ações e opções visíveis.'
        },
        H7: {
            id: 'H7',
            name: 'Flexibilidade e Eficiência de Uso',
            description: 'Aceleradores — invisíveis para o usuário novato — podem frequentemente acelerar a interação para o usuário experiente.'
        },
        H8: {
            id: 'H8',
            name: 'Design Estético e Minimalista',
            description: 'Diálogos não devem conter informações irrelevantes ou raramente necessárias.'
        },
        H9: {
            id: 'H9',
            name: 'Ajudar Usuários a Reconhecer, Diagnosticar e Recuperar Erros',
            description: 'Mensagens de erro devem ser expressas em linguagem simples, indicar precisamente o problema e sugerir uma solução construtiva.'
        },
        H10: {
            id: 'H10',
            name: 'Ajuda e Documentação',
            description: 'Mesmo que o sistema possa ser usado sem documentação, pode ser necessário fornecer ajuda e documentação.'
        }
    };

    /**
     * Mapeamento de regras axe-core para Heurísticas de Nielsen.
     * A chave é o ID da regra no axe-core, o valor é o array de IDs de heurísticas.
     */
    const RULE_TO_HEURISTIC_MAP = {
        // --- H1: Visibilidade do Status do Sistema ---
        'aria-live-region': ['H1'],
        'aria-progressbar-name': ['H1'],
        'status-messages': ['H1'],

        // --- H2: Correspondência com o Mundo Real ---
        'document-title': ['H2'],
        'html-has-lang': ['H2'],
        'html-lang-valid': ['H2'],
        'html-xml-lang-mismatch': ['H2'],
        'valid-lang': ['H2'],
        'link-name': ['H2', 'H6'],
        'page-has-heading-one': ['H2', 'H4'],

        // --- H3: Controle e Liberdade do Usuário ---
        'tabindex': ['H3'],
        'focus-order-semantics': ['H3'],
        'focusable-content': ['H3'],
        'focusable-disabled': ['H3'],
        'focusable-no-name': ['H3', 'H6'],
        'frame-focusable-content': ['H3'],
        'no-autofocus': ['H3'],
        'scrollable-region-focusable': ['H3'],

        // --- H4: Consistência e Padrões ---
        'heading-order': ['H4'],
        'landmark-banner-is-top-level': ['H4'],
        'landmark-complementary-is-top-level': ['H4'],
        'landmark-contentinfo-is-top-level': ['H4'],
        'landmark-main-is-top-level': ['H4'],
        'landmark-navigation-is-top-level': ['H4'],
        'landmark-no-duplicate-banner': ['H4'],
        'landmark-no-duplicate-contentinfo': ['H4'],
        'landmark-no-duplicate-main': ['H4'],
        'landmark-one-main': ['H4'],
        'landmark-unique': ['H4'],
        'region': ['H4'],
        'definition-list': ['H4'],
        'dlitem': ['H4'],
        'list': ['H4'],
        'listitem': ['H4'],
        'table-duplicate-name': ['H4'],

        // --- H5: Prevenção de Erros ---
        'autocomplete-valid': ['H5'],
        'label': ['H5', 'H6'],
        'select-name': ['H5', 'H6'],
        'input-button-name': ['H5', 'H6'],
        'input-image-alt': ['H5', 'H10'],
        'form-field-multiple-labels': ['H5', 'H9'],

        // --- H6: Reconhecimento em vez de Recordação ---
        'aria-label': ['H6'],
        'aria-labelledby': ['H6'],
        'button-name': ['H6'],
        'area-alt': ['H6', 'H10'],
        'summary-name': ['H6'],
        'table-fake-caption': ['H6'],
        'td-has-header': ['H6'],
        'th-has-data-cells': ['H6'],
        'aria-command-name': ['H6'],
        'aria-input-field-name': ['H6'],
        'aria-meter-name': ['H6'],
        'aria-toggle-field-name': ['H6'],
        'aria-tooltip-name': ['H6'],
        'aria-treeitem-name': ['H6'],

        // --- H7: Flexibilidade e Eficiência de Uso ---
        'accesskeys': ['H7'],
        'bypass': ['H7'],
        'skip-link': ['H7'],
        'meta-viewport': ['H7', 'H8'],
        'meta-viewport-large': ['H7'],
        'target-size': ['H7'],

        // --- H8: Design Estético e Minimalista ---
        'color-contrast': ['H8'],
        'color-contrast-enhanced': ['H8'],
        'link-in-text-block': ['H8'],
        'presentation-role-conflict': ['H8'],
        'empty-heading': ['H8', 'H4'],
        'empty-table-header': ['H8', 'H4'],
        'marquee': ['H8'],
        'blink': ['H8'],

        // --- H9: Reconhecimento e Recuperação de Erros ---
        'aria-required-attr': ['H9'],
        'aria-required-children': ['H9'],
        'aria-required-parent': ['H9'],
        'aria-valid-attr': ['H9'],
        'aria-valid-attr-value': ['H9'],
        'aria-allowed-attr': ['H9'],
        'aria-allowed-role': ['H9'],
        'aria-deprecated-role': ['H9'],
        'aria-dialog-name': ['H9'],
        'aria-hidden-body': ['H9'],
        'aria-hidden-focus': ['H9'],
        'aria-roles': ['H9'],
        'aria-text': ['H9'],
        'duplicate-id-aria': ['H9'],
        'nested-interactive': ['H9'],

        // --- H10: Ajuda e Documentação ---
        'image-alt': ['H10'],
        'image-redundant-alt': ['H10'],
        'role-img-alt': ['H10'],
        'svg-img-alt': ['H10'],
        'frame-title': ['H10'],
        'frame-title-unique': ['H10'],
        'object-alt': ['H10'],
        'video-caption': ['H10'],
        'audio-caption': ['H10'],
        'video-description': ['H10'],
        'meta-refresh': ['H10', 'H3'],
        'scope-attr-valid': ['H10'],
        'server-side-image-map': ['H10'],
        'iframe-title': ['H10'],
        'no-autoplay-audio': ['H10', 'H3'],
        'identical-links-same-purpose': ['H10', 'H4'],
        'label-title-only': ['H10', 'H5']
    };

    /**
     * Mapeia uma violação do axe-core para as heurísticas de Nielsen correspondentes.
     * @param {Object} violation - Objeto de violação do axe-core
     * @returns {Object} Heurística principal associada
     */
    function mapViolationToHeuristic(violation) {
        const ruleId = violation.id;
        const heuristicIds = RULE_TO_HEURISTIC_MAP[ruleId];

        if (heuristicIds && heuristicIds.length > 0) {
            return {
                primary: NIELSEN_HEURISTICS[heuristicIds[0]],
                all: heuristicIds.map(id => NIELSEN_HEURISTICS[id])
            };
        }

        // Fallback: tentar inferir a heurística pelo tipo de impacto e tags
        return inferHeuristicFromTags(violation);
    }

    /**
     * Infere a heurística de Nielsen com base nas tags WCAG da violação.
     * @param {Object} violation - Objeto de violação do axe-core
     * @returns {Object} Heurística inferida
     */
    function inferHeuristicFromTags(violation) {
        const tags = violation.tags || [];

        // Mapeamento de tags WCAG para heurísticas
        const tagPatterns = [
            { pattern: /perceivable/i, heuristic: 'H8' },
            { pattern: /operable/i, heuristic: 'H3' },
            { pattern: /understandable/i, heuristic: 'H2' },
            { pattern: /robust/i, heuristic: 'H9' },
            { pattern: /wcag1[1-4]/i, heuristic: 'H8' },  // Perceivable
            { pattern: /wcag2[1-4]/i, heuristic: 'H3' },  // Operable
            { pattern: /wcag3[1-3]/i, heuristic: 'H2' },  // Understandable
            { pattern: /wcag4[1]/i, heuristic: 'H9' }     // Robust
        ];

        for (const tag of tags) {
            for (const { pattern, heuristic } of tagPatterns) {
                if (pattern.test(tag)) {
                    return {
                        primary: NIELSEN_HEURISTICS[heuristic],
                        all: [NIELSEN_HEURISTICS[heuristic]]
                    };
                }
            }
        }

        // Fallback final: H10 (Ajuda e Documentação)
        return {
            primary: NIELSEN_HEURISTICS['H10'],
            all: [NIELSEN_HEURISTICS['H10']]
        };
    }

    /**
     * Extrai os critérios WCAG de uma violação do axe-core.
     * @param {Object} violation - Objeto de violação do axe-core
     * @returns {Array} Lista de critérios WCAG
     */
    function extractWcagCriteria(violation) {
        const tags = violation.tags || [];
        const wcagCriteria = [];

        for (const tag of tags) {
            // Padrão: wcag111, wcag143, etc.
            const match = tag.match(/^wcag(\d)(\d)(\d+)$/);
            if (match) {
                wcagCriteria.push(`${match[1]}.${match[2]}.${match[3]}`);
            }
        }

        return wcagCriteria;
    }

    /**
     * Extrai o nível WCAG (A, AA, AAA) de uma violação.
     * @param {Object} violation - Objeto de violação do axe-core
     * @returns {string} Nível WCAG
     */
    function extractWcagLevel(violation) {
        const tags = violation.tags || [];

        if (tags.includes('wcag2aaa')) return 'AAA';
        if (tags.includes('wcag2aa') || tags.includes('wcag21aa')) return 'AA';
        if (tags.includes('wcag2a') || tags.includes('wcag21a')) return 'A';

        return '';
    }

    // Exportar para escopo global
    window.__heuristicAuditor_mapper = {
        NIELSEN_HEURISTICS,
        mapViolationToHeuristic,
        extractWcagCriteria,
        extractWcagLevel
    };
})();
