/**
 * Conversation Context Manager
 * Manages intelligent conversation flow, context retention, and user preferences
 */

class ConversationContextManager {
    constructor() {
        this.sessions = new Map();
        this.currentSessionId = null;
        this.globalContext = {
            userName: 'User',
            preferences: {
                responseStyle: 'conversational',
                language: 'en',
                detailLevel: 'balanced',
                personality: 'helpful'
            },
            topics: [],
            entities: new Map(),
            relationships: []
        };
        this.contextWindow = 10; // Number of messages to keep in active context
        this.maxSessions = 50; // Maximum number of sessions to retain
        this.initialized = false;
    }

    async initialize() {
        try {
            // Load existing context from storage
            await this.loadContextFromStorage();
            
            // Start a new session
            this.currentSessionId = this.createNewSession();
            
            this.initialized = true;
            console.log('🧠 Conversation Context Manager initialized');
            
            return { success: true, sessionId: this.currentSessionId };
        } catch (error) {
            console.error('Failed to initialize Context Manager:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create a new conversation session
     */
    createNewSession() {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const session = {
            id: sessionId,
            startTime: new Date(),
            lastActivity: new Date(),
            messages: [],
            context: {
                topics: [],
                entities: new Map(),
                mood: 'neutral',
                complexity: 'medium',
                hasImages: false,
                hasVoice: false,
                hasFiles: false
            },
            summary: '',
            keyPoints: [],
            userIntent: null,
            continuationTokens: []
        };

        this.sessions.set(sessionId, session);
        
        // Cleanup old sessions if needed
        if (this.sessions.size > this.maxSessions) {
            this.cleanupOldSessions();
        }

        console.log(`📝 New conversation session created: ${sessionId}`);
        return sessionId;
    }

    /**
     * Add message to current session context
     */
    addMessage(message, analysis = {}) {
        if (!this.currentSessionId) {
            this.currentSessionId = this.createNewSession();
        }

        const session = this.sessions.get(this.currentSessionId);
        if (!session) {
            console.error('Session not found, creating new one');
            this.currentSessionId = this.createNewSession();
            return this.addMessage(message, analysis);
        }

        // Create context-enriched message
        const contextMessage = {
            ...message,
            timestamp: new Date(),
            analysis: analysis,
            contextIndex: session.messages.length,
            entities: this.extractEntities(message.content),
            topics: this.extractTopics(message.content),
            sentiment: this.analyzeSentiment(message.content),
            intent: this.detectIntent(message.content, message.type)
        };

        session.messages.push(contextMessage);
        session.lastActivity = new Date();

        // Update session context
        this.updateSessionContext(session, contextMessage);

        // Update global context
        this.updateGlobalContext(contextMessage);

        // Maintain context window
        if (session.messages.length > this.contextWindow * 2) {
            this.compressOldMessages(session);
        }

        console.log(`💬 Message added to session ${this.currentSessionId}`);
        return contextMessage;
    }

    /**
     * Get conversation context for AI processing
     */
    getConversationContext(options = {}) {
        const session = this.sessions.get(this.currentSessionId);
        if (!session) {
            return { messages: [], context: {}, summary: '' };
        }

        const contextWindow = options.window || this.contextWindow;
        const includeAnalysis = options.includeAnalysis !== false;

        // Get recent messages within context window
        const recentMessages = session.messages.slice(-contextWindow);

        // Build context object
        const context = {
            session: {
                id: session.id,
                duration: Date.now() - session.startTime.getTime(),
                messageCount: session.messages.length,
                context: session.context
            },
            global: this.globalContext,
            recent: {
                topics: this.getRecentTopics(recentMessages),
                entities: this.getRecentEntities(recentMessages),
                userIntent: session.userIntent,
                mood: session.context.mood
            },
            capabilities: this.getAvailableCapabilities()
        };

        // Format messages for AI
        const formattedMessages = recentMessages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content,
            ...(includeAnalysis && msg.analysis ? { analysis: msg.analysis } : {}),
            ...(msg.attachments?.length > 0 ? { hasAttachments: true, attachmentTypes: msg.attachments.map(a => a.type) } : {})
        }));

        return {
            messages: formattedMessages,
            context: context,
            summary: session.summary,
            keyPoints: session.keyPoints
        };
    }

