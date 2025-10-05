/**
 * EVA Decision-Making Module
 * Implements tree-based logic, probabilistic reasoning, and self-reflection
 * Part of EVA's Foundational Knowledge Modules
 */

const EventEmitter = require('events');

/**
 * Decision Tree System
 */
class DecisionTreeSystem {
    constructor() {
        this.decisionTrees = new Map();
        this.initialized = false;
        this.metrics = { decisionsProcessed: 0, averageDepth: 0, accuracyRate: 0 };
    }

    async initialize() {
        console.log('🌳 Initializing Decision Tree System...');
        await this.buildDefaultTrees();
        this.initialized = true;
        console.log('✅ Decision Tree System initialized');
    }

    async buildDefaultTrees() {
        // User interaction decision tree
        this.decisionTrees.set('user_interaction', {
            root: {
                type: 'condition',
                condition: { field: 'userInput', operator: 'exists' },
                true: {
                    type: 'condition',
                    condition: { field: 'urgent', operator: 'equals', value: true },
                    true: { type: 'action', action: { name: 'prioritize_urgent', priority: 'high' } },
                    false: { type: 'action', action: { name: 'process_normally', approach: 'standard' } }
                },
                false: { type: 'action', action: { name: 'wait_for_input', timeout: 30000 } }
            }
        });

        // Error handling decision tree
        this.decisionTrees.set('error_handling', {
            root: {
                type: 'condition',
                condition: { field: 'error.severity', operator: 'equals', value: 'critical' },
                true: { type: 'action', action: { name: 'emergency_shutdown', immediate: true } },
                false: {
                    type: 'condition',
                    condition: { field: 'error.recoverable', operator: 'equals', value: true },
                    true: { type: 'action', action: { name: 'attempt_recovery', maxAttempts: 3 } },
                    false: { type: 'action', action: { name: 'log_and_continue', fallback: true } }
                }
            }
        });

        console.log(`🌳 Built ${this.decisionTrees.size} default decision trees`);
    }

    async makeDecision(treeName, context) {
        try {
            console.log(`🌳 Making decision using tree: ${treeName}`);
            
            const tree = this.decisionTrees.get(treeName);
            if (!tree) {
                throw new Error(`Decision tree not found: ${treeName}`);
            }

            const result = await this.traverseTree(tree.root, context, 0);
            this.updateMetrics(result.depth || 0, true);

            console.log(`✅ Decision made: ${treeName} (depth: ${result.depth || 0})`);
            return {
                success: true,
                decision: result.decision,
                path: result.path,
                depth: result.depth || 0
            };

        } catch (error) {
            console.error(`❌ Decision making failed: ${error.message}`);
            this.updateMetrics(0, false);
            return { success: false, error: error.message, treeName: treeName };
        }
    }

    async traverseTree(node, context, depth) {
        const path = [`depth_${depth}`];
        
        switch (node.type) {
            case 'condition':
                const conditionResult = await this.evaluateCondition(context, node.condition);
                path.push(`condition_${conditionResult}`);
                
                const nextNode = conditionResult ? node.true : node.false;
                if (nextNode) {
                    const childResult = await this.traverseTree(nextNode, context, depth + 1);
                    return {
                        decision: childResult.decision,
                        path: path.concat(childResult.path),
                        depth: Math.max(depth, childResult.depth)
                    };
                }
                
                return { decision: { type: 'condition_end', result: conditionResult }, path, depth };

            case 'action':
                path.push(`action_${node.action.name}`);
                return {
                    decision: { type: 'action', name: node.action.name, result: node.action },
                    path,
                    depth
                };

            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }
    }

    async evaluateCondition(context, condition) {
        try {
            const value = this.getNestedValue(context, condition.field);
            
            switch (condition.operator) {
                case 'exists': return value !== undefined && value !== null;
                case 'equals': return value === condition.value;
                case 'greater': return value > condition.value;
                case 'less': return value < condition.value;
                default: return false;
            }
        } catch (error) {
            console.warn(`⚠️ Condition evaluation error: ${error.message}`);
            return false;
        }
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    updateMetrics(depth, success) {
        this.metrics.decisionsProcessed++;
        this.metrics.averageDepth = (this.metrics.averageDepth + depth) / 2;
        
        if (success) {
            const successes = Math.floor(this.metrics.accuracyRate * (this.metrics.decisionsProcessed - 1));
            this.metrics.accuracyRate = (successes + 1) / this.metrics.decisionsProcessed;
        } else {
            const successes = Math.floor(this.metrics.accuracyRate * (this.metrics.decisionsProcessed - 1));
            this.metrics.accuracyRate = successes / this.metrics.decisionsProcessed;
        }
    }
}

/**
 * Probabilistic Reasoning System
 */
class ProbabilisticReasoningSystem {
    constructor() {
        this.probabilityModels = new Map();
        this.initialized = false;
        this.metrics = { inferencesPerformed: 0, averageConfidence: 0, uncertaintyHandled: 0 };
    }

