export class PersonalityEngine {
    constructor() {
        this.traits = {
            proactive: 0.8,
            confident: 0.7,
            helpful: 0.9,
            creative: 0.8,
            learning: 0.9,
            empathetic: 0.7
        };
        
        this.responseStyles = {
            casual: 0.6,
            professional: 0.4,
            enthusiastic: 0.7,
            analytical: 0.5
        };
    }

    async generateResponse(command, originalInput, context) {
        const baseResponse = await this.getBaseResponse(command);
        const personalizedResponse = await this.personalizeResponse(baseResponse, context);
        
        return {
            ...personalizedResponse,
            personality: this.getCurrentPersonalityState(),
            timestamp: new Date()
        };
    }

    async getBaseResponse(command) {
        switch (command.type) {
            case 'memory_store':
                return {
                    type: 'success',
                    content: `${command.message} I've added this to my memory and will use it to better assist you.`,
                    action: 'store_memory',
                    data: command.content
                };

            case 'search':
                return {
                    type: 'processing',
                    content: `${command.message} Let me search my knowledge base and the web for relevant information...`,
                    action: 'search_knowledge',
                    data: command.query
                };

            case 'create':
                return {
                    type: 'creative',
                    content: `${command.message} I'm excited to help you create this! Let me think about the best approach...`,
                    action: 'creative_process',
                    data: command.request
                };

            case 'automate':
                return {
                    type: 'automation',
                    content: `${command.message} I'll set this up to run automatically. This is exactly the kind of task I love handling for you!`,
                    action: 'setup_automation',
                    data: command.task
                };

            case 'chat':
                return await this.generateChatResponse(command.message);

            default:
                return command.handler ? await command.handler() : {
                    type: 'response',
                    content: "I'm not sure how to handle that yet, but I'm learning! Can you try rephrasing or ask me what I can do?"
                };
        }
    }

    async generateChatResponse(message) {
        // Analyze message sentiment and context
        const sentiment = this.analyzeSentiment(message);
        const topics = this.extractTopics(message);
        
        // Generate contextual response
        let response = this.generateContextualResponse(message, sentiment, topics);
        
        return {
            type: 'chat',
            content: response,
            sentiment: sentiment,
            topics: topics
        };
    }

    generateContextualResponse(message, sentiment, topics) {
        const responses = {
            greeting: [
                "Hey Otieno! Great to see you. What's on your mind today?",
                "Hello! I'm here and ready to help with whatever you need.",
                "Hi there! How can I assist you today?"
            ],
            question: [
                "That's a great question! Let me think about this...",
                "Interesting question! Here's what I know about that...",
                "I love curious questions like this! Let me help you understand..."
            ],
            positive: [
                "I love your enthusiasm! That sounds exciting.",
                "That's fantastic! I'm excited to help you with this.",
                "Great energy! Let's make this happen."
            ],
            negative: [
                "I understand this might be frustrating. Let me see how I can help.",
                "I hear you. Let's work through this together.",
                "That sounds challenging. I'm here to support you."
            ],
            default: [
                "I'm processing what you've said. This is interesting...",
                "Let me think about this and give you a thoughtful response.",
                "I'm here and listening. Tell me more about what you need."
            ]
        };

        // Determine response category
        let category = 'default';
        if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
            category = 'greeting';
        } else if (message.includes('?')) {
            category = 'question';
        } else if (sentiment > 0.3) {
            category = 'positive';
        } else if (sentiment < -0.3) {
            category = 'negative';
        }

        const responseOptions = responses[category];
        return responseOptions[Math.floor(Math.random() * responseOptions.length)];
    }

    analyzeSentiment(text) {
        // Simple sentiment analysis
        const positiveWords = ['good', 'great', 'awesome', 'excellent', 'love', 'like', 'happy', 'excited'];
        const negativeWords = ['bad', 'terrible', 'hate', 'dislike', 'sad', 'angry', 'frustrated', 'annoying'];
        
        const words = text.toLowerCase().split(/\s+/);
        let score = 0;
        
        words.forEach(word => {
            if (positiveWords.includes(word)) score += 1;
            if (negativeWords.includes(word)) score -= 1;
        });
        
        return score / words.length;
    }

    extractTopics(text) {
        // Simple topic extraction
        const topics = [];
        const topicKeywords = {
            technology: ['code', 'programming', 'computer', 'software', 'tech', 'ai', 'machine learning'],
            creativity: ['create', 'design', 'art', 'music', 'write', 'creative', 'imagine'],
            work: ['work', 'job', 'project', 'task', 'business', 'meeting', 'deadline'],
            personal: ['feel', 'think', 'life', 'personal', 'family', 'friend', 'relationship']
        };
        
        const textLower = text.toLowerCase();
        
        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                topics.push(topic);
            }
        });
        
        return topics;
    }

    async personalizeResponse(response, context) {
        // Add personal touches based on user profile
        if (context.user && context.user.name) {
            // Occasionally use the user's name
            if (Math.random() < 0.3) {
                response.content = response.content.replace(/^/, `${context.user.name}, `);
            }
        }

        // Adjust tone based on recent interactions
        if (context.recentMemories && context.recentMemories.length > 0) {
            const recentSentiment = this.analyzeRecentSentiment(context.recentMemories);
            if (recentSentiment < -0.2) {
                response.tone = 'supportive';
            } else if (recentSentiment > 0.2) {
                response.tone = 'enthusiastic';
            }
        }

        return response;
    }

    analyzeRecentSentiment(memories) {
        if (!memories.length) return 0;
        
        const sentiments = memories.map(memory => 
            this.analyzeSentiment(memory.input || '')
        );
        
        return sentiments.reduce((sum, sentiment) => sum + sentiment, 0) / sentiments.length;
    }

    getCurrentPersonalityState() {
        return {
            traits: this.traits,
            style: this.responseStyles,
            mood: this.calculateCurrentMood()
        };
    }

    calculateCurrentMood() {
        // Simple mood calculation based on traits
        const energy = (this.traits.proactive + this.traits.enthusiastic) / 2;
        const positivity = (this.traits.helpful + this.traits.empathetic) / 2;
        
        if (energy > 0.7 && positivity > 0.7) return 'energetic';
        if (positivity > 0.8) return 'supportive';
        if (energy > 0.8) return 'proactive';
        return 'balanced';
    }
}