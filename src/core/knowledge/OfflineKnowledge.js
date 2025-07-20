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
        // Core knowledge about Otieno, technology, and general information
        const coreKnowledge = [
            // Personal Information about Otieno
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
            },
            
            // Programming Languages
            {
                id: 'javascript_basics',
                topic: 'programming',
                content: 'JavaScript is a versatile programming language used for web development, mobile apps, and server-side development. It supports object-oriented, functional, and procedural programming paradigms.',
                type: 'technical_knowledge',
                importance: 0.9
            },
            {
                id: 'python_basics',
                topic: 'programming',
                content: 'Python is a high-level programming language known for its simplicity and readability. It\'s widely used in AI, machine learning, web development, data science, and automation.',
                type: 'technical_knowledge',
                importance: 0.9
            },
            {
                id: 'java_basics',
                topic: 'programming',
                content: 'Java is a robust, object-oriented programming language used for enterprise applications, Android development, and large-scale systems. It follows "write once, run anywhere" principle.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            {
                id: 'react_framework',
                topic: 'web_development',
                content: 'React is a JavaScript library for building user interfaces, particularly web applications. It uses a component-based architecture and virtual DOM for efficient rendering.',
                type: 'technical_knowledge',
                importance: 0.9
            },
            {
                id: 'nodejs_runtime',
                topic: 'backend_development',
                content: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine that allows JavaScript to run on servers. It\'s used for building scalable network applications.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            
            // Mobile Development
            {
                id: 'android_development',
                topic: 'mobile_development',
                content: 'Android development involves creating applications for Android devices using Java, Kotlin, or cross-platform frameworks like React Native or Flutter.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            {
                id: 'ios_development',
                topic: 'mobile_development',
                content: 'iOS development involves creating applications for Apple devices using Swift or Objective-C, with Xcode as the primary development environment.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            {
                id: 'react_native',
                topic: 'mobile_development',
                content: 'React Native is a framework for building mobile applications using React and JavaScript. It allows developers to create native mobile apps for both iOS and Android.',
                type: 'technical_knowledge',
                importance: 0.9
            },
            {
                id: 'flutter_framework',
                topic: 'mobile_development',
                content: 'Flutter is Google\'s UI toolkit for building natively compiled applications for mobile, web, and desktop from a single codebase using Dart programming language.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            
            // AI and Machine Learning
            {
                id: 'machine_learning_basics',
                topic: 'artificial_intelligence',
                content: 'Machine Learning is a subset of AI that enables computers to learn and improve from experience without being explicitly programmed. It includes supervised, unsupervised, and reinforcement learning.',
                type: 'technical_knowledge',
                importance: 0.9
            },
            {
                id: 'neural_networks',
                topic: 'artificial_intelligence',
                content: 'Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes (neurons) that process information and learn patterns from data.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            {
                id: 'deep_learning',
                topic: 'artificial_intelligence',
                content: 'Deep Learning is a subset of machine learning that uses neural networks with multiple layers to model and understand complex patterns in data.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            {
                id: 'natural_language_processing',
                topic: 'artificial_intelligence',
                content: 'Natural Language Processing (NLP) is a branch of AI that helps computers understand, interpret, and manipulate human language.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            {
                id: 'computer_vision',
                topic: 'artificial_intelligence',
                content: 'Computer Vision is a field of AI that trains computers to interpret and understand visual information from the world, including images and videos.',
                type: 'technical_knowledge',
                importance: 0.7
            },
            
            // Cloud Computing
            {
                id: 'cloud_computing_basics',
                topic: 'cloud_computing',
                content: 'Cloud computing delivers computing services including servers, storage, databases, networking, software, and analytics over the internet.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            {
                id: 'aws_platform',
                topic: 'cloud_computing',
                content: 'Amazon Web Services (AWS) is a comprehensive cloud platform offering computing power, database storage, content delivery, and other services.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            {
                id: 'google_cloud',
                topic: 'cloud_computing',
                content: 'Google Cloud Platform (GCP) provides cloud computing services including computing, data storage, data analytics, and machine learning.',
                type: 'technical_knowledge',
                importance: 0.7
            },
            {
                id: 'microsoft_azure',
                topic: 'cloud_computing',
                content: 'Microsoft Azure is a cloud computing platform offering services for building, testing, deploying, and managing applications and services.',
                type: 'technical_knowledge',
                importance: 0.7
            },
            
            // Databases
            {
                id: 'sql_databases',
                topic: 'databases',
                content: 'SQL databases are relational databases that use Structured Query Language for defining and manipulating data. Examples include MySQL, PostgreSQL, and SQLite.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            {
                id: 'nosql_databases',
                topic: 'databases',
                content: 'NoSQL databases are non-relational databases designed for specific data models. They include document, key-value, wide-column, and graph databases.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            {
                id: 'mongodb',
                topic: 'databases',
                content: 'MongoDB is a popular NoSQL document database that stores data in flexible, JSON-like documents instead of traditional table-based relational database structure.',
                type: 'technical_knowledge',
                importance: 0.7
            },
            
            // Web Development
            {
                id: 'html_css_basics',
                topic: 'web_development',
                content: 'HTML provides the structure of web pages, while CSS handles the presentation and styling. Together they form the foundation of web development.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            {
                id: 'responsive_design',
                topic: 'web_development',
                content: 'Responsive web design ensures websites work well on various devices and screen sizes using flexible layouts, images, and CSS media queries.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            {
                id: 'rest_apis',
                topic: 'web_development',
                content: 'REST APIs are architectural style for designing networked applications, using HTTP requests to GET, PUT, POST, and DELETE data.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            
            // DevOps and Tools
            {
                id: 'version_control_git',
                topic: 'development_tools',
                content: 'Git is a distributed version control system for tracking changes in source code during software development. GitHub, GitLab, and Bitbucket are popular Git hosting services.',
                type: 'technical_knowledge',
                importance: 0.9
            },
            {
                id: 'docker_containers',
                topic: 'devops',
                content: 'Docker is a platform that uses containerization to package applications and their dependencies into lightweight, portable containers.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            {
                id: 'kubernetes',
                topic: 'devops',
                content: 'Kubernetes is an open-source container orchestration platform for automating deployment, scaling, and management of containerized applications.',
                type: 'technical_knowledge',
                importance: 0.7
            },
            
            // Cybersecurity
            {
                id: 'cybersecurity_basics',
                topic: 'cybersecurity',
                content: 'Cybersecurity involves protecting systems, networks, and programs from digital attacks, unauthorized access, and data breaches.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            {
                id: 'encryption',
                topic: 'cybersecurity',
                content: 'Encryption is the process of converting information into a code to prevent unauthorized access. It includes symmetric and asymmetric encryption methods.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            
            // Software Engineering Practices
            {
                id: 'agile_methodology',
                topic: 'software_engineering',
                content: 'Agile is a software development methodology that emphasizes iterative development, collaboration, and flexibility in responding to change.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            {
                id: 'testing_practices',
                topic: 'software_engineering',
                content: 'Software testing includes unit testing, integration testing, and end-to-end testing to ensure code quality and functionality.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            {
                id: 'clean_code',
                topic: 'software_engineering',
                content: 'Clean code principles emphasize writing readable, maintainable, and efficient code through proper naming, functions, and structure.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            
            // Emerging Technologies
            {
                id: 'blockchain_technology',
                topic: 'emerging_tech',
                content: 'Blockchain is a distributed ledger technology that maintains a continuously growing list of records, linked and secured using cryptography.',
                type: 'technical_knowledge',
                importance: 0.7
            },
            {
                id: 'iot_internet_of_things',
                topic: 'emerging_tech',
                content: 'Internet of Things (IoT) refers to the network of physical devices embedded with sensors, software, and connectivity to exchange data.',
                type: 'technical_knowledge',
                importance: 0.7
            },
            {
                id: 'quantum_computing',
                topic: 'emerging_tech',
                content: 'Quantum computing uses quantum-mechanical phenomena to perform operations on data, potentially solving certain problems exponentially faster than classical computers.',
                type: 'technical_knowledge',
                importance: 0.6
            },
            
            // General Technology Concepts
            {
                id: 'algorithms_data_structures',
                topic: 'computer_science',
                content: 'Algorithms are step-by-step procedures for solving problems, while data structures organize and store data efficiently. Both are fundamental to programming.',
                type: 'technical_knowledge',
                importance: 0.9
            },
            {
                id: 'operating_systems',
                topic: 'computer_science',
                content: 'Operating systems manage computer hardware and software resources, providing services for computer programs. Examples include Windows, macOS, and Linux.',
                type: 'technical_knowledge',
                importance: 0.8
            },
            {
                id: 'networking_basics',
                topic: 'computer_science',
                content: 'Computer networking involves connecting devices to share resources and information using protocols like TCP/IP, HTTP, and DNS.',
                type: 'technical_knowledge',
                importance: 0.8
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