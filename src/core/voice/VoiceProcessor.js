/**
 * EVA Voice Processing System
 * Handles voice recording, speech-to-text, and audio processing
 */

export class VoiceProcessor {
    constructor(evaCore) {
        this.eva = evaCore;
        this.initialized = false;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioContext = null;
        this.microphone = null;
        this.audioChunks = [];
        this.recognition = null;
        this.synthesis = null;
        
        this.config = {
            sampleRate: 44100,
            channels: 1,
            bitRate: 128000,
            maxRecordingTime: 300000, // 5 minutes
            minRecordingTime: 1000,   // 1 second
            noiseThreshold: 0.01,
            languages: ['en-US', 'sw-KE'], // English and Swahili
            voiceCommands: ['hey eva', 'eva', 'stop', 'pause', 'resume']
        };
        
        this.metrics = {
            recordingsCreated: 0,
            totalRecordingTime: 0,
            transcriptionsPerformed: 0,
            averageAccuracy: 0,
            voiceCommandsRecognized: 0
        };
    }

    async initialize() {
        console.log('🎤 Initializing EVA Voice Processing System...');
        
        try {
            // Check browser support
            if (!this.checkBrowserSupport()) {
                throw new Error('Voice processing not supported in this browser');
            }
            
            // Initialize Web Audio API
            await this.initializeAudioContext();
            
            // Initialize Speech Recognition
            await this.initializeSpeechRecognition();
            
            // Initialize Speech Synthesis
            this.initializeSpeechSynthesis();
            
            // Setup voice commands
            this.setupVoiceCommands();
            
            this.initialized = true;
            console.log('✅ Voice Processing System initialized');
            
            return {
                success: true,
                message: 'Voice processing ready',
                capabilities: this.getCapabilities()
            };
        } catch (error) {
            console.error('❌ Failed to initialize Voice Processing:', error);
            throw error;
        }
    }

    checkBrowserSupport() {
        const hasMediaRecorder = 'MediaRecorder' in window;
        const hasGetUserMedia = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
        const hasWebAudio = 'AudioContext' in window || 'webkitAudioContext' in window;
        const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
        const hasSpeechSynthesis = 'speechSynthesis' in window;

        console.log('🔍 Browser support check:', {
            MediaRecorder: hasMediaRecorder,
            getUserMedia: hasGetUserMedia,
            WebAudio: hasWebAudio,
            SpeechRecognition: hasSpeechRecognition,
            SpeechSynthesis: hasSpeechSynthesis
        });

        return hasMediaRecorder && hasGetUserMedia && hasWebAudio;
    }

