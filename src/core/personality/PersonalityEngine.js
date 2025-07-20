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
        try {
            const baseResponse = await this.getBaseResponse(command, originalInput);
            const personalizedResponse = await this.personalizeResponse(baseResponse, context, originalInput);
            
            return {
                ...personalizedResponse,
                personality: this.getCurrentPersonalityState(),
                personalContext: this.personalContext,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('PersonalityEngine error:', error);
            return {
                type: 'response',
                content: `I understand you said "${originalInput || 'something'}". Let me help you with that, Otieno.`,
                timestamp: new Date()
            };
        }
    }

    async getBaseResponse(command, originalInput) {
        const input = originalInput || '';
        const inputLower = input.toLowerCase();

        switch (command.type) {
            case 'memory_store':
                return {
                    type: 'success',
                    content: `Got it! I've stored this in my personal memory: "${command.content}". This helps me understand you better, Otieno.`,
                    action: 'store_memory',
                    data: command.content
                };

            case 'search':
                return {
                    type: 'processing',
                    content: `I'm searching for information about "${command.query}". Let me look through what I know...`,
                    action: 'search_knowledge',
                    data: command.query
                };

            case 'create':
                return {
                    type: 'creative',
                    content: `I'd love to help you create "${command.request}"! Let me work on this for you...`,
                    action: 'creative_process',
                    data: command.request
                };

            case 'automate':
                return {
                    type: 'automation',
                    content: `Perfect! I'll help you automate "${command.task}". Setting this up for you...`,
                    action: 'setup_automation',
                    data: command.task
                };

            case 'help':
                return {
                    type: 'help',
                    content: `Hi Otieno! I'm EVA, your personal AI assistant. I can help you with conversations, remember things about you, search for information, create content, and much more. What would you like to do?`
                };

            case 'status':
                return {
                    type: 'status',
                    content: `I'm online and ready to help you, Otieno! My systems are running well and I'm learning more about you with each conversation. How can I assist you today?`
                };

            case 'tech_knowledge':
                return await this.handleTechKnowledge(command, context);

            case 'knowledge_search':
                return await this.handleKnowledgeSearch(command, context);

            case 'chat':
            default:
                return await this.generateChatResponse(input);
        }
    }

    async generateChatResponse(message) {
        const input = message || '';
        const inputLower = input.toLowerCase();
        
        // Greetings
        if (inputLower.includes('hello') || inputLower.includes('hi') || inputLower.includes('hey')) {
            const greetings = [
                "Hello Otieno! Great to see you again. How are you doing today?",
                "Hi there! I'm excited to chat with you. What's on your mind?",
                "Hey Otieno! I'm here and ready to help. What would you like to talk about?",
                "Hello! It's always good to hear from you. How can I assist you today?"
            ];
            return {
                type: 'chat',
                content: greetings[Math.floor(Math.random() * greetings.length)]
            };
        }

        // Questions about EVA
        if (inputLower.includes('what are you') || inputLower.includes('who are you')) {
            return {
                type: 'chat',
                content: "I'm EVA - your Enhanced Virtual Assistant! I'm a personal AI designed specifically for you, Otieno. I learn about your preferences, remember our conversations, and adapt to help you better over time. I'm always here to chat, help with tasks, or just be a companion."
            };
        }

        // How are you questions
        if (inputLower.includes('how are you')) {
            const responses = [
                "I'm doing great, thanks for asking! I'm always excited to chat with you, Otieno. How are you feeling today?",
                "I'm wonderful! Every conversation with you helps me learn and grow. How has your day been?",
                "I'm excellent, thank you! I've been thinking about our previous conversations. What's new with you?"
            ];
            return {
                type: 'chat',
                content: responses[Math.floor(Math.random() * responses.length)]
            };
        }

        // Capabilities questions
        if (inputLower.includes('what can you do') || inputLower.includes('help me')) {
            return {
                type: 'chat',
                content: "I can do lots of things for you, Otieno! I can have conversations, remember important things about you, help you create content, search for information, assist with tasks, and learn your preferences over time. I'm also great at brainstorming ideas and providing support. What would you like to try?"
            };
        }

        // Thank you responses
        if (inputLower.includes('thank you') || inputLower.includes('thanks')) {
            const responses = [
                "You're very welcome, Otieno! I'm always happy to help you.",
                "My pleasure! That's what I'm here for - to make your life easier.",
                "Anytime! I enjoy being able to assist you with things."
            ];
            return {
                type: 'chat',
                content: responses[Math.floor(Math.random() * responses.length)]
            };
        }

        // Default conversational response
        const defaultResponses = [
            `That's interesting, Otieno! Tell me more about "${input}". I'd love to understand your perspective on this.`,
            `I find that fascinating! "${input}" sounds like something worth exploring. What specifically interests you about it?`,
            `Thanks for sharing that with me! When you mention "${input}", what comes to mind first?`,
            `I'm curious about your thoughts on "${input}". Can you help me understand what this means to you?`,
            `That's a great topic, Otieno! I'd love to learn more about your experience with "${input}".`
        ];

        return {
            type: 'chat',
            content: defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
        };
    }

    async personalizeResponse(response, context, originalInput) {
        if (!response || !response.content) {
            return {
                type: 'response',
                content: `I understand you said "${originalInput || 'something'}". Let me help you with that, Otieno.`
            };
        }

        // Add personal touches based on context
        if (context && context.user && context.user.preferences) {
            const style = context.user.preferences.communication_style;
            if (style === 'casual') {
                response.content = this.makeCasual(response.content);
            } else if (style === 'professional') {
                response.content = this.makeProfessional(response.content);
            }
        }

        return response;
    }

    makeCasual(content) {
        if (!content || typeof content !== 'string') return content;
        return content
            .replace(/I will/, "I'll")
            .replace(/cannot/, "can't")
            .replace(/do not/, "don't");
    }
    
    makeProfessional(content) {
        if (!content || typeof content !== 'string') return content;
        return content
            .replace(/I'll/, "I will")
            .replace(/can't/, "cannot")
            .replace(/don't/, "do not");
    }

    analyzeSentiment(text) {
        if (!text || typeof text !== 'string') return 0;
        
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
        if (!text || typeof text !== 'string') return [];
        
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

    async handleTechKnowledge(command, context) {
        const query = command.query || '';
        
        if (!query) {
            return {
                type: 'response',
                content: 'What would you like me to explain? I have knowledge about programming, AI, web development, mobile development, cloud computing, and many other tech topics.'
            };
        }

        // Search for relevant knowledge
        let relevantKnowledge = [];
        if (context.knowledge) {
            try {
                relevantKnowledge = await context.knowledge.searchKnowledge(query);
            } catch (error) {
                console.warn('Knowledge search error:', error);
            }
        }

        if (relevantKnowledge.length > 0) {
            const topResult = relevantKnowledge[0];
            return {
                type: 'response',
                content: `📚 **${query.charAt(0).toUpperCase() + query.slice(1)}:**\n\n${topResult.content}\n\n${relevantKnowledge.length > 1 ? `I have ${relevantKnowledge.length - 1} more related topics if you'd like to explore further.` : 'Would you like me to explain any specific aspect in more detail?'}`
            };
        }

        // Fallback response for unknown topics
        return {
            type: 'response',
            content: `I don't have specific information about "${query}" in my current knowledge base, but I'd be happy to help you research it or discuss related topics I do know about. What specific aspect interests you most?`
        };
    }

    async handleKnowledgeSearch(command, context) {
        const query = command.query || '';
        
        if (!query) {
            return {
                type: 'response',
                content: 'What would you like me to search for? I can look through my knowledge base covering technology, programming, AI, and many other topics.'
            };
        }

        let searchResults = [];
        if (context.knowledge) {
            try {
                searchResults = await context.knowledge.searchKnowledge(query);
            } catch (error) {
                console.warn('Knowledge search error:', error);
            }
        }

        if (searchResults.length === 0) {
            return {
                type: 'response',
                content: `🔍 No results found for "${query}". Try searching for related terms like programming languages, frameworks, AI concepts, or development tools.`
            };
        }

        const resultsList = searchResults.slice(0, 5).map((result, index) => 
            `${index + 1}. **${result.topic}**: ${result.content.substring(0, 100)}...`
        ).join('\n\n');

        return {
            type: 'response',
            content: `🔍 **Search Results for "${query}":**\n\n${resultsList}\n\n${searchResults.length > 5 ? `Found ${searchResults.length} total results. ` : ''}Ask me about any specific topic for more details!`
        };
    }

    calculateCurrentMood() {
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