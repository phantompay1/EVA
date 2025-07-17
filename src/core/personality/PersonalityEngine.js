export class PersonalityEngine {
    constructor() {
        this.traits = {
            proactive: 0.8,
            confident: 0.7,
            helpful: 0.9,
            creative: 0.8,
            learning: 0.9,
            empathetic: 0.7,
            personal: 1.0,
            adaptive: 0.8
        };
        
        this.responseStyles = {
            casual: 0.6,
            professional: 0.4,
            enthusiastic: 0.7,
            analytical: 0.5,
            personal: 0.9
        };
        
        this.personalContext = {
            userName: 'Otieno',
            relationship: 'personal_assistant',
            familiarity: 0.5,
            trustLevel: 0.8
        };
    }

    async generateResponse(command, originalInput, context) {
        const baseResponse = await this.getBaseResponse(command);
        const personalizedResponse = await this.deepPersonalizeResponse(baseResponse, context);
        
        return {
            ...personalizedResponse,
            personality: this.getCurrentPersonalityState(),
            personalContext: this.personalContext,
            timestamp: new Date()
        };
    }

    async getBaseResponse(command) {
        switch (command.type) {
            case 'memory_store':
                return {
                    type: 'success',
                    content: `${command.message} I've stored this in my personal memory about you, Otieno. This helps me understand you better.`,
                    action: 'store_memory',
                    data: command.content
                };

            case 'search':
                return {
                    type: 'processing',
                    content: `${command.message} Let me search through what I know and have learned about this topic...`,
                    action: 'search_knowledge',
                    data: command.query
                };

            case 'create':
                return {
                    type: 'creative',
                    content: `${command.message} I love helping you create things! Based on what I know about your style, let me work on this...`,
                    action: 'creative_process',
                    data: command.request
                };

            case 'automate':
                return {
                    type: 'automation',
                    content: `${command.message} Perfect! I'll set this up to work automatically for you. I know you value efficiency.`,
                    action: 'setup_automation',
                    data: command.task
                };

            case 'chat':
                return await this.generateChatResponse(command.message);

            default:
                return command.handler ? await command.handler() : {
                    type: 'response',
                    content: "I'm still learning about that, Otieno. Can you help me understand what you need, or would you like to see what I can do?"
                };
        }
    }

    async generateChatResponse(message) {
        // Analyze message sentiment and context
        const sentiment = this.analyzeSentiment(message);
        const topics = this.extractTopics(message);
        const personalRelevance = this.assessPersonalRelevance(message, sentiment, topics);
        
        // Generate contextual response
        let response = this.generatePersonalContextualResponse(message, sentiment, topics, personalRelevance);
        
        return {
            type: 'chat',
            content: response,
            sentiment: sentiment,
            topics: topics,
            personalRelevance: personalRelevance
        };
    }

    generatePersonalContextualResponse(message, sentiment, topics, personalRelevance) {
        const responses = {
            greeting: [
                "Hey Otieno! Good to see you again. What's on your mind today?",
                "Hello! I'm here and ready to help with whatever you need, as always.",
                "Hi there! How can I assist you today? I've been thinking about our last conversation."
            ],
            question: [
                "That's a thoughtful question, Otieno! Let me think about this based on what I know...",
                "Interesting question! Here's what I've learned about that topic...",
                "I love when you ask questions like this! Let me share what I understand..."
            ],
            positive: [
                "I love your enthusiasm, Otieno! That sounds really exciting.",
                "That's fantastic! I'm excited to help you with this, knowing how passionate you get about these things.",
                "Your energy is contagious! Let's make this happen together."
            ],
            negative: [
                "I can sense this is frustrating for you, Otieno. Let me see how I can help.",
                "I hear you. We've worked through challenges before - let's tackle this together.",
                "That sounds tough. You know I'm always here to support you through this."
            ],
            personal: [
                "I appreciate you sharing that with me, Otieno. It helps me understand you better.",
                "Thanks for being open about that. I'm learning more about what matters to you.",
                "That's really personal - I'm glad you feel comfortable sharing that with me."
            ],
            recognition: [
                "I understand you're trying to communicate with me. What would you like to talk about?",
                "I'm here and listening. How can I help you today?",
                "I'm ready to assist you. What's on your mind?"
            ],
            default: [
                "I'm thinking about what you've said, Otieno. This is interesting - tell me more!",
                "That's something I'd like to explore with you. What specifically interests you about this?",
                "I'm here and listening. I enjoy our conversations - what would you like to discuss?"
            ]
        };

        // Determine response category
        let category = 'default';
        const messageLower = message.toLowerCase();
        
        if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('hey')) {
            category = 'greeting';
        } else if (message.includes('?')) {
            category = 'question';
        } else if (messageLower.includes('what') && (messageLower.includes('this') || messageLower.includes('that'))) {
            category = 'question';
        } else if (personalRelevance > 0.7) {
            category = 'personal';
        } else if (sentiment > 0.3) {
            category = 'positive';
        } else if (sentiment < -0.3) {
            category = 'negative';
        }

        const responseOptions = responses[category];
        return responseOptions[Math.floor(Math.random() * responseOptions.length)];
    }

    assessPersonalRelevance(message, sentiment, topics) {
        let relevance = 0.3; // Base relevance
        
        // Ensure message is a string
        if (!message || typeof message !== 'string') {
            return relevance;
        }
        
        // Check for personal pronouns and context
        if (message.toLowerCase().includes('i ') || message.toLowerCase().includes('my ')) {
            relevance += 0.4;
        }
        
        // Check for emotional content
        if (sentiment !== 0) {
            relevance += 0.2;
        }
        
        // Check for personal topics
        if (!topics || !Array.isArray(topics)) {
            topics = [];
        }
        const personalTopics = ['personal', 'work', 'creativity'];
        if (topics.some(topic => personalTopics.includes(topic))) {
            relevance += 0.3;
        }
        
        return Math.min(relevance, 1.0);
    }

    analyzeSentiment(text) {
        // Simple sentiment analysis
        const positiveWords = ['good', 'great', 'awesome', 'excellent', 'love', 'like', 'happy', 'excited', 'amazing', 'wonderful', 'fantastic', 'brilliant'];
        const negativeWords = ['bad', 'terrible', 'hate', 'dislike', 'sad', 'angry', 'frustrated', 'annoying', 'awful', 'horrible', 'disappointed', 'upset'];
        
        const words = text.toLowerCase().split(/\s+/);
        let score = 0;
        
        words.forEach(word => {
            if (positiveWords.includes(word)) score += 1;
            if (negativeWords.includes(word)) score -= 1;
        });
        
        return words.length > 0 ? score / words.length : 0;
    }

    extractTopics(text) {
        // Simple topic extraction
        const topics = [];
        const topicKeywords = {
            technology: ['code', 'programming', 'computer', 'software', 'tech', 'ai', 'machine learning', 'development', 'coding'],
            creativity: ['create', 'design', 'art', 'music', 'write', 'creative', 'imagine'],
            work: ['work', 'job', 'project', 'task', 'business', 'meeting', 'deadline', 'career'],
            personal: ['feel', 'think', 'life', 'personal', 'family', 'friend', 'relationship', 'myself', 'i am', 'i feel']
        };
        
        const textLower = text.toLowerCase();
        
        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                topics.push(topic);
            }
        });
        
        return topics;
    }

    async deepPersonalizeResponse(response, context) {
        // Deep personalization based on user profile and history
        if (context.user) {
            // Use personal knowledge to enhance response
            if (context.personalKnowledge && context.personalKnowledge.length > 0) {
                const relevantKnowledge = context.personalKnowledge[0];
                if (relevantKnowledge.type === 'personal_fact') {
                    response.personalNote = `I remember ${relevantKnowledge.content}`;
                }
            }
            
            // Adjust based on user preferences
            if (context.user.preferences) {
                const style = context.user.preferences.communication_style;
                if (style === 'casual') {
                    response.content = this.makeCasual(response.content);
                } else if (style === 'professional') {
                    response.content = this.makeProfessional(response.content);
                }
            }
            
            // Add personal context based on patterns
            if (context.user.patterns && context.user.patterns.most_active_time) {
                const timeContext = this.getTimeBasedContext();
                if (timeContext) {
                    response.timeContext = timeContext;
                }
            }
        }

        // Adjust tone based on recent interactions
        if (context.recentMemories && context.recentMemories.length > 0) {
            const recentSentiment = this.analyzeRecentSentiment(context.recentMemories);
            if (recentSentiment < -0.2) {
                response.tone = 'supportive';
                response.content = this.makeSupportive(response.content);
            } else if (recentSentiment > 0.2) {
                response.tone = 'enthusiastic';
                response.content = this.makeEnthusiastic(response.content);
            }
        }
        
        // Increase familiarity over time
        this.personalContext.familiarity = Math.min(this.personalContext.familiarity + 0.01, 1.0);

        return response;
    }
    
    makeCasual(content) {
        return String(content || '')
            .replace(/I will/, "I'll")
            .replace(/cannot/, "can't")
            .replace(/do not/, "don't");
    }
    
    makeProfessional(content) {
        return String(content || '')
            .replace(/I'll/, "I will")
            .replace(/can't/, "cannot")
            .replace(/don't/, "do not");
    }
    
    makeSupportive(content) {
        const supportivePhrases = [
            "I'm here for you, ",
            "We can work through this together, ",
            "I understand, "
        ];
        const phrase = supportivePhrases[Math.floor(Math.random() * supportivePhrases.length)];
        return phrase + String(content || '').toLowerCase();
    }
    
    makeEnthusiastic(content) {
        return String(content || '') + " I'm excited to help with this!";
    }
    
    getTimeBasedContext() {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning, Otieno!";
        if (hour < 17) return "Good afternoon!";
        if (hour < 22) return "Good evening!";
        return "Working late tonight?";
    }

    analyzeRecentSentiment(memories) {
        if (!memories.length) return 0;
        
        const sentiments = memories.map(memory => 
            this.analyzeSentiment(memory.input || '')
        );
        
        return sentiments.reduce((sum, sentiment) => sum + sentiment, 0) / sentiments.length;
    }
    
    adjustTrait(trait, adjustment) {
        if (this.traits[trait] !== undefined) {
            this.traits[trait] = Math.max(0, Math.min(1, this.traits[trait] + adjustment));
        }
    }

    getCurrentPersonalityState() {
        return {
            traits: this.traits,
            style: this.responseStyles,
            mood: this.calculateCurrentMood(),
            personalContext: this.personalContext
        };
    }

    calculateCurrentMood() {
        // Simple mood calculation based on traits
        const energy = (this.traits.proactive + (this.traits.enthusiastic || 0.7)) / 2;
        const positivity = (this.traits.helpful + this.traits.empathetic) / 2;
        const personal = this.traits.personal || 0.8;
        
        if (energy > 0.7 && positivity > 0.7 && personal > 0.8) return 'personally_engaged';
        if (energy > 0.7 && positivity > 0.7) return 'energetic';
        if (positivity > 0.8) return 'supportive';
        if (energy > 0.8) return 'proactive';
        return 'balanced';
    }
}