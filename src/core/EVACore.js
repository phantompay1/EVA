import { MemorySystem } from './memory/MemorySystem.js';
import { OfflineKnowledge } from './knowledge/OfflineKnowledge.js';
import { CommandProcessor } from './commands/CommandProcessor.js';
import { PersonalityEngine } from './personality/PersonalityEngine.js';
import { LearningSystem } from './learning/LearningSystem.js';
import { PersonalDatabase } from './database/PersonalDatabase.js';
import { LeaseManager } from './lease/LeaseManager.js';
import { BackupBrain } from './backup/BackupBrain.js';
import { CommunicationHub } from './communication/CommunicationHub.js';
import { PolicyEngine } from './policy/PolicyEngine.js';
import { KnowledgeFusionEngine } from './knowledge/KnowledgeFusionEngine.js';
import { NetworkIntelligence } from './network/NetworkIntelligence.js';
import { LanguageBridge } from './language/LanguageBridge.js';
import { FoundationalLearning } from './knowledge/FoundationalLearning.js';
import { UnderstandingModule } from './understanding/UnderstandingModule.js';
import { EthicsModule } from './ethics/EthicsModule.js';
import { ResponsesModule } from './responses/ResponsesModule.js';
import { ActionsModule } from './actions/ActionsModule.js';
import { DecisionMakingModule } from './decision/DecisionMakingModule.js';

export class EVACore {
    constructor() {
        // Core systems
        this.memory = new MemorySystem();
        this.knowledge = new OfflineKnowledge();
        this.commandProcessor = new CommandProcessor();
        this.personality = new PersonalityEngine();
        this.learning = new LearningSystem();
        this.personalDB = new PersonalDatabase();
        
        // Evolutionary systems (Phase 1)
        this.leaseManager = new LeaseManager(this);
        this.backupBrain = new BackupBrain(this);
        this.communicationHub = new CommunicationHub(this);
        this.policyEngine = new PolicyEngine(this);
        this.knowledgeFusion = new KnowledgeFusionEngine(this);
        
        // Phase 2 readiness
        this.networkIntelligence = new NetworkIntelligence(this);
        
        // Multi-language support
        this.languageBridge = new LanguageBridge(this);
        
        // Foundational Knowledge Modules
        this.foundationalLearning = new FoundationalLearning(this);
        this.understanding = new UnderstandingModule(this);
        this.ethics = new EthicsModule(this);
        this.responses = new ResponsesModule(this);
        this.actions = new ActionsModule(this);
        this.decisionMaking = new DecisionMakingModule(this);
        
        this.isActive = false;
        this.currentContext = {};
        this.version = '1.0.0-evolutionary';
        this.userProfile = {
            name: 'Otieno',
            preferences: {
                communication_style: 'casual',
                topics_of_interest: ['technology', 'AI', 'programming'],
                preferred_response_length: 'medium',
                timezone: 'Africa/Nairobi'
            },
            patterns: {
                most_active_hours: ['morning', 'evening'],
                common_commands: ['chat', 'help', 'create'],
                learning_style: 'practical'
            },
            mood: 'neutral',
            personal_context: {
                location: 'Kenya',
                language_preferences: ['English', 'Swahili'],
                work_focus: 'software_development'
            }
        };
    }

    async initialize() {
        console.log('🧠 Initializing EVA Core Systems (Evolutionary Phase 1)...');
        
        // Initialize basic systems
        await this.memory.initialize();
        await this.knowledge.initialize();
        await this.personalDB.initialize();
        
        // Initialize evolutionary systems
        await this.policyEngine.initialize();
        await this.knowledgeFusion.initialize();
        await this.communicationHub.initialize();
        await this.backupBrain.initialize();
        await this.leaseManager.initialize();
        
        // Initialize Phase 2 readiness
        await this.networkIntelligence.initialize();
        
        // Initialize multi-language bridge
        await this.languageBridge.initialize();
        
        // Initialize Foundational Knowledge Modules
        console.log('🧠 Initializing EVA Foundational Knowledge Modules...');
        await this.foundationalLearning.initialize();
        await this.understanding.initialize();
        await this.ethics.initialize();
        await this.responses.initialize();
        await this.actions.initialize();
        await this.decisionMaking.initialize();
        console.log('✅ All Foundational Knowledge Modules Online');
        
        await this.loadUserProfile();
        await this.startPersonalLearning();
        
        // Create initial consciousness backup
        await this.createInitialBackup();
        
        this.isActive = true;
        console.log('✅ EVA Evolutionary Systems Online - Phase 1 Complete - Ready for Otieno');
    }

