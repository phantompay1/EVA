/**
 * EVA Enhanced Chat Page
 * Features: File upload, drag-and-drop, AI image understanding, voice-to-text, advanced chat
 */

export class ChatPage {
    constructor(evaCore) {
        this.eva = evaCore;
        this.messages = [];
        this.isRecording = false;
        this.isDragOver = false;
        this.uploadedFiles = new Map();
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recognition = null;
        this.currentTheme = localStorage.getItem('eva-theme') || 'dark';
        
        // Will be injected by main app
        this.chatStorage = null;
        this.imageUnderstanding = null;
        this.voiceProcessor = null;
        
        this.initSpeechRecognition();
        this.initFileHandling();
    }

    render() {
        const app = document.getElementById('app');
        app.innerHTML = this.getHTML();
        this.setupEventListeners();
        this.loadChatHistory();
        this.focusInput();
    }

    getHTML() {
        return `
            <div class="chat-page ${this.currentTheme}" id="chatContainer">
                <!-- Navigation Header -->
                <header class="chat-header">
                    <div class="header-left">
                        <button class="nav-btn" id="homeBtn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                            </svg>
                            Home
                        </button>
                        <div class="chat-title">
                            <h1>EVA Chat</h1>
                            <span class="chat-subtitle">Enhanced conversation with file support</span>
                        </div>
                    </div>
                    
                    <div class="header-right">
                        <button class="control-btn theme-toggle" id="themeToggle">
                            ${this.currentTheme === 'dark' ? '🌞' : '🌙'}
                        </button>
                        <button class="control-btn voice-toggle ${this.isRecording ? 'recording' : ''}" id="voiceToggle">
                            🎤
                        </button>
                        <div class="eva-status">
                            <div class="status-indicator ${this.eva.isActive ? 'online' : 'offline'}"></div>
                            <span class="status-text">${this.eva.isActive ? 'EVA Online' : 'EVA Offline'}</span>
                        </div>
                    </div>
                </header>

                <!-- Main Chat Area -->
                <main class="chat-main">
                    <!-- Messages Container -->
                    <div class="messages-container" id="messagesContainer">
                        <div class="messages-list" id="messagesList">
                            ${this.renderMessages()}
                        </div>
                        
                        <!-- Drag & Drop Overlay -->
                        <div class="drag-overlay ${this.isDragOver ? 'active' : ''}" id="dragOverlay">
                            <div class="drag-content">
                                <div class="drag-icon">📁</div>
                                <h3>Drop files here to share with EVA</h3>
                                <p>Supports images, documents, audio, and more</p>
                            </div>
                        </div>
                    </div>

                    <!-- File Preview Area -->
                    <div class="file-preview-area" id="filePreviewArea" style="display: none;">
                        <div class="preview-header">
                            <h4>File Attachments</h4>
                            <button class="close-preview" id="closePreview">×</button>
                        </div>
                        <div class="preview-content" id="previewContent"></div>
                    </div>

                    <!-- Input Area -->
                    <div class="input-area">
                        <!-- File Upload Section -->
                        <div class="file-upload-section">
                            <input type="file" id="fileInput" multiple accept="*/*" style="display: none;">
                            <button class="file-btn" id="fileUploadBtn" title="Upload files">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                                </svg>
                            </button>
                            <button class="camera-btn" id="cameraBtn" title="Take photo">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,14.9L9.18,14.73C9.27,14.65 9.35,14.56 9.43,14.47C9.68,14.19 9.87,13.86 10,13.5C10.21,12.96 10.3,12.38 10.32,11.8C10.34,11.22 10.27,10.63 10.14,10.07C10,9.5 9.83,8.95 9.62,8.41C9.41,7.87 9.16,7.35 8.88,6.84C8.59,6.33 8.28,5.84 7.93,5.37C7.58,4.9 7.21,4.45 6.81,4.03C6.4,3.61 5.97,3.21 5.5,2.84L5.5,2.84C5.41,2.76 5.32,2.68 5.23,2.61C5.14,2.54 5.05,2.47 4.96,2.41C4.87,2.35 4.78,2.29 4.68,2.24C4.58,2.19 4.48,2.14 4.38,2.1C4.28,2.06 4.17,2.03 4.07,2C3.96,1.97 3.85,1.95 3.74,1.93C3.63,1.91 3.52,1.9 3.41,1.9C3.3,1.9 3.19,1.91 3.08,1.93L3.08,1.93V4.47L3.08,4.47C3.19,4.45 3.3,4.44 3.41,4.44C3.52,4.44 3.63,4.45 3.74,4.47C3.85,4.49 3.96,4.51 4.07,4.54C4.17,4.57 4.28,4.6 4.38,4.64C4.48,4.68 4.58,4.73 4.68,4.78C4.78,4.83 4.87,4.89 4.96,4.95C5.05,5.01 5.14,5.08 5.23,5.15C5.32,5.22 5.41,5.3 5.5,5.38L5.5,5.38C5.97,5.75 6.4,6.15 6.81,6.57C7.21,6.99 7.58,7.44 7.93,7.91C8.28,8.38 8.59,8.87 8.88,9.38C9.16,9.89 9.41,10.41 9.62,10.95C9.83,11.49 10,12.04 10.14,12.61C10.27,13.17 10.34,13.76 10.32,14.34C10.3,14.92 10.21,15.5 10,16.04C9.87,16.4 9.68,16.73 9.43,17.01C9.35,17.1 9.27,17.19 9.18,17.27L9,17.1V14.9Z"/>
                                </svg>
                            </button>
                        </div>

                        <!-- Message Input -->
                        <div class="message-input-container">
                            <div class="input-wrapper">
                                <textarea 
                                    id="messageInput" 
                                    placeholder="Message EVA... (Supports text, files, images, and voice)"
                                    rows="1"
                                    maxlength="4000"
                                ></textarea>
                                <div class="input-actions">
                                    <button class="voice-record-btn ${this.isRecording ? 'recording' : ''}" id="voiceRecordBtn" title="Voice message">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
                                        </svg>
                                    </button>
                                    <button class="send-btn" id="sendBtn" title="Send message">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Character Count -->
                            <div class="input-info">
                                <span class="char-count" id="charCount">0/4000</span>
                                <span class="typing-indicator" id="typingIndicator" style="display: none;">EVA is thinking...</span>
                            </div>
                        </div>
                    </div>
                </main>

                <!-- Voice Recording Modal -->
                <div class="voice-modal" id="voiceModal" style="display: none;">
                    <div class="voice-modal-content">
                        <div class="voice-animation">
                            <div class="voice-wave"></div>
                            <div class="voice-wave"></div>
                            <div class="voice-wave"></div>
                        </div>
                        <h3>Recording Voice Message</h3>
                        <p id="recordingText">Speak your message...</p>
                        <div class="voice-controls">
                            <button class="voice-cancel" id="voiceCancelBtn">Cancel</button>
                            <button class="voice-send" id="voiceSendBtn">Send</button>
                        </div>
                    </div>
                </div>

                <!-- Image Analysis Modal -->
                <div class="image-modal" id="imageModal" style="display: none;">
                    <div class="image-modal-content">
                        <div class="modal-header">
                            <h3>AI Image Analysis</h3>
                            <button class="close-modal" id="closeImageModal">×</button>
                        </div>
                        <div class="image-analysis">
                            <div class="analyzing-image" id="analyzingImage">
                                <div class="analysis-spinner"></div>
                                <p>EVA is analyzing your image...</p>
                            </div>
                            <div class="analysis-results" id="analysisResults" style="display: none;">
                                <h4>What EVA sees:</h4>
                                <div class="analysis-content" id="analysisContent"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderMessages() {
        if (this.messages.length === 0) {
            return `
                <div class="welcome-message">
                    <div class="eva-avatar-large">
                        <div class="avatar-glow"></div>
                        <span>EVA</span>
                    </div>
                    <h2>Welcome to EVA Enhanced Chat</h2>
                    <p>I can help you with text, understand images, process voice messages, and work with files.</p>
                    <div class="welcome-features">
                        <div class="feature">
                            <span class="feature-icon">🖼️</span>
                            <span>Image Analysis</span>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">🎤</span>
                            <span>Voice Messages</span>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">📁</span>
                            <span>File Support</span>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">🧠</span>
                            <span>AI Understanding</span>
                        </div>
                    </div>
                </div>
            `;
        }

        return this.messages.map(message => this.renderMessage(message)).join('');
    }

    renderMessage(message) {
        const isUser = message.type === 'user';
        const time = this.formatTime(message.timestamp);
        
        let attachments = '';
        if (message.attachments && message.attachments.length > 0) {
            attachments = `
                <div class="message-attachments">
                    ${message.attachments.map(attachment => this.renderAttachment(attachment)).join('')}
                </div>
            `;
        }

        let analysis = '';
        if (message.analysis) {
            analysis = `
                <div class="message-analysis">
                    <div class="analysis-header">
                        <span class="analysis-icon">🔍</span>
                        <span>AI Analysis</span>
                    </div>
                    <div class="analysis-text">${message.analysis}</div>
                </div>
            `;
        }

        return `
            <div class="message ${message.type}" data-id="${message.id}">
                <div class="message-avatar">
                    ${isUser ? '👤' : '🤖'}
                </div>
                <div class="message-content">
                    ${attachments}
                    <div class="message-text">${message.content}</div>
                    ${analysis}
                    <div class="message-meta">
                        <span class="message-time">${time}</span>
                        ${message.confidence ? `<span class="confidence">Confidence: ${(message.confidence * 100).toFixed(0)}%</span>` : ''}
                        ${message.language ? `<span class="language">${message.language}</span>` : ''}
                    </div>
                </div>
                <div class="message-actions">
                    <button class="action-btn" data-action="copy" title="Copy message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                        </svg>
                    </button>
                    ${!isUser ? `
                        <button class="action-btn" data-action="speak" title="Speak message">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderAttachment(attachment) {
        const { type, name, url, size } = attachment;
        const sizeStr = this.formatFileSize(size);

        if (type.startsWith('image/')) {
            return `
                <div class="attachment image-attachment">
                    <img src="${url}" alt="${name}" class="attachment-image" onclick="this.classList.toggle('fullscreen')">
                    <div class="attachment-info">
                        <span class="attachment-name">${name}</span>
                        <span class="attachment-size">${sizeStr}</span>
                    </div>
                </div>
            `;
        } else if (type.startsWith('audio/')) {
            return `
                <div class="attachment audio-attachment">
                    <div class="audio-player">
                        <audio controls>
                            <source src="${url}" type="${type}">
                        </audio>
                    </div>
                    <div class="attachment-info">
                        <span class="attachment-name">${name}</span>
                        <span class="attachment-size">${sizeStr}</span>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="attachment file-attachment">
                    <div class="file-icon">📄</div>
                    <div class="attachment-info">
                        <span class="attachment-name">${name}</span>
                        <span class="attachment-size">${sizeStr}</span>
                    </div>
                    <a href="${url}" download="${name}" class="download-btn">↓</a>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('homeBtn').addEventListener('click', () => {
            this.navigateHome();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Message input
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const charCount = document.getElementById('charCount');

        messageInput.addEventListener('input', (e) => {
            this.handleInputChange(e);
            this.updateCharCount();
        });

        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        // File upload
        document.getElementById('fileUploadBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // Camera
        document.getElementById('cameraBtn').addEventListener('click', () => {
            this.openCamera();
        });

        // Voice recording
        document.getElementById('voiceRecordBtn').addEventListener('click', () => {
            this.toggleVoiceRecording();
        });

        document.getElementById('voiceToggle').addEventListener('click', () => {
            this.toggleContinuousListening();
        });

        // Voice modal controls
        document.getElementById('voiceCancelBtn').addEventListener('click', () => {
            this.cancelVoiceRecording();
        });

        document.getElementById('voiceSendBtn').addEventListener('click', () => {
            this.sendVoiceMessage();
        });

        // Drag and drop
        this.setupDragAndDrop();

        // Message actions
        this.setupMessageActions();

        // Modal controls
        document.getElementById('closeImageModal').addEventListener('click', () => {
            this.closeImageModal();
        });

        document.getElementById('closePreview').addEventListener('click', () => {
            this.closeFilePreview();
        });
    }

    setupDragAndDrop() {
        const container = document.getElementById('chatContainer');
        const overlay = document.getElementById('dragOverlay');

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            container.addEventListener(eventName, () => {
                this.isDragOver = true;
                overlay.classList.add('active');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, () => {
                this.isDragOver = false;
                overlay.classList.remove('active');
            }, false);
        });

        container.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFileSelect(files);
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');

                document.getElementById('recordingText').textContent = transcript || 'Speak your message...';
                
                if (event.results[event.results.length - 1].isFinal) {
                    this.finalTranscript = transcript;
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopVoiceRecording();
            };
        }
    }

    initFileHandling() {
        // Initialize file handling capabilities
        this.supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        this.supportedAudioTypes = ['audio/wav', 'audio/mp3', 'audio/ogg', 'audio/webm'];
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
    }

    async handleFileSelect(files) {
        const fileArray = Array.from(files);
        const validFiles = [];
        
        for (const file of fileArray) {
            if (file.size > this.maxFileSize) {
                this.showError(`File "${file.name}" is too large. Maximum size is 50MB.`);
                continue;
            }
            
            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        // Process files
        const attachments = [];
        for (const file of validFiles) {
            const attachment = await this.processFile(file);
            if (attachment) {
                attachments.push(attachment);
                this.uploadedFiles.set(attachment.id, attachment);
            }
        }

        if (attachments.length > 0) {
            this.showFilePreview(attachments);
            
            // If any images, trigger AI analysis
            const images = attachments.filter(att => this.supportedImageTypes.includes(att.type));
            if (images.length > 0) {
                this.analyzeImages(images);
            }
        }
    }

    async processFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            const id = Date.now() + Math.random();
            
            reader.onload = (e) => {
                const attachment = {
                    id: id,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: e.target.result,
                    file: file
                };
                resolve(attachment);
            };
            
            reader.onerror = () => {
                console.error('Error reading file:', file.name);
                resolve(null);
            };
            
            reader.readAsDataURL(file);
        });
    }