    async initializeAudioContext() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        console.log('🔊 Audio context initialized');
    }

    async initializeSpeechRecognition() {
        if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
            console.warn('⚠️ Speech recognition not supported');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3;
        this.recognition.lang = this.config.languages[0]; // Default to English
        
        // Event handlers
        this.recognition.onstart = () => {
            console.log('🎙️ Speech recognition started');
        };
        
        this.recognition.onresult = (event) => {
            this.handleRecognitionResult(event);
        };
        
        this.recognition.onerror = (event) => {
            console.error('❌ Speech recognition error:', event.error);
        };
        
        this.recognition.onend = () => {
            console.log('🔇 Speech recognition ended');
        };
        
        console.log('🗣️ Speech recognition initialized');
    }

    initializeSpeechSynthesis() {
        if (!('speechSynthesis' in window)) {
            console.warn('⚠️ Speech synthesis not supported');
            return;
        }

        this.synthesis = window.speechSynthesis;
        
        // Get available voices
        const updateVoices = () => {
            this.availableVoices = this.synthesis.getVoices();
            console.log(`🎵 Found ${this.availableVoices.length} voices`);
        };
        
        updateVoices();
        this.synthesis.onvoiceschanged = updateVoices;
        
        console.log('🔊 Speech synthesis initialized');
    }

    setupVoiceCommands() {
        this.voiceCommands = new Map();
        
        // Basic commands
        this.voiceCommands.set('hey eva', {
            action: 'activate',
            response: 'Yes, I\'m listening',
            handler: this.handleActivation.bind(this)
        });
        
        this.voiceCommands.set('eva stop', {
            action: 'stop',
            response: 'Stopping',
            handler: this.handleStop.bind(this)
        });
        
        this.voiceCommands.set('eva pause', {
            action: 'pause',
            response: 'Paused',
            handler: this.handlePause.bind(this)
        });
        
        this.voiceCommands.set('eva resume', {
            action: 'resume',
            response: 'Resuming',
            handler: this.handleResume.bind(this)
        });
        
        console.log(`🎯 Setup ${this.voiceCommands.size} voice commands`);
    }

    async startRecording(options = {}) {
        try {
            if (this.isRecording) {
                throw new Error('Already recording');
            }

            console.log('🎤 Starting voice recording...');
            
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: this.config.sampleRate,
                    channelCount: this.config.channels,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            // Setup media recorder
            const mimeType = this.getSupportedMimeType();
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: mimeType,
                audioBitsPerSecond: this.config.bitRate
            });

            this.audioChunks = [];
            this.recordingStartTime = Date.now();
            
            // Event handlers
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.handleRecordingStop(options);
            };

            this.mediaRecorder.onerror = (event) => {
                console.error('❌ Recording error:', event.error);
                this.stopRecording();
            };

            // Setup audio analysis for real-time feedback
            await this.setupAudioAnalysis(stream);

            // Start recording
            this.mediaRecorder.start(100); // Collect data every 100ms
            this.isRecording = true;

            // Auto-stop after max recording time
            this.recordingTimeout = setTimeout(() => {
                if (this.isRecording) {
                    console.log('⏰ Recording stopped due to time limit');
                    this.stopRecording();
                }
            }, this.config.maxRecordingTime);

            return {
                success: true,
                message: 'Recording started',
                maxDuration: this.config.maxRecordingTime
            };

        } catch (error) {
            console.error('❌ Failed to start recording:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async setupAudioAnalysis(stream) {
        this.microphone = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        
        this.microphone.connect(this.analyser);
        
        // Setup real-time audio level monitoring
        this.audioData = new Uint8Array(this.analyser.frequencyBinCount);
        this.startAudioLevelMonitoring();
    }

    startAudioLevelMonitoring() {
        const updateAudioLevel = () => {
            if (!this.isRecording) return;
            
            this.analyser.getByteFrequencyData(this.audioData);
            
            // Calculate average audio level
            const average = this.audioData.reduce((sum, value) => sum + value, 0) / this.audioData.length;
            const normalizedLevel = average / 255;
            
            // Emit audio level for UI updates
            this.onAudioLevel?.(normalizedLevel);
            
            // Check for silence (auto-stop if silent for too long)
            if (normalizedLevel < this.config.noiseThreshold) {
                this.silenceStart = this.silenceStart || Date.now();
                if (Date.now() - this.silenceStart > 3000) { // 3 seconds of silence
                    console.log('🔇 Auto-stopping due to silence');
                    this.stopRecording();
                    return;
                }
            } else {
                this.silenceStart = null;
            }
            
            requestAnimationFrame(updateAudioLevel);
        };
        
        updateAudioLevel();
    }

    stopRecording() {
        if (!this.isRecording) return;

        console.log('🛑 Stopping voice recording...');
        
        this.isRecording = false;
        
        if (this.recordingTimeout) {
            clearTimeout(this.recordingTimeout);
        }
        
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        
        // Stop microphone access
        if (this.microphone && this.microphone.mediaStream) {
            this.microphone.mediaStream.getTracks().forEach(track => track.stop());
        }
    }

    async handleRecordingStop(options) {
        const recordingDuration = Date.now() - this.recordingStartTime;
        
        if (recordingDuration < this.config.minRecordingTime) {
            console.warn('⚠️ Recording too short, discarding');
            return;
        }

        console.log(`✅ Recording completed (${recordingDuration}ms)`);
        
        // Create audio blob
        const mimeType = this.mediaRecorder.mimeType || this.getSupportedMimeType();
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        
        // Create audio URL
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Prepare audio data
        const audioData = {
            blob: audioBlob,
            url: audioUrl,
            duration: recordingDuration,
            mimeType: mimeType,
            size: audioBlob.size,
            timestamp: new Date()
        };

        // Update metrics
        this.updateRecordingMetrics(recordingDuration);

        // Transcribe if requested
        if (options.transcribe !== false) {
            audioData.transcription = await this.transcribeAudio(audioData);
        }

        // Emit recording complete event
        this.onRecordingComplete?.(audioData);
        
        return audioData;
    }

    async transcribeAudio(audioData, language = null) {
        try {
            if (!this.recognition) {
                throw new Error('Speech recognition not available');
            }

            console.log('📝 Transcribing audio...');
            
            const transcriptionStartTime = Date.now();
            
            // Set language if specified
            if (language && this.config.languages.includes(language)) {
                this.recognition.lang = language;
            }

            // Create audio element for playback to recognition
            const audio = new Audio(audioData.url);
            
            return new Promise((resolve) => {
                let finalTranscript = '';
                let interimTranscript = '';
                let confidence = 0;
                
                const timeout = setTimeout(() => {
                    this.recognition.stop();
                    resolve({
                        text: finalTranscript || interimTranscript || '',
                        confidence: confidence,
                        language: this.recognition.lang,
                        processingTime: Date.now() - transcriptionStartTime,
                        success: false,
                        error: 'Transcription timeout'
                    });
                }, 10000); // 10 second timeout

                this.recognition.onresult = (event) => {
                    interimTranscript = '';
                    
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const result = event.results[i];
                        if (result.isFinal) {
                            finalTranscript += result[0].transcript;
                            confidence = Math.max(confidence, result[0].confidence || 0);
                        } else {
                            interimTranscript += result[0].transcript;
                        }
                    }
                    
                    // Emit interim results
                    this.onTranscriptionUpdate?.({
                        final: finalTranscript,
                        interim: interimTranscript,
                        confidence: confidence
                    });
                };

                this.recognition.onend = () => {
                    clearTimeout(timeout);
                    
                    const processingTime = Date.now() - transcriptionStartTime;
                    const text = finalTranscript || interimTranscript;
                    
                    // Update metrics
                    this.updateTranscriptionMetrics(confidence, processingTime);
                    
                    // Check for voice commands
                    const voiceCommand = this.detectVoiceCommand(text);
                    
                    resolve({
                        text: text,
                        confidence: confidence,
                        language: this.recognition.lang,
                        processingTime: processingTime,
                        success: true,
                        voiceCommand: voiceCommand
                    });
                };

                this.recognition.onerror = (event) => {
                    clearTimeout(timeout);
                    resolve({
                        text: finalTranscript || interimTranscript || '',
                        confidence: confidence,
                        language: this.recognition.lang,
                        processingTime: Date.now() - transcriptionStartTime,
                        success: false,
                        error: event.error
                    });
                };

                // Start recognition
                this.recognition.start();
            });

        } catch (error) {
            console.error('❌ Transcription failed:', error);
            return {
                text: '',
                confidence: 0,
                success: false,
                error: error.message
            };
        }
    }

    detectVoiceCommand(text) {
        const lowerText = text.toLowerCase().trim();
        
        for (const [command, config] of this.voiceCommands) {
            if (lowerText.includes(command)) {
                console.log(`🎯 Voice command detected: ${command}`);
                this.metrics.voiceCommandsRecognized++;
                
                // Execute command handler
                if (config.handler) {
                    config.handler(text, command);
                }
                
                return {
                    command: command,
                    action: config.action,
                    response: config.response,
                    confidence: 0.9 // High confidence for exact matches
                };
            }
        }
        
        return null;
    }

    async speakText(text, options = {}) {
        try {
            if (!this.synthesis) {
                throw new Error('Speech synthesis not available');
            }

            if (this.synthesis.speaking) {
                this.synthesis.cancel();
            }

            const utterance = new SpeechSynthesisUtterance(text);
            
            // Configure voice settings
            utterance.rate = options.rate || 0.9;
            utterance.pitch = options.pitch || 1.0;
            utterance.volume = options.volume || 0.8;
            utterance.lang = options.language || 'en-US';
            
            // Select voice
            if (options.voiceName && this.availableVoices) {
                const selectedVoice = this.availableVoices.find(voice => 
                    voice.name.includes(options.voiceName) || 
                    voice.lang === options.language
                );
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }
            }

            return new Promise((resolve) => {
                utterance.onstart = () => {
                    console.log('🔊 Speech synthesis started');
                };

                utterance.onend = () => {
                    console.log('✅ Speech synthesis completed');
                    resolve({ success: true });
                };

                utterance.onerror = (event) => {
                    console.error('❌ Speech synthesis error:', event.error);
                    resolve({ success: false, error: event.error });
                };

                this.synthesis.speak(utterance);
            });

        } catch (error) {
            console.error('❌ Text-to-speech failed:', error);
            return { success: false, error: error.message };
        }
    }

    async processVoiceMessage(audioData, context = {}) {
        try {
            console.log('🎙️ Processing voice message...');
            
            // Transcribe the audio
            const transcription = await this.transcribeAudio(audioData, context.language);
            
            if (!transcription.success || !transcription.text.trim()) {
                return {
                    success: false,
                    error: 'Unable to transcribe audio',
                    audioData: audioData
                };
            }

            // Use EVA's foundational modules for understanding
            const understandingResult = await this.eva.understanding.comprehendInput(
                transcription.text,
                {
                    type: 'voice_input',
                    language: transcription.language,
                    confidence: transcription.confidence,
                    audioDuration: audioData.duration,
                    voiceCommand: transcription.voiceCommand
                }
            );

            // Process with decision making
            const decisionResult = await this.eva.decisionMaking.makeDecision('hybrid', {
                treeName: 'user_interaction',
                modelName: 'user_intent',
                context: {
                    voiceInput: true,
                    transcriptionConfidence: transcription.confidence,
                    hasVoiceCommand: !!transcription.voiceCommand,
                    audioQuality: this.assessAudioQuality(audioData)
                },
                evidence: {
                    voice_input: true,
                    clear_speech: transcription.confidence > 0.8,
                    voice_command: !!transcription.voiceCommand,
                    audio_duration_appropriate: audioData.duration > 1000 && audioData.duration < 30000
                }
            });

            return {
                success: true,
                transcription: transcription,
                understanding: understandingResult,
                decision: decisionResult,
                audioData: audioData,
                processingComplete: true
            };

        } catch (error) {
            console.error('❌ Voice message processing failed:', error);
            return {
                success: false,
                error: error.message,
                audioData: audioData
            };
        }
    }

    assessAudioQuality(audioData) {
        // Simple audio quality assessment based on size and duration
        const bitsPerSecond = (audioData.size * 8) / (audioData.duration / 1000);
        
        if (bitsPerSecond > 100000) return 'high';
        if (bitsPerSecond > 50000) return 'medium';
        return 'low';
    }

    // Voice command handlers
    handleActivation(text, command) {
        console.log('🎯 EVA activated by voice');
        this.onVoiceActivation?.(text, command);
    }

    handleStop(text, command) {
        console.log('🛑 Stop command received');
        this.stopRecording();
        this.onVoiceCommand?.('stop', text);
    }

    handlePause(text, command) {
        console.log('⏸️ Pause command received');
        this.onVoiceCommand?.('pause', text);
    }

    handleResume(text, command) {
        console.log('▶️ Resume command received');
        this.onVoiceCommand?.('resume', text);
    }

    getSupportedMimeType() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/mp3',
            'audio/wav'
        ];
        
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        
        return 'audio/webm'; // Fallback
    }

    updateRecordingMetrics(duration) {
        this.metrics.recordingsCreated++;
        this.metrics.totalRecordingTime += duration;
    }

    updateTranscriptionMetrics(confidence, processingTime) {
        this.metrics.transcriptionsPerformed++;
        this.metrics.averageAccuracy = (this.metrics.averageAccuracy + confidence) / 2;
    }

    getCapabilities() {
        return {
            recording: !!navigator.mediaDevices?.getUserMedia,
            speechRecognition: !!this.recognition,
            speechSynthesis: !!this.synthesis,
            languages: this.config.languages,
            voiceCommands: Array.from(this.voiceCommands.keys()),
            audioFormats: this.getSupportedMimeType()
        };
    }

    async getStatus() {
        return {
            initialized: this.initialized,
            isRecording: this.isRecording,
            capabilities: this.getCapabilities(),
            metrics: this.metrics,
            config: {
                maxRecordingTime: this.config.maxRecordingTime,
                supportedLanguages: this.config.languages,
                voiceCommandsCount: this.voiceCommands.size
            }
        };
    }

    // Event handlers (to be set by consumers)
    onRecordingComplete = null;
    onTranscriptionUpdate = null;
    onAudioLevel = null;
    onVoiceActivation = null;
    onVoiceCommand = null;

    async shutdown() {
        console.log('🔄 Shutting down Voice Processing System...');
        
        if (this.isRecording) {
            this.stopRecording();
        }
        
        if (this.synthesis && this.synthesis.speaking) {
            this.synthesis.cancel();
        }
        
        if (this.audioContext) {
            await this.audioContext.close();
        }
        
        this.initialized = false;
        console.log('✅ Voice Processing System shutdown complete');
    }
}