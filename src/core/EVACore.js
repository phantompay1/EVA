import { MemorySystem } from './memory/MemorySystem.js';
import { OfflineKnowledge } from './knowledge/OfflineKnowledge.js';
import { CommandProcessor } from './commands/CommandProcessor.js';
import { PersonalityEngine } from './personality/PersonalityEngine.js';
import { LearningSystem } from './learning/LearningSystem.js';
import { PersonalDatabase } from './database/PersonalDatabase.js';

export class EVACore {
    constructor() {
        this.memory = new MemorySystem();
        this.knowledge = new OfflineKnowledge();
        this.commandProcessor = new CommandProcessor();
        this.personality = new PersonalityEngine();
        this.learning = new LearningSystem();
        this.personalDB = new PersonalDatabase();
        
        this.isActive = false;
        this.currentContext = {};
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
        console.log('🧠 Initializing EVA Core Systems...');
        
        await this.memory.initialize();
        await this.knowledge.initialize();
        await this.personalDB.initialize();
        await this.loadUserProfile();
        await this.startPersonalLearning();
        
        this.isActive = true;
        console.log('✅ EVA Personal Systems Online - Ready for Otieno');
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
                offlineMode: true
            };

            const response = await this.personality.generateResponse(command, originalInput, context);
            
            // Ensure response has proper structure
            if (!response || !response.content) {
                return {
                    type: 'response',
                    content: `I understand you said "${originalInput}". Let me help you with that, Otieno.`,
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
                content: `I'm having a small technical hiccup, but I'm here for you, Otieno. What would you like to talk about?`,
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
            mode: 'Personal & Offline',
            memoryCount: this.memory.getMemoryCount(),
            learningProgress: this.learning.getProgress(),
            personalKnowledge: this.knowledge.getKnowledgeCount(),
            adaptationLevel: this.calculateAdaptationLevel()
        };
    }
    
    calculateAdaptationLevel() {
        const interactions = this.memory.getMemoryCount();
        const patterns = Object.keys(this.userProfile.patterns).length;
        const preferences = Object.keys(this.userProfile.preferences).length;
        
        return Math.min((interactions * 2 + patterns * 5 + preferences * 3) / 100, 100);
    }
}