    showFilePreview(attachments) {
        const previewArea = document.getElementById('filePreviewArea');
        const previewContent = document.getElementById('previewContent');
        
        previewContent.innerHTML = attachments.map(att => this.renderAttachment(att)).join('');
        previewArea.style.display = 'block';
        
        // Scroll to show preview
        previewArea.scrollIntoView({ behavior: 'smooth' });
    }

    closeFilePreview() {
        document.getElementById('filePreviewArea').style.display = 'none';
        this.uploadedFiles.clear();
    }

    async analyzeImages(images) {
        if (images.length === 0) return;
        
        // Show analysis modal
        document.getElementById('imageModal').style.display = 'flex';
        document.getElementById('analyzingImage').style.display = 'block';
        document.getElementById('analysisResults').style.display = 'none';
        
        try {
            const analysisPromises = images.map(async (image) => {
                if (this.imageUnderstanding) {
                    // Use the injected image understanding system
                    const analysis = await this.imageUnderstanding.analyzeImage(
                        image.url,
                        {
                            imageName: image.name,
                            imageSize: image.size,
                            userMessage: 'Analyze this uploaded image'
                        }
                    );
                    
                    return {
                        image: image,
                        analysis: analysis.success ? analysis.response?.description || 'Analysis complete' : 'Unable to analyze image',
                        fullAnalysis: analysis
                    };
                } else {
                    // Fallback analysis
                    return {
                        image: image,
                        analysis: `Image uploaded: ${image.name}. Advanced AI analysis will be available when the system is fully loaded.`,
                        fullAnalysis: null
                    };
                }
            });
            
            const results = await Promise.all(analysisPromises);
            this.displayAnalysisResults(results);
            
            // Store analysis results for later use
            if (this.chatStorage) {
                results.forEach(async (result) => {
                    if (result.fullAnalysis) {
                        await this.chatStorage.saveAnalysis(
                            'pending', // Will be updated when message is saved
                            result.image.id,
                            {
                                type: 'image_analysis',
                                results: result.fullAnalysis,
                                confidence: result.fullAnalysis.confidence || 0.7,
                                processingTime: result.fullAnalysis.totalProcessingTime || 0
                            }
                        );
                    }
                });
            }
            
        } catch (error) {
            console.error('Image analysis error:', error);
            this.showError('Failed to analyze images. Please try again.');
            this.closeImageModal();
        }
    }

