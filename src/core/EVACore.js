import { MemorySystem } from './memory/MemorySystem.js';
import { KnowledgeMiner } from './knowledge/KnowledgeMiner.js';
import { CommandProcessor } from './commands/CommandProcessor.js';
import { PersonalityEngine } from './personality/PersonalityEngine.js';
import { LearningSystem } from './learning/LearningSystem.js';

export class EVACore {
    constructor() {
        this.memory = new MemorySystem();
        this.knowledgeMiner = new KnowledgeMiner();
        this.commandProcessor = new CommandProcessor();
        this.personality = new PersonalityEngine();
        this.learning = new LearningSystem();
        
        this.isActive = false;
        this.currentContext = {};
        this.userProfile = {
            name: 'Otieno',
            preferences: {},
            patterns: {},
            mood: 'neutral'
        };
    }

    async initialize() {
        console.log('🧠 Initializing EVA Core Systems...');
        
        await this.memory.initialize();
        await this.loadUserProfile();
        await this.startAutonomousLearning();
        
        this.isActive = true;
        console.log('✅ EVA Core Systems Online');
    }

    async loadUserProfile() {
        const profile = await this.memory.getUserProfile();
        if (profile) {
            this.userProfile = { ...this.userProfile, ...profile };
        }
    }

    async processInput(input, context = {}) {
        if (!this.isActive) return null;

        // Update context
        this.currentContext = { ...this.currentContext, ...context };
        
        // Learn from interaction
        await this.learning.processInteraction(input, this.userProfile);
        
        // Process command
        const command = await this.commandProcessor.parse(input);
        
        // Generate response with personality
        const response = await this.generateResponse(command, input);
        
        // Store in memory
        await this.memory.storeInteraction({
            input,
            response,
            context: this.currentContext,
            timestamp: new Date()
        });

        return response;
    }

    async generateResponse(command, originalInput) {
        const context = {
            user: this.userProfile,
            currentContext: this.currentContext,
            recentMemories: await this.memory.getRecentMemories(10)
        };

        return await this.personality.generateResponse(command, originalInput, context);
    }

    async startAutonomousLearning() {
        // Start background knowledge mining
        setInterval(async () => {
            if (this.isActive) {
                await this.knowledgeMiner.autonomousSearch(this.userProfile.interests || []);
            }
        }, 300000); // Every 5 minutes

        // Start pattern learning
        setInterval(async () => {
            if (this.isActive) {
                await this.learning.analyzePatterns();
            }
        }, 600000); // Every 10 minutes
    }

    async updateUserProfile(updates) {
        this.userProfile = { ...this.userProfile, ...updates };
        await this.memory.saveUserProfile(this.userProfile);
    }

    getStatus() {
        return {
            active: this.isActive,
            user: this.userProfile.name,
            memoryCount: this.memory.getMemoryCount(),
            learningProgress: this.learning.getProgress()
        };
    }
}