    async initialize() {
        console.log('🎲 Initializing Probabilistic Reasoning System...');
        await this.setupProbabilityModels();
        this.initialized = true;
        console.log('✅ Probabilistic Reasoning System initialized');
    }

    async setupProbabilityModels() {
        // User intent probability model
        this.probabilityModels.set('user_intent', {
            priors: { 'question': 0.4, 'request': 0.3, 'command': 0.2, 'conversation': 0.1 },
            evidence_weights: {
                'question_words': 0.8, 'imperative_verbs': 0.7,
                'politeness_markers': 0.6, 'context_continuity': 0.5
            }
        });

        // Task success probability model
        this.probabilityModels.set('task_success', {
            priors: { 'likely_success': 0.7, 'possible_success': 0.2, 'unlikely_success': 0.1 },
            evidence_weights: {
                'resource_availability': 0.9, 'complexity_score': 0.8,
                'historical_performance': 0.7, 'user_expertise': 0.6
            }
        });

        console.log(`📊 Setup ${this.probabilityModels.size} probability models`);
    }

    async inferProbability(modelName, evidence, context = {}) {
        try {
            console.log(`🎲 Inferring probability for model: ${modelName}`);
            
            const model = this.probabilityModels.get(modelName);
            if (!model) {
                throw new Error(`Probability model not found: ${modelName}`);
            }

            // Calculate likelihood for each hypothesis
            const hypotheses = Object.keys(model.priors);
            const posteriors = {};
            
            for (const hypothesis of hypotheses) {
                const prior = model.priors[hypothesis];
                const likelihood = this.calculateLikelihood(evidence, hypothesis, model);
                const evidenceTotal = this.calculateEvidence(evidence, model);
                
                posteriors[hypothesis] = (likelihood * prior) / Math.max(evidenceTotal, 0.001);
            }

            // Find most probable hypothesis
            const mostProbable = Object.entries(posteriors)
                .reduce((max, [hyp, prob]) => prob > max.probability ? { hypothesis: hyp, probability: prob } : max,
                    { hypothesis: hypotheses[0], probability: posteriors[hypotheses[0]] });

            // Calculate confidence
            const evidenceStrength = this.calculateEvidenceStrength(evidence, model);
            const baseConfidence = Math.abs(mostProbable.probability - 0.5) * 2;
            const confidence = Math.min(baseConfidence + evidenceStrength * 0.5, 1);

            this.updateMetrics(mostProbable.probability, confidence);

            console.log(`✅ Inference complete: ${mostProbable.hypothesis} (p=${mostProbable.probability.toFixed(3)}, c=${confidence.toFixed(3)})`);
            
            return {
                success: true,
                mostProbable: mostProbable,
                allProbabilities: posteriors,
                confidence: confidence,
                evidenceStrength: evidenceStrength,
                modelName: modelName
            };

        } catch (error) {
            console.error(`❌ Probability inference failed: ${error.message}`);
            return { success: false, error: error.message, modelName: modelName };
        }
    }

    calculateLikelihood(evidence, hypothesis, model) {
        let likelihood = 1.0;
        
        for (const [evidenceKey, evidenceValue] of Object.entries(evidence)) {
            const weight = model.evidence_weights[evidenceKey] || 0.5;
            
            let match = 0;
            if (typeof evidenceValue === 'boolean') {
                match = evidenceValue ? 1 : 0;
            } else if (typeof evidenceValue === 'number') {
                match = Math.min(evidenceValue, 1);
            } else {
                match = 0.5;
            }
            
            likelihood *= (match * weight + (1 - weight) * 0.5);
        }
        
        return likelihood;
    }

    calculateEvidence(evidence, model) {
        const hypotheses = Object.keys(model.priors);
        let totalEvidence = 0;
        
        for (const hypothesis of hypotheses) {
            const prior = model.priors[hypothesis];
            const likelihood = this.calculateLikelihood(evidence, hypothesis, model);
            totalEvidence += likelihood * prior;
        }
        
        return Math.max(totalEvidence, 0.001);
    }

    calculateEvidenceStrength(evidence, model) {
        let totalStrength = 0;
        let maxStrength = 0;
        
        for (const [evidenceKey, evidenceValue] of Object.entries(evidence)) {
            const weight = model.evidence_weights[evidenceKey] || 0.5;
            maxStrength += weight;
            
            if (typeof evidenceValue === 'boolean' && evidenceValue) {
                totalStrength += weight;
            } else if (typeof evidenceValue === 'number') {
                totalStrength += weight * Math.min(evidenceValue, 1);
            }
        }
        
        return maxStrength > 0 ? totalStrength / maxStrength : 0;
    }

