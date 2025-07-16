export class LearningSystem {
    constructor() {
        this.patterns = new Map();
        this.userBehavior = {
            commandFrequency: new Map(),
            timePatterns: new Map(),
            topicInterests: new Map(),
            responsePreferences: new Map()
        };
        this.learningProgress = 0;
    }

    async processInteraction(input, userProfile) {
        // Analyze command patterns
        await this.analyzeCommandPattern(input);
        
        // Track time patterns
        await this.analyzeTimePattern();
        
        // Extract topics of interest
        await this.analyzeTopicInterest(input);
        
        // Update learning progress
        this.updateLearningProgress();
        
        console.log(`🧠 Learning from interaction: "${input.substring(0, 50)}..."`);
    }

    async analyzeCommandPattern(input) {
        const commandType = this.extractCommandType(input);
        
        const current = this.userBehavior.commandFrequency.get(commandType) || 0;
        this.userBehavior.commandFrequency.set(commandType, current + 1);
        
        // Store pattern
        const patternId = `command_${commandType}_${Date.now()}`;
        this.patterns.set(patternId, {
            type: 'command_frequency',
            command: commandType,
            frequency: current + 1,
            lastUsed: new Date(),
            confidence: Math.min((current + 1) / 10, 1.0)
        });
    }

    async analyzeTimePattern() {
        const hour = new Date().getHours();
        const timeSlot = this.getTimeSlot(hour);
        
        const current = this.userBehavior.timePatterns.get(timeSlot) || 0;
        this.userBehavior.timePatterns.set(timeSlot, current + 1);
    }

    async analyzeTopicInterest(input) {
        const topics = this.extractTopics(input);
        
        for (const topic of topics) {
            const current = this.userBehavior.topicInterests.get(topic) || 0;
            this.userBehavior.topicInterests.set(topic, current + 1);
        }
    }

    async analyzePatterns() {
        console.log('🔍 Analyzing user patterns...');
        
        // Analyze command preferences
        const commandPatterns = await this.findCommandPatterns();
        
        // Analyze time-based patterns
        const timePatterns = await this.findTimePatterns();
        
        // Analyze topic preferences
        const topicPatterns = await this.findTopicPatterns();
        
        // Store insights
        const insights = {
            commands: commandPatterns,
            timing: timePatterns,
            topics: topicPatterns,
            timestamp: new Date()
        };
        
        this.patterns.set(`analysis_${Date.now()}`, {
            type: 'pattern_analysis',
            insights,
            confidence: this.calculateOverallConfidence()
        });
        
        return insights;
    }

    async findCommandPatterns() {
        const commands = Array.from(this.userBehavior.commandFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        return {
            mostUsed: commands[0] ? commands[0][0] : null,
            frequency: commands,
            trend: this.calculateCommandTrend()
        };
    }

    async findTimePatterns() {
        const times = Array.from(this.userBehavior.timePatterns.entries())
            .sort((a, b) => b[1] - a[1]);
        
        return {
            mostActive: times[0] ? times[0][0] : null,
            distribution: times,
            peakHours: this.findPeakHours()
        };
    }

    async findTopicPatterns() {
        const topics = Array.from(this.userBehavior.topicInterests.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        return {
            interests: topics,
            emerging: this.findEmergingTopics(),
            categories: this.categorizeTopics(topics)
        };
    }

    extractCommandType(input) {
        const inputLower = input.toLowerCase();
        
        if (inputLower.includes('search') || inputLower.includes('find')) return 'search';
        if (inputLower.includes('create') || inputLower.includes('make')) return 'create';
        if (inputLower.includes('remember') || inputLower.includes('learn')) return 'remember';
        if (inputLower.includes('help') || inputLower.includes('what can')) return 'help';
        if (inputLower.includes('status') || inputLower.includes('how are')) return 'status';
        if (inputLower.includes('automate') || inputLower.includes('schedule')) return 'automate';
        
        return 'chat';
    }

    extractTopics(input) {
        const topics = [];
        const topicKeywords = {
            'technology': ['tech', 'computer', 'software', 'programming', 'code', 'ai', 'machine learning'],
            'work': ['work', 'job', 'project', 'task', 'business', 'meeting', 'deadline'],
            'creativity': ['create', 'design', 'art', 'music', 'write', 'creative', 'imagine'],
            'learning': ['learn', 'study', 'education', 'knowledge', 'understand', 'explain'],
            'productivity': ['productive', 'efficient', 'organize', 'plan', 'schedule', 'manage'],
            'personal': ['personal', 'life', 'family', 'friend', 'relationship', 'health']
        };
        
        const inputLower = input.toLowerCase();
        
        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            if (keywords.some(keyword => inputLower.includes(keyword))) {
                topics.push(topic);
            }
        });
        
        return topics;
    }

    getTimeSlot(hour) {
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 22) return 'evening';
        return 'night';
    }

    calculateCommandTrend() {
        // Simple trend calculation - in a full implementation, this would be more sophisticated
        const totalCommands = Array.from(this.userBehavior.commandFrequency.values())
            .reduce((sum, count) => sum + count, 0);
        
        return totalCommands > 10 ? 'increasing' : 'stable';
    }

    findPeakHours() {
        const hourCounts = new Map();
        
        // This would track actual usage hours in a full implementation
        // For now, return simulated peak hours
        return ['morning', 'evening'];
    }

    findEmergingTopics() {
        // Identify topics that are gaining interest
        const recent = Array.from(this.userBehavior.topicInterests.entries())
            .filter(([topic, count]) => count >= 2)
            .slice(0, 3);
        
        return recent.map(([topic]) => topic);
    }

    categorizeTopics(topics) {
        const categories = {
            technical: [],
            personal: [],
            creative: [],
            professional: []
        };
        
        topics.forEach(([topic, count]) => {
            if (['technology', 'programming'].includes(topic)) {
                categories.technical.push({ topic, count });
            } else if (['personal', 'health'].includes(topic)) {
                categories.personal.push({ topic, count });
            } else if (['creativity', 'art'].includes(topic)) {
                categories.creative.push({ topic, count });
            } else {
                categories.professional.push({ topic, count });
            }
        });
        
        return categories;
    }

    calculateOverallConfidence() {
        const totalInteractions = Array.from(this.userBehavior.commandFrequency.values())
            .reduce((sum, count) => sum + count, 0);
        
        return Math.min(totalInteractions / 50, 1.0); // Confidence increases with interactions
    }

    updateLearningProgress() {
        const totalPatterns = this.patterns.size;
        const totalInteractions = Array.from(this.userBehavior.commandFrequency.values())
            .reduce((sum, count) => sum + count, 0);
        
        // Simple progress calculation
        this.learningProgress = Math.min((totalPatterns * 2 + totalInteractions) / 100, 1.0);
    }

    getProgress() {
        return Math.round(this.learningProgress * 100);
    }

    getInsights() {
        return {
            patterns: Array.from(this.patterns.values()),
            behavior: {
                commandFrequency: Array.from(this.userBehavior.commandFrequency.entries()),
                timePatterns: Array.from(this.userBehavior.timePatterns.entries()),
                topicInterests: Array.from(this.userBehavior.topicInterests.entries())
            },
            progress: this.getProgress()
        };
    }

    reset() {
        this.patterns.clear();
        this.userBehavior = {
            commandFrequency: new Map(),
            timePatterns: new Map(),
            topicInterests: new Map(),
            responsePreferences: new Map()
        };
        this.learningProgress = 0;
    }
}