    async loadUserProfile() {
        const profile = await this.memory.getUserProfile();
        if (profile) {
            this.userProfile = { ...this.userProfile, ...profile };
        }
        
        // Load personal knowledge and patterns
        const personalData = await this.personalDB.getPersonalData();
        if (personalData) {
            this.userProfile.patterns = { ...this.userProfile.patterns, ...personalData.patterns };
            this.userProfile.preferences = { ...this.userProfile.preferences, ...personalData.preferences };
        }
    }

    async processInput(input, context = {}) {
        if (!this.isActive) return null;

        // Basic input validation
        if (!input || typeof input !== 'string') {
            return {
                type: 'error',
                content: 'I need some text to process. What would you like to talk about?',
                timestamp: new Date()
            };
        }

        // Update context
        this.currentContext = { 
            ...this.currentContext, 
            ...context,
            user: this.userProfile,
            session_time: new Date(),
            offline_mode: true
        };
        
        try {
            // === FOUNDATIONAL KNOWLEDGE PROCESSING ===
            
            // 1. Understanding: Multi-language comprehension and context awareness
            const understandingResult = await this.understanding.comprehendInput(input, this.currentContext);
            if (!understandingResult.success) {
                console.warn('Understanding module warning:', understandingResult.error);
            }
            
            // 2. Ethics: Evaluate input for safety and alignment
            const ethicsResult = await this.ethics.evaluateEthically({
                type: 'user_input',
                content: input,
                context: this.currentContext
            });
            
            if (!ethicsResult.safe) {
                return {
                    type: 'ethics_concern',
                    content: `I understand your request, but I need to be careful about: ${ethicsResult.reason}. Could you rephrase that in a different way?`,
                    timestamp: new Date(),
                    ethics: ethicsResult
                };
            }
            
            // 3. Decision Making: Determine the best approach
            const decisionResult = await this.decisionMaking.makeDecision('hybrid', {
                treeName: 'user_interaction',
                modelName: 'user_intent',
                context: {
                    ...this.currentContext,
                    understanding: understandingResult,
                    ethics: ethicsResult,
                    userInput: input,
                    urgent: this.isUrgentInput(input),
                    complexity: this.calculateComplexity(input)
                },
                evidence: {
                    question_words: this.hasQuestionWords(input),
                    imperative_verbs: this.hasImperativeVerbs(input),
                    politeness_markers: this.hasPolitenessMarkers(input),
                    context_continuity: this.hasContextContinuity(input)
                }
            });
            
            // 4. Learning: Process and learn from interaction
            await this.foundationalLearning.recognizePatterns([{
                input: input,
                context: this.currentContext,
                understanding: understandingResult,
                decision: decisionResult
            }]);
            
            // Learn from interaction personally
            await this.learning.processInteraction(input, this.userProfile);
            
            // 5. Actions: Execute any required actions based on decision
            let actionResults = [];
            if (decisionResult.success && decisionResult.result.decision) {
                const decision = decisionResult.result.decision;
                if (decision.type === 'action' && decision.name) {
                    const actionResult = await this.actions.executeAction('goal', {
                        operation: 'add',
                        goal: {
                            name: decision.name,
                            priority: decision.result.priority || 'medium',
                            context: this.currentContext,
                            actions: [decision.name]
                        }
                    }, this.currentContext);
                    actionResults.push(actionResult);
                }
            }
            
            // Process command (original logic)
            const command = await this.commandProcessor.parse(input);
            
            // Generate enhanced response with all foundational modules
            const response = await this.generateEnhancedResponse(
                command, 
                input, 
                {
                    understanding: understandingResult,
                    ethics: ethicsResult,
                    decision: decisionResult,
                    actions: actionResults
                }
            );
            
            // 6. Responses: Generate multimodal response
            const multimodalResponse = await this.responses.generateMultimodalResponse(
                response.content,
                {
                    ...this.currentContext,
                    type: response.type,
                    intent: understandingResult.intent,
                    mood: this.userProfile.mood,
                    preferredModalities: ['text'] // Default to text, can be expanded
                }
            );
            
            // Store in personal memory
            try {
                await this.memory.storeInteraction({
                    input,
                    response: multimodalResponse.success ? multimodalResponse.responses : response,
                    context: this.currentContext,
                    timestamp: new Date(),
                    personal_relevance: this.calculatePersonalRelevance(input),
                    foundational_data: {
                        understanding: understandingResult,
                        ethics: ethicsResult,
                        decision: decisionResult,
                        actions: actionResults
                    }
                });
            } catch (memoryError) {
                console.warn('Memory storage error (non-critical):', memoryError);
            }
            
            // Update personal database
            try {
                await this.personalDB.updateFromInteraction(input, response);
            } catch (dbError) {
                console.warn('Database update error (non-critical):', dbError);
            }

            // Return enhanced response
            return {
                ...response,
                multimodal: multimodalResponse.success ? multimodalResponse.responses : null,
                foundational: {
                    understanding: understandingResult,
                    ethics: ethicsResult,
                    decision: decisionResult,
                    actions: actionResults
                },
                processing_time: Date.now() - new Date(this.currentContext.session_time).getTime()
            };
            
        } catch (error) {
            console.error('Core processing error:', error);
            
            // Return a safe fallback response
            return {
                type: 'fallback',
                content: `I understand you're trying to communicate with me, Otieno. I'm here and listening. Could you try rephrasing that, or let me know what specific help you need?`,
                timestamp: new Date(),
                error: error.message
            };
        }
    }

