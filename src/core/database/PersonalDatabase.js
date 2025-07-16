export class PersonalDatabase {
    constructor() {
        this.personalData = {
            interactions: [],
            patterns: {},
            preferences: {},
            memories: [],
            adaptations: []
        };
        this.initialized = false;
    }

    async initialize() {
        console.log('🗄️ Initializing Personal Database...');
        
        this.loadPersonalData();
        this.initialized = true;
        
        console.log('✅ Personal Database Ready');
    }

    loadPersonalData() {
        try {
            const stored = localStorage.getItem('eva_personal_database');
            if (stored) {
                this.personalData = { ...this.personalData, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.warn('Could not load personal data:', error);
        }
    }

    savePersonalData(data = null) {
        try {
            const dataToSave = data || this.personalData;
            localStorage.setItem('eva_personal_database', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('Could not save personal data:', error);
        }
    }

    async updateFromInteraction(input, response) {
        const interaction = {
            id: `interaction_${Date.now()}`,
            input,
            response: response.content || response,
            timestamp: new Date(),
            sentiment: this.analyzeSentiment(input),
            topics: this.extractTopics(input)
        };

        this.personalData.interactions.push(interaction);
        
        // Keep only last 1000 interactions for performance
        if (this.personalData.interactions.length > 1000) {
            this.personalData.interactions = this.personalData.interactions.slice(-1000);
        }

        // Update patterns
        await this.updatePatterns(interaction);
        
        this.savePersonalData();
    }

    async updatePatterns(interaction) {
        const hour = new Date().getHours();
        const timeSlot = this.getTimeSlot(hour);
        
        // Update time patterns
        if (!this.personalData.patterns.timeUsage) {
            this.personalData.patterns.timeUsage = {};
        }
        this.personalData.patterns.timeUsage[timeSlot] = 
            (this.personalData.patterns.timeUsage[timeSlot] || 0) + 1;

        // Update topic patterns
        if (!this.personalData.patterns.topicInterests) {
            this.personalData.patterns.topicInterests = {};
        }
        
        for (const topic of interaction.topics) {
            this.personalData.patterns.topicInterests[topic] = 
                (this.personalData.patterns.topicInterests[topic] || 0) + 1;
        }

        // Update command patterns
        const commandType = this.extractCommandType(interaction.input);
        if (!this.personalData.patterns.commandUsage) {
            this.personalData.patterns.commandUsage = {};
        }
        this.personalData.patterns.commandUsage[commandType] = 
            (this.personalData.patterns.commandUsage[commandType] || 0) + 1;
    }

    analyzeSentiment(text) {
        const positiveWords = ['good', 'great', 'awesome', 'excellent', 'love', 'like', 'happy', 'excited', 'amazing', 'wonderful'];
        const negativeWords = ['bad', 'terrible', 'hate', 'dislike', 'sad', 'angry', 'frustrated', 'annoying', 'awful', 'horrible'];
        
        const words = text.toLowerCase().split(/\s+/);
        let score = 0;
        
        words.forEach(word => {
            if (positiveWords.includes(word)) score += 1;
            if (negativeWords.includes(word)) score -= 1;
        });
        
        return score / Math.max(words.length, 1);
    }

    extractTopics(text) {
        const topics = [];
        const topicKeywords = {
            'technology': ['tech', 'computer', 'software', 'programming', 'code', 'ai', 'machine learning', 'development'],
            'work': ['work', 'job', 'project', 'task', 'business', 'meeting', 'deadline', 'career'],
            'creativity': ['create', 'design', 'art', 'music', 'write', 'creative', 'imagine', 'build'],
            'learning': ['learn', 'study', 'education', 'knowledge', 'understand', 'explain', 'teach'],
            'personal': ['personal', 'life', 'family', 'friend', 'relationship', 'health', 'feel', 'think'],
            'entertainment': ['movie', 'game', 'music', 'book', 'fun', 'entertainment', 'hobby']
        };
        
        const textLower = text.toLowerCase();
        
        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                topics.push(topic);
            }
        });
        
        return topics;
    }

    extractCommandType(input) {
        const inputLower = input.toLowerCase();
        
        if (inputLower.includes('search') || inputLower.includes('find')) return 'search';
        if (inputLower.includes('create') || inputLower.includes('make') || inputLower.includes('generate')) return 'create';
        if (inputLower.includes('remember') || inputLower.includes('learn') || inputLower.includes('note')) return 'remember';
        if (inputLower.includes('help') || inputLower.includes('what can')) return 'help';
        if (inputLower.includes('status') || inputLower.includes('how are')) return 'status';
        if (inputLower.includes('automate') || inputLower.includes('schedule')) return 'automate';
        
        return 'chat';
    }

    getTimeSlot(hour) {
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 22) return 'evening';
        return 'night';
    }

    async getPersonalData() {
        return this.personalData;
    }

    async getPersonalInsights() {
        const insights = {
            mostActiveTime: this.getMostActiveTime(),
            favoriteTopics: this.getFavoriteTopics(),
            preferredCommands: this.getPreferredCommands(),
            sentimentTrend: this.getSentimentTrend(),
            interactionCount: this.personalData.interactions.length
        };

        return insights;
    }

    getMostActiveTime() {
        const timeUsage = this.personalData.patterns.timeUsage || {};
        return Object.entries(timeUsage)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
    }

    getFavoriteTopics() {
        const topicInterests = this.personalData.patterns.topicInterests || {};
        return Object.entries(topicInterests)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([topic, count]) => ({ topic, count }));
    }

    getPreferredCommands() {
        const commandUsage = this.personalData.patterns.commandUsage || {};
        return Object.entries(commandUsage)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([command, count]) => ({ command, count }));
    }

    getSentimentTrend() {
        const recentInteractions = this.personalData.interactions.slice(-20);
        if (recentInteractions.length === 0) return 'neutral';
        
        const avgSentiment = recentInteractions.reduce((sum, interaction) => 
            sum + (interaction.sentiment || 0), 0) / recentInteractions.length;
        
        if (avgSentiment > 0.2) return 'positive';
        if (avgSentiment < -0.2) return 'negative';
        return 'neutral';
    }

    async addPersonalMemory(memory) {
        const memoryEntry = {
            id: `memory_${Date.now()}`,
            content: memory,
            timestamp: new Date(),
            importance: 0.8,
            type: 'personal'
        };

        this.personalData.memories.push(memoryEntry);
        this.savePersonalData();
        
        return memoryEntry.id;
    }

    async getPersonalMemories(limit = 10) {
        return this.personalData.memories
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    async clearPersonalData() {
        this.personalData = {
            interactions: [],
            patterns: {},
            preferences: {},
            memories: [],
            adaptations: []
        };
        this.savePersonalData();
    }
}