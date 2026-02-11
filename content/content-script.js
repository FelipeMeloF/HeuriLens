/**
 * content-script.js — Orquestrador Principal da Auditoria
 * 
 * Executa o axe-core, processa os resultados com o mapeador de heurísticas
 * e o calculador de severidade, e aciona o overlay visual.
 */

(function () {
    'use strict';

    /**
     * Executa a auditoria completa na página atual.
     * @returns {Object} Resultados processados da auditoria
     */
    async function runAudit() {
        try {
            // Verificar se axe-core está disponível
            if (typeof axe === 'undefined') {
                return { error: 'axe-core não está carregado.' };
            }

            // Verificar módulos auxiliares
            const mapper = window.__heuristicAuditor_mapper;
            const severityCalc = window.__heuristicAuditor_severity;
            const overlay = window.__heuristicAuditor_overlay;

            if (!mapper || !severityCalc) {
                return { error: 'Módulos de análise não carregados.' };
            }

            // Configurar e executar axe-core
            const axeConfig = {
                runOnly: {
                    type: 'tag',
                    values: [
                        'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa',
                        'best-practice', 'cat.semantics', 'cat.forms',
                        'cat.keyboard', 'cat.color', 'cat.name-role-value',
                        'cat.structure', 'cat.text-alternatives',
                        'cat.tables', 'cat.time-and-media',
                        'cat.parsing', 'cat.aria', 'cat.language',
                        'cat.sensory-and-visual-cues'
                    ]
                },
                resultTypes: ['violations', 'passes', 'inapplicable'],
                reporter: 'v2'
            };

            const axeResults = await axe.run(document, axeConfig);

            // Processar violações
            const processedIssues = (axeResults.violations || []).map(violation => {
                // Mapear para heurística de Nielsen
                const heuristicInfo = mapper.mapViolationToHeuristic(violation);

                // Calcular severidade
                const severity = severityCalc.calculateSeverity(violation);

                // Extrair critérios WCAG
                const wcagCriteria = mapper.extractWcagCriteria(violation);
                const wcagLevel = mapper.extractWcagLevel(violation);

                return {
                    id: violation.id,
                    description: violation.description,
                    help: violation.help,
                    helpUrl: violation.helpUrl,
                    tags: violation.tags,
                    wcagCriteria: wcagCriteria,
                    wcagLevel: wcagLevel,
                    nielsenHeuristic: heuristicInfo.primary,
                    allHeuristics: heuristicInfo.all,
                    severity: severity,
                    nodes: (violation.nodes || []).map(node => ({
                        html: node.html,
                        target: node.target,
                        failureSummary: node.failureSummary,
                        impact: node.impact
                    }))
                };
            });

            // Ordenar por severidade (mais graves primeiro)
            processedIssues.sort((a, b) => (b.severity?.score || 0) - (a.severity?.score || 0));

            // Calcular resumo
            const summary = severityCalc.calculateSummary(processedIssues);

            // Organizar por heurística
            const byHeuristic = {};
            processedIssues.forEach(issue => {
                const hId = issue.nielsenHeuristic?.id || 'unknown';
                if (!byHeuristic[hId]) {
                    byHeuristic[hId] = {
                        heuristic: issue.nielsenHeuristic,
                        issues: []
                    };
                }
                byHeuristic[hId].issues.push(issue);
            });

            // Resultado final
            const results = {
                url: window.location.href,
                pageTitle: document.title,
                timestamp: new Date().toISOString(),
                summary: summary,
                issues: processedIssues,
                byHeuristic: byHeuristic,
                passes: (axeResults.passes || []).length,
                inapplicable: (axeResults.inapplicable || []).length
            };

            // Salvar para uso do overlay
            window.__heuristicAuditor_lastIssues = processedIssues;

            // Renderizar overlay
            if (overlay) {
                overlay.renderOverlay(processedIssues);
            }

            return results;

        } catch (error) {
            console.error('[HeuristicAuditor] Erro na auditoria:', error);
            return { error: error.message || 'Erro desconhecido durante a auditoria.' };
        }
    }

    // Exportar função principal para o escopo global
    window.__heuristicAuditor_runAudit = runAudit;
})();