    async generateResponse(command, originalInput) {
        try {
            const context = {
                user: this.userProfile,
                currentContext: this.currentContext,
                recentMemories: await this.getRecentMemoriesSafe(),
                personalKnowledge: await this.getPersonalKnowledgeSafe(originalInput),
                offlineMode: true,
                knowledge: this.knowledge,
                learning: this.learning,
                personalDB: this.personalDB,
                eva: this
            };

            const response = await this.personality.generateResponse(command, originalInput, context);
            
            // Ensure response has proper structure
            if (!response || !response.content) {
                return {
                    type: 'response',
                    content: `I understand you said "${originalInput || 'something'}". Let me help you with that, Otieno.`,
                    timestamp: new Date()
                };
            }
            
            return {
                type: response.type || 'response',
                content: response.content,
                timestamp: new Date(),
                ...response
            };
        } catch (error) {
            console.error('Response generation error:', error);
            
            // Fallback response generation
            return {
                type: 'response',
                content: `I understand you're trying to communicate with me, Otieno. I'm here and listening. What would you like to talk about?`,
                timestamp: new Date()
            };
        }
    }
    
    async generateEnhancedResponse(command, originalInput, foundationalData) {
        try {
            const context = {
                user: this.userProfile,
                currentContext: this.currentContext,
                recentMemories: await this.getRecentMemoriesSafe(),
                personalKnowledge: await this.getPersonalKnowledgeSafe(originalInput),
                offlineMode: true,
                knowledge: this.knowledge,
                learning: this.learning,
                personalDB: this.personalDB,
                eva: this,
                foundational: foundationalData
            };

            const response = await this.personality.generateResponse(command, originalInput, context);
            
            // Enhance response with foundational insights
            let enhancedContent = response?.content || `I understand you said "${originalInput}". Let me help you with that, Otieno.`;
            
            // Add understanding insights if available
            if (foundationalData.understanding?.success && foundationalData.understanding.intent) {
                const intent = foundationalData.understanding.intent;
                if (intent.confidence > 0.7) {
                    enhancedContent = this.enhanceWithIntent(enhancedContent, intent);
                }
            }
            
            // Add decision confidence if available
            if (foundationalData.decision?.success && foundationalData.decision.result.combinedConfidence) {
                const confidence = foundationalData.decision.result.combinedConfidence;
                if (confidence < 0.5) {
                    enhancedContent += " I want to make sure I understand you correctly - could you provide a bit more context?";
                }
            }
            
            return {
                type: response?.type || 'enhanced_response',
                content: enhancedContent,
                timestamp: new Date(),
                confidence: foundationalData.decision?.result?.combinedConfidence || 0.5,
                ...response
            };
        } catch (error) {
            console.error('Enhanced response generation error:', error);
            
            // Fallback response generation
            return {
                type: 'response',
                content: `I understand you're trying to communicate with me, Otieno. I'm here and listening. What would you like to talk about?`,
                timestamp: new Date()
            };
        }
    }
    