    displayAnalysisResults(results) {
        const analysisContent = document.getElementById('analysisContent');
        
        analysisContent.innerHTML = results.map(result => `
            <div class="analysis-item">
                <div class="analysis-image">
                    <img src="${result.image.url}" alt="${result.image.name}">
                </div>
                <div class="analysis-text">
                    <h5>${result.image.name}</h5>
                    <p>${result.analysis}</p>
                </div>
            </div>
        `).join('');
        
        document.getElementById('analyzingImage').style.display = 'none';
        document.getElementById('analysisResults').style.display = 'block';
    }

    closeImageModal() {
        document.getElementById('imageModal').style.display = 'none';
    }

    async openCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            
            // Create camera modal
            this.showCameraModal(stream);
            
        } catch (error) {
            console.error('Camera access error:', error);
            this.showError('Camera access denied or not available.');
        }
    }

    showCameraModal(stream) {
        const modal = document.createElement('div');
        modal.className = 'camera-modal';
        modal.innerHTML = `
            <div class="camera-modal-content">
                <div class="camera-header">
                    <h3>Take Photo</h3>
                    <button class="close-camera" id="closeCameraBtn">×</button>
                </div>
                <div class="camera-preview">
                    <video id="cameraVideo" autoplay playsinline></video>
                    <canvas id="cameraCanvas" style="display: none;"></canvas>
                </div>
                <div class="camera-controls">
                    <button class="camera-capture" id="captureBtn">📸 Capture</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const video = document.getElementById('cameraVideo');
        video.srcObject = stream;
        
        // Setup camera controls
        document.getElementById('closeCameraBtn').addEventListener('click', () => {
            this.closeCameraModal(stream, modal);
        });
        
        document.getElementById('captureBtn').addEventListener('click', () => {
            this.capturePhoto(video, stream, modal);
        });
    }

    capturePhoto(video, stream, modal) {
        const canvas = document.getElementById('cameraCanvas');
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context.drawImage(video, 0, 0);
        
        canvas.toBlob(async (blob) => {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            await this.handleFileSelect([file]);
            this.closeCameraModal(stream, modal);
        }, 'image/jpeg', 0.9);
    }

    closeCameraModal(stream, modal) {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
    }

    toggleVoiceRecording() {
        if (this.isRecording) {
            this.stopVoiceRecording();
        } else {
            this.startVoiceRecording();
        }
    }

    startVoiceRecording() {
        if (this.voiceProcessor) {
            // Use the injected voice processor
            this.voiceProcessor.startRecording({ transcribe: true })
                .then(result => {
                    if (result.success) {
                        this.isRecording = true;
                        document.getElementById('voiceModal').style.display = 'flex';
                        document.getElementById('voiceRecordBtn').classList.add('recording');
                        document.getElementById('recordingText').textContent = 'Speak your message...';
                    } else {
                        this.showError(result.error || 'Failed to start recording');
                    }
                })
                .catch(error => {
                    console.error('Voice recording error:', error);
                    this.showError('Voice recording not available');
                });
        } else {
            // Fallback to built-in recognition
            this.startFallbackRecording();
        }
    }
    
    startFallbackRecording() {
        if (!this.recognition) {
            this.showError('Speech recognition not supported in this browser.');
            return;
        }
        
        this.isRecording = true;
        this.finalTranscript = '';
        
        // Show voice modal
        document.getElementById('voiceModal').style.display = 'flex';
        document.getElementById('recordingText').textContent = 'Speak your message...';
        
        // Update UI
        document.getElementById('voiceRecordBtn').classList.add('recording');
        
        // Start recognition
        this.recognition.start();
    }

    stopVoiceRecording() {
        if (this.voiceProcessor && this.voiceProcessor.isRecording) {
            this.voiceProcessor.stopRecording();
        } else if (this.recognition) {
            this.recognition.stop();
        }
        
        this.isRecording = false;
        document.getElementById('voiceRecordBtn').classList.remove('recording');
    }

    cancelVoiceRecording() {
        this.stopVoiceRecording();
        document.getElementById('voiceModal').style.display = 'none';
    }

    sendVoiceMessage() {
        if (this.finalTranscript) {
            document.getElementById('messageInput').value = this.finalTranscript;
            this.updateCharCount();
        }
        
        this.cancelVoiceRecording();
        
        if (this.finalTranscript) {
            this.sendMessage();
        }
    }

    toggleContinuousListening() {
        // Toggle continuous voice activation
        const btn = document.getElementById('voiceToggle');
        
        if (btn.classList.contains('recording')) {
            btn.classList.remove('recording');
            if (this.recognition) {
                this.recognition.continuous = false;
            }
        } else {
            btn.classList.add('recording');
            if (this.recognition) {
                this.recognition.continuous = true;
                this.recognition.start();
            }
        }
    }

    async sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message && this.uploadedFiles.size === 0) return;
        
        // Create message object
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: message || 'Shared files',
            timestamp: new Date(),
            attachments: Array.from(this.uploadedFiles.values())
        };
        
        // Add user message
        this.messages.push(userMessage);
        
        // Add to context manager if available
        if (this.contextManager) {
            this.contextManager.addMessage(userMessage, {
                hasAttachments: userMessage.attachments.length > 0,
                attachmentTypes: userMessage.attachments.map(att => att.type),
                userIntent: this.detectUserIntent(message)
            });
        }
        
        // Clear input and files
        input.value = '';
        this.closeFilePreview();
        this.updateCharCount();
        
        // Re-render messages
        this.updateMessagesList();
        this.scrollToBottom();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            let response;
            
            // Check if we have images to analyze
            const imageAttachments = userMessage.attachments.filter(att => 
                this.supportedImageTypes.includes(att.type)
            );
            
            if (imageAttachments.length > 0 && this.openaiService?.isReady()) {
                // Use OpenAI for image analysis and chat
                response = await this.processMessageWithOpenAI(message, imageAttachments);
            } else if (this.openaiService?.isReady()) {
                // Use OpenAI for text-only chat
                response = await this.processTextWithOpenAI(message);
            } else {
                // Fallback to EVA's foundational modules
                response = await this.processWithFoundationalModules(message, userMessage);
            }
            
            // Create EVA response message
            const evaMessage = {
                id: Date.now() + 1,
                type: 'eva',
                content: response.content || 'I processed your message.',
                timestamp: new Date(),
                confidence: response.confidence,
                language: response.language,
                analysis: response.analysis,
                isOpenAI: response.isOpenAI || false
            };
            
            this.messages.push(evaMessage);
            
            // Add EVA response to context manager
            if (this.contextManager) {
                this.contextManager.addMessage(evaMessage, {
                    confidence: response.confidence,
                    isOpenAI: response.isOpenAI,
                    processingMethod: response.isOpenAI ? 'openai' : 'foundational'
                });
            }
            
        } catch (error) {
            console.error('Error processing message:', error);
            
            const errorMessage = {
                id: Date.now() + 1,
                type: 'eva',
                content: 'I apologize, but I encountered an error processing your message. Please try again.',
                timestamp: new Date()
            };
            
            this.messages.push(errorMessage);
        }
        
        // Hide typing indicator and update
        this.hideTypingIndicator();
        this.updateMessagesList();
        this.scrollToBottom();
        
        // Save chat history
        this.saveChatHistory();
    }

    /**
     * Process message with OpenAI including image analysis
     */
    async processMessageWithOpenAI(message, imageAttachments) {
        try {
            let combinedResponse = '';
            let analysis = '';
            
            // Analyze images first
            for (const attachment of imageAttachments) {
                const imageAnalysis = await this.openaiService.analyzeImage(
                    attachment.url,
                    `Analyze this image in detail. What do you see? ${message ? `Context: ${message}` : ''}`
                );
                
                if (imageAnalysis.success) {
                    analysis += imageAnalysis.description + '\n';
                } else {
                    analysis += imageAnalysis.description + '\n'; // Fallback message
                }
            }
            
            // Generate chat response with image context
            const contextMessage = [
                {
                    role: 'system',
                    content: 'You are EVA, an Enhanced Virtual Assistant. You are helpful, knowledgeable, and conversational. The user has shared images with you.'
                },
                ...this.getConversationContext(),
                {
                    role: 'user',
                    content: `${message}\n\nImage Analysis Context: ${analysis}`
                }
            ];
            
            const chatResponse = await this.openaiService.generateChatCompletion(contextMessage);
            
            if (chatResponse.success) {
                combinedResponse = chatResponse.content;
            } else {
                combinedResponse = chatResponse.content; // Fallback response
            }
            
            return {
                content: combinedResponse,
                analysis: analysis.trim(),
                confidence: 0.95,
                language: 'en',
                isOpenAI: chatResponse.success
            };
            
        } catch (error) {
            console.error('OpenAI image processing error:', error);
            // Fallback to foundational modules
            return await this.processWithFoundationalModules(message, { attachments: imageAttachments });
        }
    }
    
    /**
     * Process text-only message with OpenAI
     */
    async processTextWithOpenAI(message) {
        try {
            const messages = [
                {
                    role: 'system',
                    content: 'You are EVA, an Enhanced Virtual Assistant. You are helpful, knowledgeable, conversational, and can assist with a wide variety of tasks. Provide thoughtful and detailed responses.'
                },
                ...this.getConversationContext(),
                {
                    role: 'user',
                    content: message
                }
            ];
            
            const response = await this.openaiService.generateChatCompletion(messages);
            
            return {
                content: response.content,
                confidence: response.success ? 0.95 : 0.3,
                language: 'en',
                isOpenAI: response.success
            };
            
        } catch (error) {
            console.error('OpenAI text processing error:', error);
            // Fallback to foundational modules
            return await this.processWithFoundationalModules(message, {});
        }
    }
    
    /**
     * Get conversation context for OpenAI
     */
    getConversationContext() {
        if (this.contextManager) {
            const contextData = this.contextManager.getConversationContext({
                window: 8,
                includeAnalysis: true
            });
            
            return contextData.messages;
        }
        
        // Fallback to simple context
        const contextMessages = this.messages.slice(-6).filter(msg => 
            msg.type === 'user' || msg.type === 'eva'
        ).map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));
        
        return contextMessages;
    }
    
    /**
     * Fallback to EVA's foundational modules
     */
    async processWithFoundationalModules(message, userMessage) {
        try {
            const context = {
                hasAttachments: userMessage.attachments?.length > 0,
                attachmentTypes: userMessage.attachments?.map(att => att.type) || [],
                messageHistory: this.messages.slice(-5)
            };
            
            const response = await this.eva.processInput(message, context);
            
            return {
                content: response.content || 'I processed your message using my foundational capabilities.',
                confidence: response.foundational?.decision?.result?.combinedConfidence || 0.7,
                language: response.foundational?.understanding?.detectedLanguage || 'en',
                analysis: this.getImageAnalysis(userMessage.attachments || []),
                isOpenAI: false
            };
            
        } catch (error) {
            console.error('Foundational processing error:', error);
            return {
                content: 'I apologize, but I\'m having trouble processing your message right now. Please try again.',
                confidence: 0.1,
                language: 'en',
                isOpenAI: false
            };
        }
    }

    getImageAnalysis(attachments) {
        const imageAttachments = attachments.filter(att => this.supportedImageTypes.includes(att.type));
        if (imageAttachments.length === 0) return null;
        
        // Return a simple analysis - in a real implementation, this would use actual AI
        return `I can see ${imageAttachments.length} image(s). ${imageAttachments.map(img => `"${img.name}"`).join(', ')}`;
    }

    updateMessagesList() {
        document.getElementById('messagesList').innerHTML = this.renderMessages();
    }

    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        container.scrollTop = container.scrollHeight;
    }

    showTypingIndicator() {
        document.getElementById('typingIndicator').style.display = 'inline';
    }

    hideTypingIndicator() {
        document.getElementById('typingIndicator').style.display = 'none';
    }

    handleInputChange(e) {
        // Auto-resize textarea
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    }

    updateCharCount() {
        const input = document.getElementById('messageInput');
        const count = document.getElementById('charCount');
        const length = input.value.length;
        
        count.textContent = `${length}/4000`;
        count.className = length > 3800 ? 'char-count warning' : 'char-count';
    }

    setupMessageActions() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn')) {
                const btn = e.target.closest('.action-btn');
                const action = btn.dataset.action;
                const message = btn.closest('.message');
                
                this.handleMessageAction(action, message);
            }
        });
    }

    handleMessageAction(action, messageElement) {
        const messageId = messageElement.dataset.id;
        const message = this.messages.find(m => m.id == messageId);
        
        if (!message) return;
        
        switch (action) {
            case 'copy':
                navigator.clipboard.writeText(message.content);
                this.showSuccess('Message copied to clipboard');
                break;
                
            case 'speak':
                this.speakMessage(message.content);
                break;
        }
    }

    speakMessage(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
        } else {
            this.showError('Text-to-speech not supported in this browser.');
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.getElementById('chatContainer').className = `chat-page ${this.currentTheme}`;
        document.getElementById('themeToggle').textContent = this.currentTheme === 'dark' ? '🌞' : '🌙';
        localStorage.setItem('eva-theme', this.currentTheme);
    }

    navigateHome() {
        // Navigate back to main EVA interface
        import('./EVAInterface.js').then(({ EVAInterface }) => {
            const evaInterface = new EVAInterface(this.eva);
            evaInterface.render();
        });
    }

    focusInput() {
        setTimeout(() => {
            document.getElementById('messageInput').focus();
        }, 100);
    }

    loadChatHistory() {
        if (this.chatStorage) {
            // Load from enhanced storage
            this.chatStorage.getMessages({ limit: 50 }).then(messages => {
                this.messages = messages.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
                this.updateMessagesList();
            }).catch(error => {
                console.error('Error loading chat history:', error);
                this.loadFallbackHistory();
            });
        } else {
            this.loadFallbackHistory();
        }
    }
    
    loadFallbackHistory() {
        const saved = localStorage.getItem('eva-chat-history');
        if (saved) {
            try {
                this.messages = JSON.parse(saved);
            } catch (error) {
                console.error('Error loading chat history:', error);
                this.messages = [];
            }
        }
    }

    saveChatHistory() {
        if (this.chatStorage) {
            // Save to enhanced storage
            this.messages.forEach(async (message) => {
                try {
                    await this.chatStorage.saveMessage(message);
                } catch (error) {
                    console.error('Error saving message to enhanced storage:', error);
                }
            });
        }
        
        // Also save to localStorage as fallback
        try {
            localStorage.setItem('eva-chat-history', JSON.stringify(this.messages));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }
    
    // Voice integration methods
    handleVoiceRecording(audioData) {
        console.log('🎤 Voice recording received:', audioData);
        
        if (audioData.transcription) {
            // Auto-fill input with transcription
            const input = document.getElementById('messageInput');
            if (input) {
                input.value = audioData.transcription.text;
                this.updateCharCount();
            }
        }
        
        // Add voice message as attachment
        const voiceAttachment = {
            id: Date.now(),
            name: `voice_message_${Date.now()}.webm`,
            type: 'audio/webm',
            size: audioData.size,
            url: audioData.url,
            duration: audioData.duration
        };
        
        this.uploadedFiles.set(voiceAttachment.id, voiceAttachment);
        this.showFilePreview([voiceAttachment]);
    }
    
    handleTranscriptionUpdate(transcription) {
        const recordingText = document.getElementById('recordingText');
        if (recordingText) {
            recordingText.textContent = transcription.final || transcription.interim || 'Speak your message...';
        }
    }
    
    handleVoiceActivation(text, command) {
        console.log('🎯 Voice activation:', text, command);
        this.focusInput();
        
        // Show a visual indicator
        this.showNotification(`Voice command recognized: ${command}`, 'info');
    }

    formatTime(date) {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    /**
     * Detect user intent from message
     */
    detectUserIntent(message) {
        if (!message) return 'unknown';
        
        const lowerMessage = message.toLowerCase().trim();
        
        // Question patterns
        if (/^(what|who|when|where|why|how|can you|could you|do you|are you|is there)/.test(lowerMessage)) {
            return 'question';
        }
        
        // Request patterns
        if (/^(please|could you|can you|would you|help me|i need|i want)/.test(lowerMessage)) {
            return 'request';
        }
        
        // Command patterns
        if (/^(show me|tell me|explain|describe|analyze|create|make|build)/.test(lowerMessage)) {
            return 'command';
        }
        
        // Greeting patterns
        if (/^(hi|hello|hey|good morning|good afternoon|good evening)/.test(lowerMessage)) {
            return 'greeting';
        }
        
        // Farewell patterns
        if (/^(bye|goodbye|see you|thanks|thank you|that's all)/.test(lowerMessage)) {
            return 'farewell';
        }
        
        return 'statement';
    }
}