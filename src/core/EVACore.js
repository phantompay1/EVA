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
            // Learn from interaction personally
            await this.learning.processInteraction(input, this.userProfile);
        } catch (learningError) {
            console.warn('Learning system error (non-critical):', learningError);
        }
        
        try {
            // Process command
            const command = await this.commandProcessor.parse(input);
            
            // Generate personalized response
            const response = await this.generateResponse(command, input);
            
            // Store in personal memory
            try {
                await this.memory.storeInteraction({
                    input,
                    response,
                    context: this.currentContext,
                    timestamp: new Date(),
                    personal_relevance: this.calculatePersonalRelevance(input)
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

            return response;
        } catch (error) {
            console.error('Core processing error:', error);
            
            // Return a safe fallback response
            return {
                type: 'fallback',
                content: `I understand you're trying to communicate with me, Otieno. I'm here and listening. Could you try rephrasing that, or let me know what specific help you need?`,
                timestamp: new Date()
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
            phase: 'Phase 1 Complete + Multi-Language Support'
        };
    }
    
    async updateUserProfile(updates) {
        this.userProfile = { ...this.userProfile, ...updates };
        await this.memory.saveUserProfile(this.userProfile);
        await this.personalDB.savePersonalData(this.userProfile);
    }

}