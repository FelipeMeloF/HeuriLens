/**
 * severity-calculator.js — Classificação de Severidade de Defeitos
 * 
 * Categoriza defeitos em 4 níveis: Crítico, Sério, Moderado e Menor.
 * A severidade é calculada com base no impacto do axe-core, frequência
 * do erro e criticidade da tarefa para o usuário.
 */

(function () {
    'use strict';

    /**
     * Definição dos níveis de severidade.
     */
    const SEVERITY_LEVELS = {
        CRITICAL: {
            level: 'critical',
            label: 'Crítico',
            score: 4,
            color: '#dc2626',
            icon: '🔴',
            description: 'Impede o uso por pessoas com deficiência. Correção imediata necessária.'
        },
        SERIOUS: {
            level: 'serious',
            label: 'Sério',
            score: 3,
            color: '#ea580c',
            icon: '🟠',
            description: 'Causa dificuldade significativa. Deve ser corrigido com alta prioridade.'
        },
        MODERATE: {
            level: 'moderate',
            label: 'Moderado',
            score: 2,
            color: '#ca8a04',
            icon: '🟡',
            description: 'Causa alguma dificuldade. Deve ser corrigido em próximas iterações.'
        },
        MINOR: {
            level: 'minor',
            label: 'Menor',
            score: 1,
            color: '#2563eb',
            icon: '🔵',
            description: 'Impacto baixo, mas pode ser melhorado para acessibilidade ideal.'
        }
    };

    /**
     * Elementos e contextos considerados de alta criticidade para tarefas do usuário.
     * Erros nesses contextos recebem peso maior na classificação.
     */
    const CRITICAL_TASK_SELECTORS = [
        'form', 'input', 'select', 'textarea', 'button',
        'nav', '[role="navigation"]',
        '[role="dialog"]', '[role="alertdialog"]', 'dialog',
        '[role="search"]',
        '[role="main"]', 'main',
        'a[href]', '[role="link"]',
        '[role="menu"]', '[role="menubar"]',
        'table', '[role="table"]', '[role="grid"]',
        '[type="submit"]', '[type="reset"]',
        '[role="alert"]', '[role="status"]',
        'header', 'footer',
        '[role="banner"]', '[role="contentinfo"]'
    ];

    /**
     * Peso dos impactos do axe-core (escala de 1 a 4).
     */
    const IMPACT_WEIGHTS = {
        critical: 4,
        serious: 3,
        moderate: 2,
        minor: 1
    };

    /**
     * Verifica se algum nó da violação está em um contexto de tarefa crítica.
     * @param {Array} nodes - Nós da violação do axe-core
     * @returns {boolean} true se estiver em contexto crítico
     */
    function isInCriticalContext(nodes) {
        if (!nodes || nodes.length === 0) return false;

        for (const node of nodes) {
            const target = node.target || [];
            const html = (node.html || '').toLowerCase();

            // Verificar pelo HTML do elemento
            for (const selector of CRITICAL_TASK_SELECTORS) {
                const tagName = selector.replace(/\[.*\]/, '').toLowerCase();
                if (tagName && html.includes(`<${tagName}`)) {
                    return true;
                }
            }

            // Verificar por roles e atributos
            if (html.includes('role=') || html.includes('type="submit"') ||
                html.includes('type="reset"') || html.includes('href=')) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calcula a severidade de uma violação.
     * 
     * Algoritmo:
     * 1. Base: impacto do axe-core (critical=4, serious=3, moderate=2, minor=1)
     * 2. Frequência: multiplica o peso se frequency >= threshold
     * 3. Contexto: aumenta se o erro está em elemento de tarefa crítica
     * 
     * @param {Object} violation - Violação do axe-core
     * @returns {Object} Informação de severidade calculada
     */
    function calculateSeverity(violation) {
        const impact = violation.impact || 'minor';
        const frequency = (violation.nodes || []).length;
        const impactWeight = IMPACT_WEIGHTS[impact] || 1;
        const inCriticalContext = isInCriticalContext(violation.nodes);

        // Cálculo do score final
        let finalScore = impactWeight;

        // Bônus por frequência alta
        if (frequency >= 10) {
            finalScore += 1.5;
        } else if (frequency >= 5) {
            finalScore += 1;
        } else if (frequency >= 3) {
            finalScore += 0.5;
        }

        // Bônus por contexto crítico
        if (inCriticalContext) {
            finalScore += 0.5;
        }

        // Determinar nível de severidade
        let severity;
        if (finalScore >= 4) {
            severity = SEVERITY_LEVELS.CRITICAL;
        } else if (finalScore >= 3) {
            severity = SEVERITY_LEVELS.SERIOUS;
        } else if (finalScore >= 2) {
            severity = SEVERITY_LEVELS.MODERATE;
        } else {
            severity = SEVERITY_LEVELS.MINOR;
        }

        return {
            ...severity,
            impact: impact,
            frequency: frequency,
            inCriticalContext: inCriticalContext,
            rawScore: finalScore
        };
    }

    /**
     * Calcula o resumo de severidades para um conjunto de violações.
     * @param {Array} violations - Lista de violações processadas
     * @returns {Object} Contagens por nível de severidade
     */
    function calculateSummary(violations) {
        const summary = {
            total: violations.length,
            critical: 0,
            serious: 0,
            moderate: 0,
            minor: 0,
            totalNodes: 0
        };

        for (const violation of violations) {
            const level = violation.severity?.level || 'minor';
            summary[level] = (summary[level] || 0) + 1;
            summary.totalNodes += (violation.nodes || []).length;
        }

        return summary;
    }

    // Exportar para escopo global
    window.__heuristicAuditor_severity = {
        SEVERITY_LEVELS,
        calculateSeverity,
        calculateSummary
    };
})();
