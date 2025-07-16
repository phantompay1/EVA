export class CommandProcessor {
    constructor() {
        this.commands = new Map();
        this.setupCommands();
    }

    setupCommands() {
        // System commands
        this.commands.set('help', {
            pattern: /^(help|what can you do|commands)/i,
            handler: this.handleHelp.bind(this)
        });

        this.commands.set('status', {
            pattern: /^(status|how are you|state)/i,
            handler: this.handleStatus.bind(this)
        });

        // Learning commands
        this.commands.set('remember', {
            pattern: /^(remember|learn|note that)/i,
            handler: this.handleRemember.bind(this)
        });

        this.commands.set('forget', {
            pattern: /^(forget|delete|remove)/i,
            handler: this.handleForget.bind(this)
        });

        // Search commands
        this.commands.set('search', {
            pattern: /^(search|find|look up)/i,
            handler: this.handleSearch.bind(this)
        });

        // Creative commands
        this.commands.set('create', {
            pattern: /^(create|make|generate|build)/i,
            handler: this.handleCreate.bind(this)
        });

        // Automation commands
        this.commands.set('automate', {
            pattern: /^(automate|schedule|remind)/i,
            handler: this.handleAutomate.bind(this)
        });

        // Conversation commands
        this.commands.set('chat', {
            pattern: /^(chat|talk|tell me)/i,
            handler: this.handleChat.bind(this)
        });
    }

    async parse(input) {
        const inputLower = input.toLowerCase().trim();
        
        for (const [name, command] of this.commands) {
            if (command.pattern.test(inputLower)) {
                return {
                    type: name,
                    input: input,
                    handler: command.handler,
                    params: this.extractParams(input, command.pattern)
                };
            }
        }

        // Default to chat if no specific command found
        return {
            type: 'chat',
            input: input,
            handler: this.handleChat.bind(this),
            params: { message: input }
        };
    }

    extractParams(input, pattern) {
        const match = input.match(pattern);
        return match ? match.slice(1) : [];
    }

    async handleHelp() {
        return {
            type: 'response',
            content: `🤖 **EVA Capabilities:**

**🗣️ Conversation:** Just talk to me naturally - I understand context and remember our conversations.

**🧠 Learning:** Say "remember that..." or "learn this..." to teach me new things about you.

**🔍 Search:** Ask me to "search for..." or "find information about..." anything.

**🎨 Create:** Tell me to "create", "make", or "generate" content, code, or ideas.

**⚡ Automate:** Say "automate", "schedule", or "remind me" to set up tasks.

**💭 Memory:** I remember everything we discuss and learn your preferences over time.

Try saying: "Hey EVA, tell me about yourself" or "EVA, what's my status?"`,
            timestamp: new Date()
        };
    }

    async handleStatus() {
        return {
            type: 'response',
            content: `🟢 **EVA Status: Online & Learning**

**🧠 Memory:** Active and growing
**🌐 Knowledge Mining:** Running autonomously
**🎯 Learning Mode:** Adaptive to your patterns
**💬 Conversation:** Ready and contextually aware

I'm here, learning about you, and ready to help with anything you need, Otieno.`,
            timestamp: new Date()
        };
    }

    async handleRemember(command) {
        const content = command.input.replace(/^(remember|learn|note that)\s*/i, '');
        return {
            type: 'memory_store',
            content: content,
            message: `📝 Got it! I'll remember: "${content}"`
        };
    }

    async handleForget(command) {
        const query = command.input.replace(/^(forget|delete|remove)\s*/i, '');
        return {
            type: 'memory_delete',
            query: query,
            message: `🗑️ I'll forget about: "${query}"`
        };
    }

    async handleSearch(command) {
        const query = command.input.replace(/^(search|find|look up)\s*/i, '');
        return {
            type: 'search',
            query: query,
            message: `🔍 Searching for: "${query}"`
        };
    }

    async handleCreate(command) {
        const request = command.input.replace(/^(create|make|generate|build)\s*/i, '');
        return {
            type: 'create',
            request: request,
            message: `🎨 Creating: "${request}"`
        };
    }

    async handleAutomate(command) {
        const task = command.input.replace(/^(automate|schedule|remind)\s*/i, '');
        return {
            type: 'automate',
            task: task,
            message: `⚡ Setting up automation: "${task}"`
        };
    }

    async handleChat(command) {
        return {
            type: 'chat',
            message: command.input,
            requiresResponse: true
        };
    }
}