import './styles/main.css';
import './styles/chat.css';
import { EVAInterface } from './components/EVAInterface.js';
import { ChatPage } from './components/ChatPage.js';
import { EVACore } from './core/EVACore.js';
import { ChatStorage } from './core/storage/ChatStorage.js';
import { ImageUnderstanding } from './core/vision/ImageUnderstanding.js';
import { VoiceProcessor } from './core/voice/VoiceProcessor.js';
import OpenAIService from './core/ai/OpenAIService.js';
import ConfigurationManager from './core/config/ConfigurationManager.js';
import ConversationContextManager from './core/context/ConversationContextManager.js';
import ErrorHandlingManager from './core/error/ErrorHandlingManager.js';

class EVAApp {
    constructor() {
        this.configManager = new ConfigurationManager();
        this.openaiService = new OpenAIService();
        this.contextManager = new ConversationContextManager();
        this.errorHandler = new ErrorHandlingManager();
        this.eva = new EVACore();
        this.interface = new EVAInterface(this.eva);
        this.chatPage = new ChatPage(this.eva);
        this.chatStorage = new ChatStorage();
        this.imageUnderstanding = new ImageUnderstanding(this.eva);
        this.voiceProcessor = new VoiceProcessor(this.eva);
        this.currentPage = 'home'; // 'home' or 'chat'
        this.init();
    }

    async init() {
        try {
            // Initialize error handling first
            await this.errorHandler.initialize();
            
            // Initialize configuration
            await this.configManager.initialize();
            
            // Initialize OpenAI service
            await this.openaiService.initialize();
            
            // Initialize conversation context manager
            await this.contextManager.initialize();
            
            // Initialize EVA core
            await this.eva.initialize();
            
            // Initialize additional systems
            await this.chatStorage.initialize();
            await this.imageUnderstanding.initialize();
            await this.voiceProcessor.initialize();
            
            // Setup navigation
            this.setupNavigation();
            
            // Start with home page
            this.showHomePage();
            
            this.setupEventListeners();
            this.startEVA();
            
            console.log('🚀 EVA OpenAI Integration Complete!');
            
        } catch (error) {
            console.error('Failed to initialize EVA:', error);
            await this.errorHandler.handleError(error, { source: 'initialization' });
        }
    }

    setupNavigation() {
        // Setup URL-based routing
        window.addEventListener('popstate', (e) => {
            this.handleNavigation(e.state?.page || 'home');
        });
        
        // Handle initial URL
        const path = window.location.pathname;
        if (path.includes('/chat')) {
            this.handleNavigation('chat');
        } else {
            this.handleNavigation('home');
        }
    }
    
    handleNavigation(page) {
        if (page === this.currentPage) return;
        
        this.currentPage = page;
        
        if (page === 'chat') {
            this.showChatPage();
        } else {
            this.showHomePage();
        }
    }
    
    showHomePage() {
        this.currentPage = 'home';
        this.interface.render();
        
        // Update URL without page reload
        if (window.location.pathname !== '/') {
            window.history.pushState({ page: 'home' }, 'EVA Home', '/');
        }
        
        // Add navigation to chat
        this.addChatNavigation();
    }
    
    showChatPage() {
        this.currentPage = 'chat';
        this.chatPage.render();
        
        // Update URL without page reload
        if (window.location.pathname !== '/chat') {
            window.history.pushState({ page: 'chat' }, 'EVA Chat', '/chat');
        }
        
        // Setup chat page integrations
        this.setupChatIntegrations();
    }
    
    addChatNavigation() {
        // Add chat button to home page
        setTimeout(() => {
            const sidebar = document.querySelector('.eva-sidebar');
            if (sidebar && !document.getElementById('chatNavBtn')) {
                const chatNavSection = document.createElement('div');
                chatNavSection.className = 'sidebar-section';
                chatNavSection.innerHTML = `
                    <h3>💬 Enhanced Chat</h3>
                    <div class="quick-actions">
                        <button class="action-btn" id="chatNavBtn" data-action="chat">Open Enhanced Chat</button>
                    </div>
                `;
                
                sidebar.insertBefore(chatNavSection, sidebar.firstChild);
                
                document.getElementById('chatNavBtn').addEventListener('click', () => {
                    this.showChatPage();
                });
            }
        }, 100);
    }
    
    setupChatIntegrations() {
        // Integrate all systems with OpenAI service, context manager, and error handler
        this.chatPage.chatStorage = this.chatStorage;
        this.chatPage.imageUnderstanding = this.imageUnderstanding;
        this.chatPage.voiceProcessor = this.voiceProcessor;
        this.chatPage.openaiService = this.openaiService;
        this.chatPage.configManager = this.configManager;
        this.chatPage.contextManager = this.contextManager;
        this.chatPage.errorHandler = this.errorHandler;
        
        // Inject services into other systems
        this.imageUnderstanding.openaiService = this.openaiService;
        this.imageUnderstanding.contextManager = this.contextManager;
        this.imageUnderstanding.errorHandler = this.errorHandler;
        
        // Setup voice processor event handlers
        this.voiceProcessor.onRecordingComplete = (audioData) => {
            this.chatPage.handleVoiceRecording(audioData);
        };
        
        this.voiceProcessor.onTranscriptionUpdate = (transcription) => {
            this.chatPage.handleTranscriptionUpdate(transcription);
        };
        
        this.voiceProcessor.onVoiceActivation = (text, command) => {
            this.chatPage.handleVoiceActivation(text, command);
        };
        
        // Setup image understanding integration
        this.chatPage.analyzeImage = async (imageData, context) => {
            return await this.imageUnderstanding.analyzeImage(imageData, context);
        };
    }
    
    setupEventListeners() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + E to activate EVA
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                if (this.currentPage === 'home') {
                    this.interface.toggleActivation();
                } else {
                    this.chatPage.focusInput();
                }
            }
            
            // Ctrl/Cmd + Shift + C to open chat
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.showChatPage();
            }
        });

        // Voice activation detection
        this.setupVoiceActivation();
    }

    setupVoiceActivation() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');

                if (transcript.toLowerCase().includes('hey eva') || 
                    transcript.toLowerCase().includes('eva')) {
                    this.interface.handleVoiceCommand(transcript);
                }
            };

            this.recognition.start();
        }
    }

    startEVA() {
        console.log('🤖 EVA - Enhanced Virtual Assistant Initialized');
        console.log('💎 Your Living AI Companion is Ready');
        
        // Display welcome message
        this.interface.displayMessage({
            type: 'system',
            content: 'EVA is now online and ready to assist you, Otieno. How can I help you today?',
            timestamp: new Date()
        });
    }
}

// Initialize EVA when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EVAApp();
});