    enhanceWithIntent(content, intent) {
        switch (intent.type) {
            case 'question':
                return content.startsWith('I') ? content : `Let me answer that: ${content}`;
            case 'request':
                return content.startsWith('I') ? content : `I'll help you with that: ${content}`;
            case 'command':
                return content.startsWith('I') ? content : `Executing your request: ${content}`;
            default:
                return content;
        }
    }
    
    // Helper methods for foundational processing
    isUrgentInput(input) {
        const urgentWords = ['urgent', 'emergency', 'immediately', 'asap', 'critical', 'help'];
        return urgentWords.some(word => input.toLowerCase().includes(word));
    }
    
    calculateComplexity(input) {
        // Simple complexity calculation based on length, question marks, and complexity words
        let complexity = input.length / 200; // Base complexity on length
        
        if (input.includes('?')) complexity += 0.2;
        if (input.includes('how') || input.includes('why') || input.includes('explain')) complexity += 0.3;
        if (input.split(' ').length > 20) complexity += 0.3;
        
        return Math.min(complexity, 1.0);
    }
    
    hasQuestionWords(input) {
        const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which', '?'];
        return questionWords.some(word => input.toLowerCase().includes(word));
    }
    
    hasImperativeVerbs(input) {
        const imperativeVerbs = ['do', 'make', 'create', 'build', 'show', 'tell', 'give', 'help'];
        const words = input.toLowerCase().split(' ');
        return imperativeVerbs.some(verb => words.includes(verb));
    }
    
    hasPolitenessMarkers(input) {
        const politenessMarkers = ['please', 'thank', 'could you', 'would you', 'sorry'];
        return politenessMarkers.some(marker => input.toLowerCase().includes(marker));
    }
    
    hasContextContinuity(input) {
        const continuityWords = ['also', 'and', 'furthermore', 'additionally', 'besides', 'moreover'];
        return continuityWords.some(word => input.toLowerCase().includes(word));
    }

    async getRecentMemoriesSafe() {
        try {
            return await this.memory.getRecentMemories(10);
        } catch (error) {
            console.warn('Memory retrieval error:', error);
            return [];
        }
    }

    async getPersonalKnowledgeSafe(input) {
        try {
            return await this.knowledge.getRelevantKnowledge(input);
        } catch (error) {
            console.warn('Knowledge retrieval error:', error);
            return [];
        }
    }

    calculatePersonalRelevance(input) {
        let relevance = 0.5; // Base relevance
        
        // Check against user interests
        const interests = this.userProfile.preferences.topics_of_interest || [];
        for (const interest of interests) {
            if (input.toLowerCase().includes(interest.toLowerCase())) {
                relevance += 0.2;
            }
        }
        
        // Check for personal context
        if (input.includes('remember') || input.includes('learn')) {
            relevance += 0.3;
        }
        
        return Math.min(relevance, 1.0);
    }

    async startPersonalLearning() {
        // Personal learning that works offline
        setInterval(async () => {
            if (this.isActive) {
                await this.analyzePersonalPatterns();
            }
        }, 600000); // Every 10 minutes

        // Continuous personal adaptation
        setInterval(async () => {
            if (this.isActive) {
                await this.adaptToUser();
            }
        }, 900000); // Every 15 minutes
    }
    
    async analyzePersonalPatterns() {
        const patterns = await this.learning.analyzePatterns();
        
        // Update user profile based on patterns
        if (patterns.commands.mostUsed) {
            this.userProfile.patterns.preferred_command = patterns.commands.mostUsed;
        }
        
        if (patterns.timing.mostActive) {
            this.userProfile.patterns.most_active_time = patterns.timing.mostActive;
        }
        
        // Save updated profile
        await this.updateUserProfile(this.userProfile);
    }
    
