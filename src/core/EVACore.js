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

        // Update context
        this.currentContext = { 
            ...this.currentContext, 
            ...context,
            user: this.userProfile,
            session_time: new Date(),
            offline_mode: true
        };
        
        // Learn from interaction personally
        await this.learning.processInteraction(input, this.userProfile);
        
        // Process command
        const command = await this.commandProcessor.parse(input);
        
        // Generate personalized response
        const response = await this.generateResponse(command, input);
        
        // Store in personal memory
        await this.memory.storeInteraction({
            input,
            response,
            context: this.currentContext,
            timestamp: new Date(),
            personal_relevance: this.calculatePersonalRelevance(input)
        });
        
        // Update personal database
        await this.personalDB.updateFromInteraction(input, response);

        return response;
    }

    async generateResponse(command, originalInput) {
        const context = {
            user: this.userProfile,
            currentContext: this.currentContext,
            recentMemories: await this.memory.getRecentMemories(10),
            personalKnowledge: await this.knowledge.getRelevantKnowledge(originalInput),
            offlineMode: true
        };

        return await this.personality.generateResponse(command, originalInput, context);
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