    /**
     * Update session context based on new message
     */
    updateSessionContext(session, message) {
        // Update topics
        message.topics.forEach(topic => {
            if (!session.context.topics.includes(topic)) {
                session.context.topics.push(topic);
            }
        });

        // Update entities
        message.entities.forEach(entity => {
            const key = entity.text.toLowerCase();
            if (session.context.entities.has(key)) {
                const existing = session.context.entities.get(key);
                existing.count++;
                existing.lastMentioned = new Date();
            } else {
                session.context.entities.set(key, {
                    ...entity,
                    count: 1,
                    firstMentioned: new Date(),
                    lastMentioned: new Date()
                });
            }
        });

        // Update mood based on sentiment
        if (message.sentiment) {
            session.context.mood = this.calculateContextualMood(session.context.mood, message.sentiment);
        }

        // Update complexity
        session.context.complexity = this.assessConversationComplexity(session);

        // Update capabilities usage
        if (message.attachments) {
            message.attachments.forEach(att => {
                if (att.type.startsWith('image/')) session.context.hasImages = true;
                if (att.type.startsWith('audio/')) session.context.hasVoice = true;
                session.context.hasFiles = true;
            });
        }

        // Update user intent
        if (message.type === 'user' && message.intent) {
            session.userIntent = message.intent;
        }

        // Generate continuation tokens for context preservation
        if (session.messages.length % 5 === 0) {
            session.continuationTokens.push(this.generateContinuationToken(session));
        }
    }

    /**
     * Update global context with patterns and preferences
     */
    updateGlobalContext(message) {
        // Update user preferences based on patterns
        if (message.type === 'user') {
            this.updateUserPreferences(message);
        }

        // Update global topics
        message.topics.forEach(topic => {
            const existing = this.globalContext.topics.find(t => t.name === topic);
            if (existing) {
                existing.frequency++;
                existing.lastMentioned = new Date();
            } else {
                this.globalContext.topics.push({
                    name: topic,
                    frequency: 1,
                    firstMentioned: new Date(),
                    lastMentioned: new Date()
                });
            }
        });

        // Update global entities
        message.entities.forEach(entity => {
            const key = entity.text.toLowerCase();
            if (this.globalContext.entities.has(key)) {
                const existing = this.globalContext.entities.get(key);
                existing.frequency++;
                existing.sessions.add(this.currentSessionId);
            } else {
                this.globalContext.entities.set(key, {
                    ...entity,
                    frequency: 1,
                    sessions: new Set([this.currentSessionId]),
                    firstSeen: new Date()
                });
            }
        });
    }