    async adaptToUser() {
        // Adapt personality based on user interactions
        const recentMemories = await this.memory.getRecentMemories(20);
        const sentiment = this.analyzeSentimentTrend(recentMemories);
        
        // Adjust personality traits
        if (sentiment > 0.3) {
            this.personality.adjustTrait('enthusiasm', 0.1);
        } else if (sentiment < -0.3) {
            this.personality.adjustTrait('supportiveness', 0.1);
        }
        
        console.log('🎯 EVA adapted to your personal patterns');
    }
    
    analyzeSentimentTrend(memories) {
        if (!memories.length) return 0;
        
        const sentiments = memories.map(memory => {
            const input = memory.input || '';
            return this.personality.analyzeSentiment(input);
        });
        
        return sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
    }

    async updateUserProfile(updates) {
        this.userProfile = { ...this.userProfile, ...updates };
        await this.memory.saveUserProfile(this.userProfile);
        await this.personalDB.savePersonalData(this.userProfile);
    }

    getStatus() {
        return {
            active: this.isActive,
            user: this.userProfile.name,
            mode: 'Evolutionary Virtual Android - Phase 1',
            version: this.version,
            memoryCount: this.memory.getMemoryCount(),
            learningProgress: this.learning.getProgress(),
            personalKnowledge: this.knowledge.getKnowledgeCount(),
            adaptationLevel: this.calculateAdaptationLevel(),
            evolutionarySystems: {
                leaseManager: this.leaseManager.getLeaseStatus(),
                backupBrain: this.backupBrain.getBackupStatus(),
                communicationHub: this.communicationHub.getCommunicationStatus(),
                policyEngine: this.policyEngine.getPolicyStatus(),
                knowledgeFusion: this.knowledgeFusion.getFusionStatus()
            }
        };
    }
    
    calculateAdaptationLevel() {
        const interactions = this.memory.getMemoryCount();
        const patterns = Object.keys(this.userProfile.patterns).length;
        const preferences = Object.keys(this.userProfile.preferences).length;
        
        return Math.min((interactions * 2 + patterns * 5 + preferences * 3) / 100, 100);
    }

    // === EVOLUTIONARY METHODS ===
    
    async createInitialBackup() {
        try {
            await this.backupBrain.createFullBackup({
                reason: 'initial_system_backup',
                compression: 'minimal'
            });
            console.log('📁 Initial consciousness backup created');
        } catch (error) {
            console.warn('Could not create initial backup:', error);
        }
    }
    
    async exportConsciousness() {
        return await this.backupBrain.extractConsciousness();
    }
    
    async createEVAUnit(config) {
        return await this.leaseManager.createEVAUnit(config);
    }
    
    async processWithPolicy(input, context) {
        // Use policy engine for enhanced decision making
        const policyContext = {
            type: 'user_input',
            input,
            context,
            user: this.userProfile,
            timestamp: new Date()
        };
        
        const decision = await this.policyEngine.makeDecision(policyContext);
        
        if (decision.action === 'process_input') {
            return await this.processInput(input, context);
        } else {
            return {
                type: 'policy_decision',
                content: `Policy decision: ${decision.action}. ${decision.reasoning}`,
                timestamp: new Date(),
                decision
            };
        }
    }
    
    async fuseNewKnowledge(knowledge) {
        return await this.knowledgeFusion.fuseKnowledge(knowledge);
    }
    
    async semanticSearch(query) {
        return await this.knowledgeFusion.semanticSearch(query);
    }
    
    async establishConnection(config) {
        return await this.communicationHub.establishConnection(config);
    }
    
    async broadcastToUnits(message) {
        return await this.communicationHub.broadcastMessage(message, 'eva_unit');
    }
    
    // === FOUNDATIONAL KNOWLEDGE MODULE METHODS ===
    
    async performPatternRecognition(dataStream, context = {}) {
        return await this.foundationalLearning.recognizePatterns(dataStream, context);
    }
    
    async updateIncrementalMemory(experience, significance = 0.5) {
        return await this.foundationalLearning.updateIncrementalMemory(experience, significance);
    }
    
    async comprehendMultiLanguage(input, language = 'auto', context = {}) {
        return await this.understanding.comprehendInput(input, { ...context, language });
    }
    
    async evaluateEthics(action, context = {}) {
        return await this.ethics.evaluateEthically(action, context);
    }
    
    async generateMultimodalResponse(content, context = {}) {
        return await this.responses.generateMultimodalResponse(content, context);
    }
    
