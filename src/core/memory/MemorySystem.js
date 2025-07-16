export class MemorySystem {
    constructor() {
        this.memories = new Map();
        this.userProfile = null;
        this.patterns = new Map();
        this.initialized = false;
    }

    async initialize() {
        console.log('🧠 Initializing Memory System...');
        
        // Load from localStorage for now (will upgrade to IndexedDB/SQLite later)
        this.loadFromStorage();
        this.initialized = true;
        
        console.log('✅ Memory System Online');
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('eva_memories');
            if (stored) {
                const data = JSON.parse(stored);
                this.memories = new Map(data.memories || []);
                this.userProfile = data.userProfile || null;
                this.patterns = new Map(data.patterns || []);
            }
        } catch (error) {
            console.warn('Could not load memories from storage:', error);
        }
    }

    saveToStorage() {
        try {
            const data = {
                memories: Array.from(this.memories.entries()),
                userProfile: this.userProfile,
                patterns: Array.from(this.patterns.entries())
            };
            localStorage.setItem('eva_memories', JSON.stringify(data));
        } catch (error) {
            console.warn('Could not save memories to storage:', error);
        }
    }

    async storeInteraction(interaction) {
        const id = Date.now().toString();
        this.memories.set(id, {
            ...interaction,
            id,
            type: 'interaction'
        });
        
        this.saveToStorage();
        return id;
    }

    async storeKnowledge(knowledge) {
        const id = `knowledge_${Date.now()}`;
        this.memories.set(id, {
            ...knowledge,
            id,
            type: 'knowledge',
            timestamp: new Date()
        });
        
        this.saveToStorage();
        return id;
    }

    async getRecentMemories(count = 10) {
        const recent = Array.from(this.memories.values())
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, count);
        
        return recent;
    }

    async searchMemories(query) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        for (const memory of this.memories.values()) {
            if (memory.input?.toLowerCase().includes(queryLower) ||
                memory.response?.toLowerCase().includes(queryLower) ||
                memory.content?.toLowerCase().includes(queryLower)) {
                results.push(memory);
            }
        }
        
        return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    async getUserProfile() {
        return this.userProfile;
    }

    async saveUserProfile(profile) {
        this.userProfile = profile;
        this.saveToStorage();
    }

    async storePattern(pattern) {
        this.patterns.set(pattern.id, pattern);
        this.saveToStorage();
    }

    async getPatterns() {
        return Array.from(this.patterns.values());
    }

    getMemoryCount() {
        return this.memories.size;
    }

    async clearMemories() {
        this.memories.clear();
        this.saveToStorage();
    }
}