    /**
     * Extract entities from message content
     */
    extractEntities(content) {
        const entities = [];
        
        // Simple entity extraction (in production, use NLP library)
        const patterns = {
            person: /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g,
            location: /\b(in|at|from) ([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
            organization: /\b([A-Z][A-Z0-9]+|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+Inc\.?|\s+Corp\.?|\s+LLC)?)\b/g,
            date: /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|today|tomorrow|yesterday)\b/gi,
            time: /\b(\d{1,2}:\d{2}(?:\s*[APap][Mm])?)\b/g
        };

        Object.entries(patterns).forEach(([type, pattern]) => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                entities.push({
                    text: match[0],
                    type: type,
                    confidence: 0.8,
                    position: match.index
                });
            }
        });

        return entities;
    }

    /**
     * Extract topics from message content
     */
    extractTopics(content) {
        const topics = [];
        const topicKeywords = {
            'technology': ['computer', 'software', 'app', 'website', 'code', 'programming', 'ai', 'artificial intelligence'],
            'business': ['company', 'business', 'work', 'job', 'career', 'project', 'meeting'],
            'health': ['health', 'medical', 'doctor', 'hospital', 'medicine', 'fitness'],
            'education': ['school', 'university', 'student', 'learn', 'study', 'education'],
            'travel': ['travel', 'trip', 'vacation', 'flight', 'hotel', 'country'],
            'food': ['food', 'restaurant', 'cooking', 'recipe', 'meal', 'dinner'],
            'entertainment': ['movie', 'music', 'game', 'book', 'art', 'sport']
        };

        const lowerContent = content.toLowerCase();
        
        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            if (keywords.some(keyword => lowerContent.includes(keyword))) {
                topics.push(topic);
            }
        });

        return topics;
    }

    /**
     * Analyze sentiment of message
     */
    analyzeSentiment(content) {
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'like', 'happy', 'pleased'];
        const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'sad', 'angry', 'frustrated', 'disappointed'];
        
        const lowerContent = content.toLowerCase();
        let positiveScore = 0;
        let negativeScore = 0;

        positiveWords.forEach(word => {
            if (lowerContent.includes(word)) positiveScore++;
        });

        negativeWords.forEach(word => {
            if (lowerContent.includes(word)) negativeScore++;
        });

        if (positiveScore > negativeScore) return 'positive';
        if (negativeScore > positiveScore) return 'negative';
        return 'neutral';
    }

    /**
     * Detect user intent from message
     */
    detectIntent(content, messageType) {
        if (messageType !== 'user') return null;

        const intentPatterns = {
            question: /^(what|who|when|where|why|how|can you|could you|do you|are you|is there)/i,
            request: /^(please|could you|can you|would you|help me|i need|i want)/i,
            command: /^(show me|tell me|explain|describe|analyze|create|make|build)/i,
            greeting: /^(hi|hello|hey|good morning|good afternoon|good evening)/i,
            farewell: /^(bye|goodbye|see you|thanks|thank you|that's all)/i,
            clarification: /^(what do you mean|i don't understand|can you clarify|explain more)/i
        };

        for (const [intent, pattern] of Object.entries(intentPatterns)) {
            if (pattern.test(content.trim())) {
                return intent;
            }
        }

        return 'statement';
    }

    /**
     * Get recent topics from messages
     */
    getRecentTopics(messages) {
        const topicCounts = {};
        messages.forEach(msg => {
            msg.topics?.forEach(topic => {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            });
        });

        return Object.entries(topicCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([topic, count]) => ({ topic, count }));
    }

    /**
     * Get recent entities from messages
     */
    getRecentEntities(messages) {
        const entityMap = new Map();
        messages.forEach(msg => {
            msg.entities?.forEach(entity => {
                const key = entity.text.toLowerCase();
                if (entityMap.has(key)) {
                    entityMap.get(key).count++;
                } else {
                    entityMap.set(key, { ...entity, count: 1 });
                }
            });
        });

        return Array.from(entityMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }

    /**
     * Calculate contextual mood based on conversation flow
     */
    calculateContextualMood(currentMood, newSentiment) {
        const moodWeights = {
            positive: { positive: 0.8, neutral: 0.6, negative: 0.2 },
            neutral: { positive: 0.7, neutral: 0.5, negative: 0.3 },
            negative: { positive: 0.6, neutral: 0.4, negative: 0.8 }
        };

        const weight = moodWeights[currentMood]?.[newSentiment] || 0.5;
        
        if (weight > 0.6) return newSentiment;
        if (weight < 0.4) return currentMood;
        return 'neutral';
    }

    /**
     * Assess conversation complexity
     */
    assessConversationComplexity(session) {
        let complexity = 0;
        
        // Factor in message length variety
        const messageLengths = session.messages.map(m => m.content.length);
        const avgLength = messageLengths.reduce((a, b) => a + b, 0) / messageLengths.length;
        if (avgLength > 200) complexity += 0.2;

        // Factor in topic diversity
        if (session.context.topics.length > 3) complexity += 0.2;

        // Factor in entity richness
        if (session.context.entities.size > 5) complexity += 0.2;

        // Factor in multimodal content
        if (session.context.hasImages) complexity += 0.2;
        if (session.context.hasVoice) complexity += 0.1;
        if (session.context.hasFiles) complexity += 0.1;

        if (complexity > 0.7) return 'high';
        if (complexity > 0.4) return 'medium';
        return 'low';
    }

    /**
     * Update user preferences based on interaction patterns
     */
    updateUserPreferences(message) {
        // Analyze response style preferences
        if (message.content.length > 500) {
            this.globalContext.preferences.detailLevel = 'detailed';
        } else if (message.content.length < 100) {
            this.globalContext.preferences.detailLevel = 'concise';
        }

        // Detect language preference
        const languages = this.detectLanguages(message.content);
        if (languages.length > 0) {
            this.globalContext.preferences.language = languages[0];
        }
    }

    /**
     * Detect languages in content
     */
    detectLanguages(content) {
        // Simple language detection (in production, use proper language detection library)
        const swahiliKeywords = ['habari', 'asante', 'karibu', 'pole', 'hujambo', 'mambo'];
        const hasSwahili = swahiliKeywords.some(word => content.toLowerCase().includes(word));
        
        if (hasSwahili) return ['sw', 'en'];
        return ['en'];
    }

    /**
     * Get available capabilities based on current context
     */
    getAvailableCapabilities() {
        return {
            textProcessing: true,
            imageAnalysis: true,
            voiceProcessing: true,
            fileHandling: true,
            multiLanguage: true,
            contextualMemory: true,
            personalizedResponses: true
        };
    }

    /**
     * Generate continuation token for context preservation
     */
    generateContinuationToken(session) {
        return {
            timestamp: new Date(),
            messageCount: session.messages.length,
            keyTopics: session.context.topics.slice(-3),
            mood: session.context.mood,
            summary: this.generateSessionSummary(session)
        };
    }

    /**
     * Compress old messages to save memory
     */
    compressOldMessages(session) {
        const messagesToCompress = session.messages.slice(0, -this.contextWindow);
        const compressedSummary = this.generateSessionSummary({ 
            ...session, 
            messages: messagesToCompress 
        });

        // Keep only recent messages
        session.messages = session.messages.slice(-this.contextWindow);
        
        // Update session summary
        session.summary = session.summary ? 
            `${session.summary}\n\n${compressedSummary}` : 
            compressedSummary;

        console.log(`🗜️ Compressed ${messagesToCompress.length} old messages for session ${session.id}`);
    }

    /**
     * Generate session summary
     */
    generateSessionSummary(session) {
        const userMessages = session.messages.filter(m => m.type === 'user');
        const topics = [...new Set(session.messages.flatMap(m => m.topics || []))];
        
        return `Session covered ${topics.length} topics: ${topics.slice(0, 5).join(', ')}. ` +
               `User sent ${userMessages.length} messages with ${session.context.mood} mood.`;
    }

    /**
     * Cleanup old sessions
     */
    cleanupOldSessions() {
        const sessions = Array.from(this.sessions.entries())
            .sort(([,a], [,b]) => b.lastActivity - a.lastActivity);

        // Keep only the most recent sessions
        const sessionsToKeep = sessions.slice(0, this.maxSessions);
        const sessionsToRemove = sessions.slice(this.maxSessions);

        // Clear old sessions
        sessionsToRemove.forEach(([sessionId]) => {
            this.sessions.delete(sessionId);
        });

        console.log(`🧹 Cleaned up ${sessionsToRemove.length} old conversation sessions`);
    }

    /**
     * Load context from storage
     */
    async loadContextFromStorage() {
        try {
            const stored = localStorage.getItem('eva_conversation_context');
            if (stored) {
                const data = JSON.parse(stored);
                this.globalContext = { ...this.globalContext, ...data.globalContext };
                
                // Restore recent sessions
                if (data.recentSessions) {
                    data.recentSessions.forEach(sessionData => {
                        const session = {
                            ...sessionData,
                            startTime: new Date(sessionData.startTime),
                            lastActivity: new Date(sessionData.lastActivity),
                            messages: sessionData.messages.map(msg => ({
                                ...msg,
                                timestamp: new Date(msg.timestamp)
                            }))
                        };
                        this.sessions.set(session.id, session);
                    });
                }
            }
        } catch (error) {
            console.warn('Could not load conversation context from storage:', error);
        }
    }

    /**
     * Save context to storage
     */
    async saveContextToStorage() {
        try {
            const recentSessions = Array.from(this.sessions.entries())
                .sort(([,a], [,b]) => b.lastActivity - a.lastActivity)
                .slice(0, 5) // Save only 5 most recent sessions
                .map(([, session]) => session);

            const dataToSave = {
                globalContext: this.globalContext,
                recentSessions: recentSessions
            };

            localStorage.setItem('eva_conversation_context', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('Could not save conversation context to storage:', error);
        }
    }

    /**
     * Switch to a different session
     */
    switchSession(sessionId) {
        if (this.sessions.has(sessionId)) {
            this.currentSessionId = sessionId;
            console.log(`🔄 Switched to session: ${sessionId}`);
            return true;
        }
        return false;
    }

    /**
     * Get session statistics
     */
    getStatistics() {
        const currentSession = this.sessions.get(this.currentSessionId);
        
        return {
            totalSessions: this.sessions.size,
            currentSession: currentSession ? {
                id: currentSession.id,
                messageCount: currentSession.messages.length,
                duration: Date.now() - currentSession.startTime.getTime(),
                topics: currentSession.context.topics.length,
                entities: currentSession.context.entities.size
            } : null,
            globalStats: {
                totalTopics: this.globalContext.topics.length,
                totalEntities: this.globalContext.entities.size,
                preferences: this.globalContext.preferences
            }
        };
    }

    /**
     * Clear all context data
     */
    clearAllContext() {
        this.sessions.clear();
        this.currentSessionId = null;
        this.globalContext = {
            userName: 'User',
            preferences: {
                responseStyle: 'conversational',
                language: 'en',
                detailLevel: 'balanced',
                personality: 'helpful'
            },
            topics: [],
            entities: new Map(),
            relationships: []
        };
        
        localStorage.removeItem('eva_conversation_context');
        console.log('🧹 All conversation context cleared');
    }
}

export default ConversationContextManager;