    updateMetrics(probability, confidence) {
        this.metrics.inferencesPerformed++;
        this.metrics.averageConfidence = (this.metrics.averageConfidence + confidence) / 2;
        
        if (confidence < 0.5) {
            this.metrics.uncertaintyHandled++;
        }
    }
}

/**
 * Self-Reflection System
 */
class SelfReflectionSystem {
    constructor() {
        this.decisionHistory = [];
        this.reflectionRules = new Map();
        this.initialized = false;
        this.metrics = { reflectionsPerformed: 0, improvementsIdentified: 0 };
    }

    async initialize() {
        console.log('🪞 Initializing Self-Reflection System...');
        await this.setupReflectionRules();
        this.initialized = true;
        console.log('✅ Self-Reflection System initialized');
    }

    async setupReflectionRules() {
        // Accuracy reflection rule
        this.reflectionRules.set('accuracy', {
            evaluate: (decisions) => {
                const successful = decisions.filter(d => d.outcome === 'success').length;
                const accuracy = decisions.length > 0 ? successful / decisions.length : 0;
                
                return {
                    metric: 'accuracy',
                    value: accuracy,
                    assessment: accuracy > 0.8 ? 'good' : accuracy > 0.6 ? 'acceptable' : 'needs_improvement',
                    suggestions: accuracy < 0.7 ? ['Review decision criteria', 'Improve evidence gathering'] : []
                };
            }
        });

        // Speed reflection rule
        this.reflectionRules.set('speed', {
            evaluate: (decisions) => {
                const avgTime = decisions.reduce((sum, d) => sum + (d.processingTime || 0), 0) / decisions.length;
                
                return {
                    metric: 'speed',
                    value: avgTime,
                    assessment: avgTime < 1000 ? 'fast' : avgTime < 5000 ? 'acceptable' : 'slow',
                    suggestions: avgTime > 3000 ? ['Optimize decision trees', 'Cache frequent decisions'] : []
                };
            }
        });

        console.log(`🔍 Setup ${this.reflectionRules.size} reflection rules`);
    }

    async recordDecision(decision, outcome, context = {}) {
        const record = {
            id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            decision: decision,
            outcome: outcome,
            context: context,
            processingTime: decision.processingTime || 0,
            depth: decision.depth || 0,
            confidence: decision.confidence || 0.5
        };

        this.decisionHistory.push(record);
        
        // Keep only recent decisions (last 1000)
        if (this.decisionHistory.length > 1000) {
            this.decisionHistory = this.decisionHistory.slice(-1000);
        }

        console.log(`📝 Recorded decision: ${record.id} (outcome: ${outcome})`);
    }

