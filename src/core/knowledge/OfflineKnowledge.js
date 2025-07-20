export class OfflineKnowledge {
    constructor() {
        this.knowledgeBase = new Map();
        this.personalFacts = new Map();
        this.learnedConcepts = new Map();
        this.initialized = false;
    }

    async initialize() {
        console.log('📚 Initializing Personal Knowledge Base...');
        
        // Load stored knowledge from localStorage
        this.loadStoredKnowledge();
        
        // Initialize with core personal knowledge
        await this.initializeCoreKnowledge();
        
        this.initialized = true;
        console.log('✅ Personal Knowledge Base Ready');
    }

    loadStoredKnowledge() {
        try {
            const stored = localStorage.getItem('eva_personal_knowledge');
            if (stored) {
                const data = JSON.parse(stored);
                this.knowledgeBase = new Map(data.knowledge || []);
                this.personalFacts = new Map(data.personalFacts || []);
                this.learnedConcepts = new Map(data.concepts || []);
            }
        } catch (error) {
            console.warn('Could not load stored knowledge:', error);
        }
    }

    saveKnowledge() {
        try {
            const data = {
                knowledge: Array.from(this.knowledgeBase.entries()),
                personalFacts: Array.from(this.personalFacts.entries()),
                concepts: Array.from(this.learnedConcepts.entries())
            };
            localStorage.setItem('eva_personal_knowledge', JSON.stringify(data));
        } catch (error) {
            console.warn('Could not save knowledge:', error);
        }
    }

    async initializeCoreKnowledge() {
        // Core knowledge about Otieno and personal context
        const coreKnowledge = [
            {
                id: 'user_identity',
                topic: 'personal',
                content: 'User is Otieno, a software developer interested in AI and technology',
                type: 'personal_fact',
                importance: 1.0
            },
            {
                id: 'location_context',
                topic: 'personal',
                content: 'User is based in Kenya, familiar with Swahili and English',
                type: 'personal_fact',
                importance: 0.9
            },
            {
                id: 'professional_background',
                topic: 'personal',
                content: 'Otieno is a software developer with experience in web development, mobile apps, and AI systems',
                type: 'personal_fact',
                importance: 0.9
            },
            {
                id: 'technical_interests',
                topic: 'technology',
                content: 'Otieno is particularly interested in AI, machine learning, mobile app development, and creating innovative software solutions',
                type: 'personal_fact',
                importance: 0.8
            },
            {
                id: 'current_projects',
                topic: 'work',
                content: 'Otieno is currently working on various projects including AI assistants and mobile applications',
                type: 'personal_fact',
                importance: 0.8
            },
            {
                id: 'learning_style',
                topic: 'personal',
                content: 'Otieno prefers hands-on learning and practical implementation over theoretical discussions',
                type: 'personal_fact',
                importance: 0.7
            },
            {
                id: 'communication_preference',
                topic: 'personal',
                content: 'Otieno appreciates direct, helpful responses and values efficiency in communication',
                type: 'personal_fact',
                importance: 0.7
            },
            {
                id: 'goals',
                topic: 'personal',
                content: 'Otieno aims to build innovative AI solutions and improve his development skills continuously',
                type: 'personal_fact',
                importance: 0.8
            },
            {
                id: 'work_environment',
                topic: 'work',
                content: 'Otieno works on multiple projects simultaneously and values tools that help with productivity and organization',
                type: 'personal_fact',
                importance: 0.7
            },
            {
                id: 'ai_knowledge',
                topic: 'technology',
                content: 'Artificial Intelligence involves machine learning, neural networks, and automation',
                type: 'concept',
                importance: 0.8
            },
            {
                id: 'programming_basics',
                topic: 'technology',
                content: 'Programming involves writing code to solve problems and create applications',
                type: 'concept',
                importance: 0.8
            },
            {
                id: 'eva_purpose',
                topic: 'personal',
                content: 'EVA is a personal AI assistant designed specifically for Otieno, learning and adapting to his needs',
                type: 'self_knowledge',
                importance: 1.0
            }
        ];

        for (const knowledge of coreKnowledge) {
            this.knowledgeBase.set(knowledge.id, {
                ...knowledge,
                timestamp: new Date(),
                source: 'initialization'
            });
        }

        this.saveKnowledge();
    }

    async learnFromInput(input, context = {}) {
        // Extract and store new knowledge from user input
        const newKnowledge = this.extractKnowledge(input);
        
        for (const knowledge of newKnowledge) {
            const id = `learned_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            this.knowledgeBase.set(id, {
                id,
                content: knowledge.content,
                topic: knowledge.topic,
                type: 'learned_from_user',
                source: 'user_interaction',
                timestamp: new Date(),
                importance: knowledge.importance || 0.7,
                context: context
            });
        }
        
        this.saveKnowledge();
        return newKnowledge.length;
    }

    extractKnowledge(input) {
        const knowledge = [];
        const inputLower = input.toLowerCase();
        
        // Extract personal facts
        if (inputLower.includes('i am') || inputLower.includes("i'm")) {
            const fact = input.substring(input.toLowerCase().indexOf('i am') + 4).trim();
            if (fact) {
                knowledge.push({
                    content: `Otieno is ${fact}`,
                    topic: 'personal',
                    importance: 0.9
                });
            }
        }
        
        // Extract preferences
        if (inputLower.includes('i like') || inputLower.includes('i love')) {
            const preference = input.substring(input.toLowerCase().indexOf('i like') + 6).trim();
            if (preference) {
                knowledge.push({
                    content: `Otieno likes ${preference}`,
                    topic: 'preferences',
                    importance: 0.8
                });
            }
        }
        
        // Extract dislikes
        if (inputLower.includes('i hate') || inputLower.includes("i don't like")) {
            const dislike = input.substring(input.toLowerCase().indexOf('hate') + 4).trim();
            if (dislike) {
                knowledge.push({
                    content: `Otieno dislikes ${dislike}`,
                    topic: 'preferences',
                    importance: 0.8
                });
            }
        }
        
        // Extract remember commands
        if (inputLower.includes('remember')) {
            const toRemember = input.substring(input.toLowerCase().indexOf('remember') + 8).trim();
            if (toRemember) {
                knowledge.push({
                    content: toRemember,
                    topic: 'personal_instruction',
                    importance: 1.0
                });
            }
        }
        
        return knowledge;
    }

    async getRelevantKnowledge(query, limit = 5) {
        const queryLower = query.toLowerCase();
        const relevant = [];
        
        for (const [id, knowledge] of this.knowledgeBase) {
            let relevance = 0;
            
            // Check content relevance
            if (knowledge.content.toLowerCase().includes(queryLower)) {
                relevance += 0.8;
            }
            
            // Check topic relevance
            if (knowledge.topic && queryLower.includes(knowledge.topic.toLowerCase())) {
                relevance += 0.6;
            }
            
            // Boost personal facts
            if (knowledge.type === 'personal_fact' || knowledge.type === 'personal_instruction') {
                relevance += 0.3;
            }
            
            // Consider importance
            relevance *= knowledge.importance || 0.5;
            
            if (relevance > 0.3) {
                relevant.push({
                    ...knowledge,
                    relevance
                });
            }
        }
        
        return relevant
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, limit);
    }

    async addPersonalFact(fact, importance = 0.8) {
        const id = `fact_${Date.now()}`;
        
        this.personalFacts.set(id, {
            id,
            content: fact,
            importance,
            timestamp: new Date(),
            type: 'personal_fact'
        });
        
        this.saveKnowledge();
        return id;
    }

    async getPersonalFacts() {
        return Array.from(this.personalFacts.values())
            .sort((a, b) => b.importance - a.importance);
    }

    getKnowledgeCount() {
        return this.knowledgeBase.size + this.personalFacts.size + this.learnedConcepts.size;
    }

    async searchKnowledge(query) {
        return await this.getRelevantKnowledge(query, 10);
    }

    getKnowledgeStats() {
        const topics = new Map();
        const types = new Map();
        
        for (const knowledge of this.knowledgeBase.values()) {
            // Count by topic
            const topic = knowledge.topic || 'general';
            topics.set(topic, (topics.get(topic) || 0) + 1);
            
            // Count by type
            const type = knowledge.type || 'general';
            types.set(type, (types.get(type) || 0) + 1);
        }
        
        return {
            total: this.getKnowledgeCount(),
            byTopic: Array.from(topics.entries()),
            byType: Array.from(types.entries()),
            personalFacts: this.personalFacts.size,
            lastUpdate: this.getLastUpdateTime()
        };
    }

    getLastUpdateTime() {
        const allKnowledge = [
            ...this.knowledgeBase.values(),
            ...this.personalFacts.values(),
            ...this.learnedConcepts.values()
        ];
        
        if (allKnowledge.length === 0) return null;
        
        return allKnowledge.reduce((latest, item) => {
            const itemTime = new Date(item.timestamp);
            return itemTime > new Date(latest) ? item.timestamp : latest;
        }, allKnowledge[0].timestamp);
    }

    async clearKnowledge() {
        this.knowledgeBase.clear();
        this.personalFacts.clear();
        this.learnedConcepts.clear();
        this.saveKnowledge();
    }
}