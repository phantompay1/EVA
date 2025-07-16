import './styles/main.css';
import { EVAInterface } from './components/EVAInterface.js';
import { EVACore } from './core/EVACore.js';

class EVAApp {
    constructor() {
        this.eva = new EVACore();
        this.interface = new EVAInterface(this.eva);
        this.init();
    }

    async init() {
        await this.eva.initialize();
        this.interface.render();
        this.setupEventListeners();
        this.startEVA();
    }

    setupEventListeners() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + E to activate EVA
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                this.interface.toggleActivation();
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