    async performReflection(timeWindow = 86400000) { // 24 hours default
        try {
            console.log('🪞 Performing self-reflection...');
            
            const cutoffTime = Date.now() - timeWindow;
            const recentDecisions = this.decisionHistory.filter(d => d.timestamp > cutoffTime);
            
            if (recentDecisions.length === 0) {
                return {
                    success: true,
                    message: 'No recent decisions to reflect upon',
                    timeWindow: timeWindow
                };
            }

            const reflections = new Map();
            const allSuggestions = [];

            // Apply all reflection rules
            for (const [ruleName, rule] of this.reflectionRules) {
                const reflection = rule.evaluate(recentDecisions);
                reflections.set(ruleName, reflection);
                allSuggestions.push(...reflection.suggestions);
            }

            // Identify patterns
            const patterns = this.identifyPatterns(recentDecisions);

            // Update metrics
            this.updateReflectionMetrics(reflections, allSuggestions);

            console.log(`✅ Self-reflection complete: ${recentDecisions.length} decisions analyzed`);
            
            return {
                success: true,
                timeWindow: timeWindow,
                decisionsAnalyzed: recentDecisions.length,
                reflections: Object.fromEntries(reflections),
                patterns: patterns,
                suggestions: [...new Set(allSuggestions)]
            };

        } catch (error) {
            console.error(`❌ Self-reflection failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    identifyPatterns(decisions) {
        const patterns = {
            commonFailures: new Map(),
            successFactors: new Map()
        };

        decisions.forEach(decision => {
            const key = decision.decision.type || 'unknown';
            
            if (decision.outcome === 'failure') {
                patterns.commonFailures.set(key, (patterns.commonFailures.get(key) || 0) + 1);
            }
            
            if (decision.outcome === 'success' && decision.confidence > 0.8) {
                patterns.successFactors.set(key, (patterns.successFactors.get(key) || 0) + 1);
            }
        });

        return {
            commonFailures: Object.fromEntries(patterns.commonFailures),
            successFactors: Object.fromEntries(patterns.successFactors)
        };
    }

    updateReflectionMetrics(reflections, suggestions) {
        this.metrics.reflectionsPerformed++;
        this.metrics.improvementsIdentified += suggestions.length;
    }
}

/**
 * Main Decision-Making Module
 */
class DecisionMakingModule extends EventEmitter {
    constructor(evaCore) {
        super();
        this.evaCore = evaCore;
        this.decisionTreeSystem = new DecisionTreeSystem();
        this.probabilisticSystem = new ProbabilisticReasoningSystem();
        this.reflectionSystem = new SelfReflectionSystem();
        
        this.initialized = false;
        this.metrics = {
            totalDecisions: 0,
            averageConfidence: 0,
            reflectionCycles: 0
        };
    }

    async initialize() {
        console.log('🧠 Initializing EVA Decision-Making Module...');
        
        try {
            await Promise.all([
                this.decisionTreeSystem.initialize(),
                this.probabilisticSystem.initialize(),
                this.reflectionSystem.initialize()
            ]);

            this.initialized = true;
            this.emit('initialized');
            console.log('✅ EVA Decision-Making Module fully initialized');
            
            return {
                success: true,
                message: 'Decision-Making Module initialized successfully',
                capabilities: ['tree_based_logic', 'probabilistic_reasoning', 'self_reflection']
            };
        } catch (error) {
            console.error('❌ Failed to initialize Decision-Making Module:', error);
            throw error;
        }
    }

    async makeDecision(decisionType, input, context = {}) {
        const startTime = Date.now();
        
        try {
            if (!this.initialized) {
                throw new Error('Decision-Making Module not initialized');
            }

            console.log(`🧠 Making decision: ${decisionType}`);
            let result;

            switch (decisionType) {
                case 'tree':
                    result = await this.decisionTreeSystem.makeDecision(input.treeName, input.context);
                    break;

                case 'probabilistic':
                    result = await this.probabilisticSystem.inferProbability(input.modelName, input.evidence, input.context);
                    break;

                case 'hybrid':
                    const treeResult = await this.decisionTreeSystem.makeDecision(input.treeName, input.context);
                    const probResult = await this.probabilisticSystem.inferProbability(input.modelName, input.evidence, input.context);
                    
                    result = {
                        success: treeResult.success && probResult.success,
                        hybrid: true,
                        treeDecision: treeResult,
                        probabilisticInference: probResult,
                        combinedConfidence: ((treeResult.confidence || 0.5) + (probResult.confidence || 0.5)) / 2
                    };
                    break;

                default:
                    throw new Error(`Unknown decision type: ${decisionType}`);
            }

            const processingTime = Date.now() - startTime;
            result.processingTime = processingTime;
            
            // Record decision for reflection
            await this.reflectionSystem.recordDecision(result, 'pending', context);
            
            this.updateMetrics(result);

            console.log(`✅ Decision completed: ${decisionType} (${processingTime}ms)`);
            this.emit('decision_made', { decisionType, result, processingTime });

            return {
                success: true,
                decisionType,
                result,
                processingTime,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error(`❌ Decision making failed: ${error.message}`);
            
            return {
                success: false,
                decisionType,
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    async performSelfReflection(timeWindow) {
        try {
            const reflection = await this.reflectionSystem.performReflection(timeWindow);
            this.metrics.reflectionCycles++;
            
            console.log('🪞 Self-reflection completed');
            this.emit('reflection_completed', reflection);
            
            return reflection;
        } catch (error) {
            console.error('❌ Self-reflection failed:', error);
            return { success: false, error: error.message };
        }
    }

    updateMetrics(result) {
        this.metrics.totalDecisions++;
        
        const confidence = result.confidence || result.combinedConfidence || 0.5;
        this.metrics.averageConfidence = (this.metrics.averageConfidence + confidence) / 2;
    }

    async getStatus() {
        return {
            initialized: this.initialized,
            modules: {
                decisionTreeSystem: this.decisionTreeSystem.initialized,
                probabilisticSystem: this.probabilisticSystem.initialized,
                reflectionSystem: this.reflectionSystem.initialized
            },
            metrics: this.metrics,
            capabilities: this.initialized ? ['tree_based_logic', 'probabilistic_reasoning', 'self_reflection'] : []
        };
    }

    async shutdown() {
        console.log('🔄 Shutting down Decision-Making Module...');
        this.initialized = false;
        this.emit('shutdown');
        console.log('✅ Decision-Making Module shutdown complete');
    }
}

export { DecisionMakingModule };