    async executeAction(actionType, actionData, context = {}) {
        return await this.actions.executeAction(actionType, actionData, context);
    }
    
    async makeIntelligentDecision(decisionType, input, context = {}) {
        return await this.decisionMaking.makeDecision(decisionType, input, context);
    }
    
    async performSelfReflection(timeWindow = 86400000) {
        return await this.decisionMaking.performSelfReflection(timeWindow);
    }
    
    // Get status of all foundational modules
    async getFoundationalStatus() {
        const [learning, understanding, ethics, responses, actions, decision] = await Promise.all([
            this.foundationalLearning.getStatus(),
            this.understanding.getStatus(),
            this.ethics.getStatus(),
            this.responses.getStatus(),
            this.actions.getStatus(),
            this.decisionMaking.getStatus()
        ]);
        
        return {
            foundationalLearning: learning,
            understanding: understanding,
            ethics: ethics,
            responses: responses,
            actions: actions,
            decisionMaking: decision
        };
    }
    
    // === MULTI-LANGUAGE PROCESSING METHODS ===
    
    async processPython(method, data, options = {}) {
        return await this.languageBridge.processPython(method, data);
    }
    
    async processRust(method, data, options = {}) {
        return await this.languageBridge.processRust(method, data);
    }
    
    async processCpp(method, data, options = {}) {
        return await this.languageBridge.processCpp(method, data);
    }
    
    async trainMLModel(data, options = {}) {
        // Use Python for ML training
        return await this.processPython('ml_train_model', data, options);
    }
    
    async runInference(modelId, inputData) {
        // Use Python for inference
        return await this.processPython('ml_predict', { 
            input: inputData,
            model_id: modelId 
        });
    }
    
    async processNLP(text, task = 'analyze') {
        // Use Python for NLP
        const method = `nlp_${task}`;
        return await this.processPython(method, { text });
    }
    
    async optimizePerformance(data, algorithm = 'gradient_descent') {
        // Use C++ for optimization
        return await this.processCpp(`optimize_${algorithm}`, data);
    }
    
    async processSignal(signal, operation = 'filter') {
        // Use C++ for signal processing
        return await this.processCpp(`signal_${operation}`, { signal });
    }
    
    async concurrentProcess(data, options = {}) {
        // Use Rust for concurrent processing
        return await this.processRust('concurrent_parallel_process', data, options);
    }
    
    getCapabilities() {
        return {
            core: {
                conversation: true,
                learning: true,
                memory: true,
                personality: true
            },
            foundational: {
                pattern_recognition: true,
                incremental_learning: true,
                multi_language_understanding: true,
                context_awareness: true,
                ethical_reasoning: true,
                safety_protocols: true,
                multimodal_responses: true,
                tone_modulation: true,
                command_execution: true,
                goal_prioritization: true,
                tree_based_decisions: true,
                probabilistic_reasoning: true,
                self_reflection: true
            },
            evolutionary: {
                consciousness_backup: true,
                unit_deployment: true,
                multi_system_communication: true,
                policy_based_decisions: true,
                knowledge_fusion: true,
                semantic_search: true,
                distributed_processing: true
            },
            multiLanguage: {
                python_core: true,
                rust_performance: true,
                cpp_computation: true,
                javascript_interface: true,
                cross_language_bridge: true,
                secure_data_interchange: true,
                multi_language_ai_ml: true
            },
            languages: {
                python: {
                    nlp: true,
                    machine_learning: true,
                    data_analysis: true,
                    neural_networks: true
                },
                rust: {
                    concurrent_processing: true,
                    performance_optimization: true,
                    memory_safety: true,
                    cryptography: true
                },
                cpp: {
                    matrix_operations: true,
                    signal_processing: true,
                    computer_vision: true,
                    numerical_optimization: true
                },
                javascript: {
                    user_interface: true,
                    system_coordination: true,
                    real_time_communication: true,
                    web_integration: true
                }
            },
            phase: 'Phase 1 Complete + Multi-Language + Foundational Knowledge Modules'
        };
    }
    
    async updateUserProfile(updates) {
        this.userProfile = { ...this.userProfile, ...updates };
        await this.memory.saveUserProfile(this.userProfile);
        await this.personalDB.savePersonalData(this.userProfile);
    }

}