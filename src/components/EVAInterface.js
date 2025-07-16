export class EVAInterface {
    constructor(evaCore) {
        this.eva = evaCore;
        this.isListening = false;
        this.messages = [];
        this.currentTheme = 'dark';
    }

    render() {
        const app = document.getElementById('app');
        app.innerHTML = this.getHTML();
        this.setupEventListeners();
        this.startStatusUpdates();
    }

    getHTML() {
        return `
            <div class="eva-container ${this.currentTheme}">
                <!-- Header -->
                <header class="eva-header">
                    <div class="eva-logo">
                        <div class="eva-avatar ${this.eva.isActive ? 'active' : ''}">
                            <div class="avatar-pulse"></div>
                            <span class="avatar-text">EVA</span>
                        </div>
                        <div class="eva-title">
                            <h1>Enhanced Virtual Assistant</h1>
                            <p class="eva-tagline">Your Living AI • Always Learning • Always There</p>
                        </div>
                    </div>
                    
                    <div class="eva-controls">
                        <button class="control-btn theme-toggle" id="themeToggle">
                            🌙
                        </button>
                        <button class="control-btn voice-toggle ${this.isListening ? 'active' : ''}" id="voiceToggle">
                            🎤
                        </button>
                        <div class="eva-status" id="evaStatus">
                            <span class="status-indicator ${this.eva.isActive ? 'online' : 'offline'}"></span>
                            <span class="status-text">${this.eva.isActive ? 'Online' : 'Offline'}</span>
                        </div>
                    </div>
                </header>

                <!-- Main Interface -->
                <main class="eva-main">
                    <!-- Chat Area -->
                    <div class="chat-container">
                        <div class="chat-messages" id="chatMessages">
                            ${this.renderMessages()}
                        </div>
                        
                        <div class="chat-input-container">
                            <div class="input-wrapper">
                                <input 
                                    type="text" 
                                    id="chatInput" 
                                    placeholder="Talk to EVA... (or press Ctrl+Shift+E)"
                                    autocomplete="off"
                                />
                                <button class="send-btn" id="sendBtn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                    </svg>
                                </button>
                            </div>
                            <div class="input-suggestions" id="inputSuggestions">
                                <button class="suggestion-btn">Tell me about yourself</button>
                                <button class="suggestion-btn">What can you do?</button>
                                <button class="suggestion-btn">Remember that I like coffee</button>
                                <button class="suggestion-btn">Search for AI news</button>
                            </div>
                        </div>
                    </div>

                    <!-- Side Panel -->
                    <aside class="eva-sidebar">
                        <div class="sidebar-section">
                            <h3>🧠 Memory</h3>
                            <div class="memory-stats">
                                <div class="stat">
                                    <span class="stat-value" id="memoryCount">0</span>
                                    <span class="stat-label">Memories</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-value" id="learningProgress">0%</span>
                                    <span class="stat-label">Learning</span>
                                </div>
                            </div>
                        </div>

                        <div class="sidebar-section">
                            <h3>🎯 Quick Actions</h3>
                            <div class="quick-actions">
                                <button class="action-btn" data-action="help">Help</button>
                                <button class="action-btn" data-action="status">Status</button>
                                <button class="action-btn" data-action="clear">Clear Chat</button>
                                <button class="action-btn" data-action="export">Export Data</button>
                            </div>
                        </div>

                        <div class="sidebar-section">
                            <h3>⚡ Capabilities</h3>
                            <div class="capabilities">
                                <div class="capability">
                                    <span class="capability-icon">🗣️</span>
                                    <span class="capability-text">Natural Conversation</span>
                                </div>
                                <div class="capability">
                                    <span class="capability-icon">🧠</span>
                                    <span class="capability-text">Self-Learning Memory</span>
                                </div>
                                <div class="capability">
                                    <span class="capability-icon">🌐</span>
                                    <span class="capability-text">Web Knowledge Mining</span>
                                </div>
                                <div class="capability">
                                    <span class="capability-icon">🎨</span>
                                    <span class="capability-text">Creative Generation</span>
                                </div>
                                <div class="capability">
                                    <span class="capability-icon">⚡</span>
                                    <span class="capability-text">Task Automation</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </main>

                <!-- Footer -->
                <footer class="eva-footer">
                    <div class="footer-content">
                        <p>EVA v1.0 - Enhanced Virtual Assistant for Otieno</p>
                        <div class="footer-links">
                            <button class="footer-link" id="aboutBtn">About</button>
                            <button class="footer-link" id="settingsBtn">Settings</button>
                            <button class="footer-link" id="privacyBtn">Privacy</button>
                        </div>
                    </div>
                </footer>
            </div>
        `;
    }

    renderMessages() {
        return this.messages.map(message => `
            <div class="message ${message.type}">
                <div class="message-avatar">
                    ${message.type === 'user' ? '👤' : '🤖'}
                </div>
                <div class="message-content">
                    <div class="message-text">${message.content}</div>
                    <div class="message-time">${this.formatTime(message.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Chat input
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUserInput();
            }
        });
        
        sendBtn.addEventListener('click', () => {
            this.handleUserInput();
        });

        // Voice toggle
        document.getElementById('voiceToggle').addEventListener('click', () => {
            this.toggleVoiceListening();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleQuickAction(e.target.dataset.action);
            });
        });

        // Suggestions
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                chatInput.value = e.target.textContent;
                this.handleUserInput();
            });
        });
    }

    async handleUserInput() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        this.addMessage({
            type: 'user',
            content: message,
            timestamp: new Date()
        });

        // Clear input
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Process with EVA
            const response = await this.eva.processInput(message);
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add EVA response
            if (response) {
                this.addMessage(response);
                
                // Handle special actions
                if (response.action) {
                    await this.handleResponseAction(response);
                }
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage({
                type: 'system',
                content: 'Sorry, I encountered an error processing your request. Please try again.',
                timestamp: new Date()
            });
        }
    }

    async handleResponseAction(response) {
        switch (response.action) {
            case 'store_memory':
                await this.eva.memory.storeKnowledge({
                    content: response.data,
                    type: 'user_instruction',
                    source: 'direct_input'
                });
                this.updateStats();
                break;
                
            case 'search_knowledge':
                // Trigger knowledge search
                setTimeout(() => {
                    this.addMessage({
                        type: 'system',
                        content: `🔍 Search results for "${response.data}" will be implemented in the next update. For now, I'm storing this as a learning opportunity.`,
                        timestamp: new Date()
                    });
                }, 1000);
                break;
        }
    }

    addMessage(message) {
        this.messages.push(message);
        this.updateChatDisplay();
        this.scrollToBottom();
    }

    updateChatDisplay() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = this.renderMessages();
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message system typing-indicator';
        indicator.id = 'typingIndicator';
        indicator.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        document.getElementById('chatMessages').appendChild(indicator);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    toggleVoiceListening() {
        this.isListening = !this.isListening;
        const voiceBtn = document.getElementById('voiceToggle');
        voiceBtn.classList.toggle('active', this.isListening);
        
        if (this.isListening) {
            this.addMessage({
                type: 'system',
                content: '🎤 Voice listening activated. Say "Hey EVA" to get my attention.',
                timestamp: new Date()
            });
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.querySelector('.eva-container').className = `eva-container ${this.currentTheme}`;
        
        const themeBtn = document.getElementById('themeToggle');
        themeBtn.textContent = this.currentTheme === 'dark' ? '🌙' : '☀️';
    }

    handleQuickAction(action) {
        switch (action) {
            case 'help':
                document.getElementById('chatInput').value = 'help';
                this.handleUserInput();
                break;
            case 'status':
                document.getElementById('chatInput').value = 'status';
                this.handleUserInput();
                break;
            case 'clear':
                this.messages = [];
                this.updateChatDisplay();
                break;
            case 'export':
                this.exportData();
                break;
        }
    }

    exportData() {
        const data = {
            messages: this.messages,
            userProfile: this.eva.userProfile,
            timestamp: new Date()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eva-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    startStatusUpdates() {
        setInterval(() => {
            this.updateStats();
            this.updateStatus();
        }, 5000);
    }

    updateStats() {
        const memoryCount = document.getElementById('memoryCount');
        const learningProgress = document.getElementById('learningProgress');
        
        if (memoryCount) {
            memoryCount.textContent = this.eva.memory.getMemoryCount();
        }
        
        if (learningProgress) {
            learningProgress.textContent = '85%'; // Placeholder
        }
    }

    updateStatus() {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');
        const avatar = document.querySelector('.eva-avatar');
        
        if (this.eva.isActive) {
            statusIndicator.className = 'status-indicator online';
            statusText.textContent = 'Online';
            avatar.classList.add('active');
        } else {
            statusIndicator.className = 'status-indicator offline';
            statusText.textContent = 'Offline';
            avatar.classList.remove('active');
        }
    }

    displayMessage(message) {
        this.addMessage(message);
    }

    handleVoiceCommand(transcript) {
        if (this.isListening) {
            document.getElementById('chatInput').value = transcript;
            this.handleUserInput();
        }
    }

    toggleActivation() {
        const chatInput = document.getElementById('chatInput');
        chatInput.focus();
        
        this.addMessage({
            type: 'system',
            content: '⚡ EVA activated via keyboard shortcut. How can I help?',
            timestamp: new Date()
        });
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
}