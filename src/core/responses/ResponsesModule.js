/**
 * EVA Responses Module
 * Handles multimodal output, tone modulation, and fallback strategies
 * Part of EVA's Foundational Knowledge Modules
 */

const EventEmitter = require('events');

/**
 * Text Response Generator
 */
class TextResponseGenerator {
    constructor() {
        this.templates = new Map();
        this.contextFilters = new Map();
        this.initialized = false;
        this.metrics = { responsesGenerated: 0, averageLength: 0, templateUsage: new Map() };
    }

    async initialize() {
        console.log('🔤 Initializing Text Response Generator...');
        await this.loadResponseTemplates();
        this.initializeContextFilters();
        this.initialized = true;
        console.log('✅ Text Response Generator initialized');
    }

    async loadResponseTemplates() {
        this.templates.set('information', {
            casual: 'Here\'s what I know about {topic}: {content}',
            formal: 'Regarding {topic}, I can provide the following information: {content}',
            technical: 'Technical analysis of {topic}: {content}'
        });

        this.templates.set('action', {
            confirmation: 'I\'ve successfully {action}. {details}',
            progress: 'Currently {action}... {progress}%',
            error: 'Unable to complete {action}. Reason: {error}'
        });

        this.templates.set('interactive', {
            question: 'I need to clarify: {question}',
            suggestion: 'Based on your input, I suggest: {suggestion}',
            clarification: 'To better assist you, could you {clarification}?'
        });

        console.log(`📝 Loaded ${this.templates.size} response template categories`);
    }

    initializeContextFilters() {
        this.contextFilters.set('formality', (context) => {
            if (context.professional || context.business) return 'formal';
            if (context.technical || context.development) return 'technical';
            return 'casual';
        });
    }

    async generateResponse(content, context = {}) {
        try {
            const responseType = context.type || 'information';
            const templates = this.templates.get(responseType);
            
            if (!templates) {
                console.warn(`⚠️ No templates found for type: ${responseType}`);
                return content;
            }

            let selectedStyle = 'casual';
            for (const [filterName, filter] of this.contextFilters) {
                const result = filter(context);
                if (templates[result]) {
                    selectedStyle = result;
                    break;
                }
            }

            const template = templates[selectedStyle] || templates.casual || Object.values(templates)[0];
            const response = this.populateTemplate(template, content, context);
            this.updateMetrics(responseType, selectedStyle, response);
            return response;
        } catch (error) {
            console.error('❌ Error generating text response:', error);
            return content;
        }
    }

    populateTemplate(template, content, context) {
        let response = template;
        response = response.replace(/{content}/g, content);
        response = response.replace(/{topic}/g, context.topic || 'this topic');
        response = response.replace(/{action}/g, context.action || 'the action');
        
        Object.keys(context).forEach(key => {
            const placeholder = new RegExp(`{${key}}`, 'g');
            response = response.replace(placeholder, context[key] || '');
        });

        return response;
    }

    updateMetrics(type, style, response) {
        this.metrics.responsesGenerated++;
        this.metrics.averageLength = (this.metrics.averageLength + response.length) / 2;
        const key = `${type}_${style}`;
        this.metrics.templateUsage.set(key, (this.metrics.templateUsage.get(key) || 0) + 1);
    }
}

/**
 * Voice Response Generator
 */
class VoiceResponseGenerator {
    constructor() {
        this.voiceProfiles = new Map();
        this.speechSettings = { rate: 1.0, pitch: 1.0, volume: 0.8, language: 'en-US' };
        this.initialized = false;
        this.metrics = { speechGenerated: 0, averageDuration: 0, voiceProfileUsage: new Map() };
    }

    async initialize() {
        console.log('🎤 Initializing Voice Response Generator...');
        await this.loadVoiceProfiles();
        this.initialized = true;
        console.log('✅ Voice Response Generator initialized');
    }

    async loadVoiceProfiles() {
        this.voiceProfiles.set('default', { rate: 1.0, pitch: 1.0, volume: 0.8, tone: 'neutral' });
        this.voiceProfiles.set('formal', { rate: 0.9, pitch: 0.95, volume: 0.7, tone: 'professional' });
        this.voiceProfiles.set('friendly', { rate: 1.1, pitch: 1.05, volume: 0.8, tone: 'warm' });
        this.voiceProfiles.set('urgent', { rate: 1.2, pitch: 1.1, volume: 0.9, tone: 'assertive' });
        this.voiceProfiles.set('calm', { rate: 0.8, pitch: 0.9, volume: 0.6, tone: 'soothing' });
        console.log(`🎵 Loaded ${this.voiceProfiles.size} voice profiles`);
    }

    async generateSpeech(text, context = {}) {
        try {
            const profile = this.selectVoiceProfile(context);
            const speechConfig = this.buildSpeechConfig(profile, context);
            
            const speechData = {
                text: text,
                config: speechConfig,
                duration: this.estimateDuration(text, speechConfig.rate),
                profile: profile.tone,
                timestamp: Date.now()
            };

            this.updateMetrics(profile.tone, speechData.duration);
            console.log(`🎙️ Generated speech: "${text.substring(0, 50)}..." (${speechData.duration}s)`);
            return speechData;
        } catch (error) {
            console.error('❌ Error generating speech:', error);
            return { text: text, error: error.message, fallback: true };
        }
    }

    selectVoiceProfile(context) {
        if (context.urgent) return this.voiceProfiles.get('urgent');
        if (context.formal || context.professional) return this.voiceProfiles.get('formal');
        if (context.supportive || context.comforting) return this.voiceProfiles.get('calm');
        if (context.friendly || context.casual) return this.voiceProfiles.get('friendly');
        return this.voiceProfiles.get('default');
    }

    buildSpeechConfig(profile, context) {
        return {
            rate: profile.rate * (context.speedMultiplier || 1.0),
            pitch: profile.pitch * (context.pitchMultiplier || 1.0),
            volume: profile.volume * (context.volumeMultiplier || 1.0),
            language: context.language || this.speechSettings.language,
            tone: profile.tone
        };
    }

    estimateDuration(text, rate) {
        const words = text.split(' ').length;
        const baseWPM = 150;
        const adjustedWPM = baseWPM * rate;
        return Math.round((words / adjustedWPM) * 60 * 100) / 100;
    }

    updateMetrics(profile, duration) {
        this.metrics.speechGenerated++;
        this.metrics.averageDuration = (this.metrics.averageDuration + duration) / 2;
        this.metrics.voiceProfileUsage.set(profile, (this.metrics.voiceProfileUsage.get(profile) || 0) + 1);
    }
}

/**
 * Gesture Response Generator
 */
class GestureResponseGenerator {
    constructor() {
        this.gestureLibrary = new Map();
        this.sequenceBuilder = new Map();
        this.initialized = false;
        this.metrics = { gesturesGenerated: 0, sequencesCreated: 0, gestureTypeUsage: new Map() };
    }

    async initialize() {
        console.log('👋 Initializing Gesture Response Generator...');
        await this.loadGestureLibrary();
        this.initializeSequenceBuilders();
        this.initialized = true;
        console.log('✅ Gesture Response Generator initialized');
    }

    async loadGestureLibrary() {
        this.gestureLibrary.set('greeting', {
            wave: { duration: 2, intensity: 'medium', description: 'Friendly wave' },
            nod: { duration: 1, intensity: 'light', description: 'Acknowledgment nod' }
        });

        this.gestureLibrary.set('emotional', {
            thumbsUp: { duration: 2, intensity: 'medium', description: 'Approval gesture' },
            clap: { duration: 3, intensity: 'high', description: 'Celebratory clapping' }
        });

        this.gestureLibrary.set('instructional', {
            point: { duration: 2, intensity: 'medium', description: 'Directional pointing' },
            demonstrate: { duration: 5, intensity: 'medium', description: 'Action demonstration' }
        });

        console.log(`🤲 Loaded ${this.gestureLibrary.size} gesture categories`);
    }

    initializeSequenceBuilders() {
        this.sequenceBuilder.set('greeting', (context) => {
            return context.formal ? 
                [{ type: 'greeting', gesture: 'nod' }] : 
                [{ type: 'greeting', gesture: 'wave' }];
        });

        this.sequenceBuilder.set('explanation', (context) => {
            const gestures = [{ type: 'instructional', gesture: 'point' }];
            if (context.complex) gestures.push({ type: 'instructional', gesture: 'demonstrate' });
            return gestures;
        });
    }

    async generateGesture(intent, context = {}) {
        try {
            let gestures = [];

            if (this.sequenceBuilder.has(intent)) {
                gestures = this.sequenceBuilder.get(intent)(context);
            } else {
                const gestureType = this.determineGestureType(intent, context);
                const specificGesture = this.selectSpecificGesture(gestureType, context);
                gestures = [{ type: gestureType, gesture: specificGesture }];
            }

            const gestureSequence = gestures.map(g => {
                const gestureData = this.gestureLibrary.get(g.type)?.[g.gesture];
                return { ...gestureData, type: g.type, name: g.gesture, timestamp: Date.now() };
            }).filter(g => g);

            this.updateMetrics(intent, gestureSequence);

            console.log(`👋 Generated gesture sequence for "${intent}": ${gestureSequence.map(g => g.name).join(' → ')}`);
            return {
                intent: intent,
                sequence: gestureSequence,
                totalDuration: gestureSequence.reduce((sum, g) => sum + g.duration, 0)
            };
        } catch (error) {
            console.error('❌ Error generating gesture:', error);
            return { intent: intent, error: error.message, fallback: true };
        }
    }

    determineGestureType(intent, context) {
        if (intent.includes('greet') || intent.includes('hello')) return 'greeting';
        if (intent.includes('explain') || intent.includes('show')) return 'instructional';
        if (intent.includes('celebrate') || intent.includes('approve')) return 'emotional';
        return 'greeting';
    }

    selectSpecificGesture(gestureType, context) {
        const category = this.gestureLibrary.get(gestureType);
        if (!category) return 'nod';

        const gestures = Object.keys(category);
        if (context.formal && gestures.includes('nod')) return 'nod';
        if (context.celebratory && gestures.includes('clap')) return 'clap';
        return gestures[0];
    }

    updateMetrics(intent, sequence) {
        this.metrics.gesturesGenerated += sequence.length;
        this.metrics.sequencesCreated++;
        
        sequence.forEach(gesture => {
            const key = `${gesture.type}_${gesture.name}`;
            this.metrics.gestureTypeUsage.set(key, (this.metrics.gestureTypeUsage.get(key) || 0) + 1);
        });
    }
}

/**
 * Tone Modulation System
 */
class ToneModulationSystem {
    constructor() {
        this.toneProfiles = new Map();
        this.contextAnalyzer = new Map();
        this.initialized = false;
        this.metrics = { tonesApplied: 0, toneProfileUsage: new Map() };
    }

    async initialize() {
        console.log('🎭 Initializing Tone Modulation System...');
        await this.loadToneProfiles();
        this.initializeContextAnalyzer();
        this.initialized = true;
        console.log('✅ Tone Modulation System initialized');
    }

    async loadToneProfiles() {
        this.toneProfiles.set('professional', {
            formality: 'high', warmth: 'medium', confidence: 'high',
            characteristics: ['clear', 'respectful', 'authoritative']
        });

        this.toneProfiles.set('friendly', {
            formality: 'low', warmth: 'high', confidence: 'medium',
            characteristics: ['approachable', 'supportive', 'encouraging']
        });

        this.toneProfiles.set('supportive', {
            formality: 'low', warmth: 'high', empathy: 'high',
            characteristics: ['understanding', 'patient', 'reassuring']
        });

        this.toneProfiles.set('urgent', {
            formality: 'medium', confidence: 'high', urgency: 'high',
            characteristics: ['direct', 'decisive', 'action-oriented']
        });

        console.log(`🎪 Loaded ${this.toneProfiles.size} tone profiles`);
    }

    initializeContextAnalyzer() {
        this.contextAnalyzer.set('userState', (context) => {
            if (context.frustrated || context.angry) return 'supportive';
            if (context.professional || context.business) return 'professional';
            if (context.emergency || context.critical) return 'urgent';
            return 'friendly';
        });

        this.contextAnalyzer.set('content', (context) => {
            if (context.error || context.warning) return 'urgent';
            if (context.sensitive || context.personal) return 'supportive';
            return 'friendly';
        });
    }

    async modulateTone(content, context = {}) {
        try {
            let selectedTone = 'friendly';
            
            for (const [analyzerName, analyzer] of this.contextAnalyzer) {
                const suggestedTone = analyzer(context);
                if (this.toneProfiles.has(suggestedTone)) {
                    selectedTone = suggestedTone;
                    break;
                }
            }

            const toneProfile = this.toneProfiles.get(selectedTone);
            const modulatedContent = await this.applyToneModulation(content, toneProfile, context);
            this.updateMetrics(selectedTone);

            return {
                content: modulatedContent,
                tone: selectedTone,
                profile: toneProfile
            };
        } catch (error) {
            console.error('❌ Error modulating tone:', error);
            return { content: content, tone: 'friendly', error: error.message };
        }
    }

    async applyToneModulation(content, profile, context) {
        let modulated = content;

        if (profile.formality === 'high') {
            modulated = modulated.replace(/\bcan't\b/g, 'cannot').replace(/\bwon't\b/g, 'will not');
        } else if (profile.formality === 'low') {
            modulated = modulated.replace(/\bcannot\b/g, "can't").replace(/\bwill not\b/g, "won't");
        }

        if (profile.warmth === 'high' && !content.match(/(please|thank you)/i)) {
            modulated = 'I appreciate you asking. ' + modulated;
        }

        if (profile.urgency === 'high' && !content.match(/^(urgent|important)/i)) {
            modulated = 'Important: ' + modulated;
        }

        return modulated;
    }

    updateMetrics(tone) {
        this.metrics.tonesApplied++;
        this.metrics.toneProfileUsage.set(tone, (this.metrics.toneProfileUsage.get(tone) || 0) + 1);
    }
}

/**
 * Fallback Strategy System
 */
class FallbackStrategySystem {
    constructor() {
        this.fallbackStrategies = new Map();
        this.recoveryMechanisms = new Map();
        this.initialized = false;
        this.metrics = { fallbacksTriggered: 0, strategyUsage: new Map() };
    }

    async initialize() {
        console.log('🛡️ Initializing Fallback Strategy System...');
        await this.setupFallbackStrategies();
        this.setupRecoveryMechanisms();
        this.initialized = true;
        console.log('✅ Fallback Strategy System initialized');
    }

    async setupFallbackStrategies() {
        this.fallbackStrategies.set('data_unavailable', {
            priority: 1,
            message: "I don't have complete information about that right now, but I can help you with what I do know.",
            actions: ['acknowledge_limitation', 'offer_alternative']
        });

        this.fallbackStrategies.set('processing_error', {
            priority: 2,
            message: "I encountered an issue processing that request. Let me try a different approach.",
            actions: ['acknowledge_error', 'attempt_retry']
        });

        this.fallbackStrategies.set('context_unclear', {
            priority: 3,
            message: "I want to make sure I understand correctly. Could you provide a bit more context?",
            actions: ['request_clarification', 'offer_examples']
        });

        console.log(`🔄 Setup ${this.fallbackStrategies.size} fallback strategies`);
    }

    setupRecoveryMechanisms() {
        this.recoveryMechanisms.set('retry_simplified', async (request, context) => {
            console.log('🔄 Attempting recovery with simplified approach...');
            return { strategy: 'simplified', request: this.simplifyRequest(request) };
        });

        this.recoveryMechanisms.set('fallback_basic', async (request, context) => {
            console.log('🔄 Falling back to basic response...');
            return { 
                strategy: 'basic', 
                response: "I understand you're asking about this topic. I'm here to help in whatever way I can."
            };
        });
    }

    async handleFallback(errorType, originalRequest, context = {}) {
        try {
            const strategy = this.fallbackStrategies.get(errorType) || this.fallbackStrategies.get('processing_error');
            const recovery = this.recoveryMechanisms.get('fallback_basic');
            
            const result = await recovery(originalRequest, context);
            this.updateMetrics(errorType);

            console.log(`🛡️ Applied fallback strategy for: ${errorType}`);
            return {
                fallback: true,
                strategy: strategy,
                recovery: result,
                message: strategy.message
            };
        } catch (error) {
            console.error('❌ Error in fallback handling:', error);
            return {
                fallback: true,
                error: true,
                message: "I'm experiencing technical difficulties. Please try again."
            };
        }
    }

    simplifyRequest(request) {
        if (typeof request === 'string') {
            return request.split('.')[0] + '.'; // Take first sentence
        }
        return request;
    }

    updateMetrics(strategy) {
        this.metrics.fallbacksTriggered++;
        this.metrics.strategyUsage.set(strategy, (this.metrics.strategyUsage.get(strategy) || 0) + 1);
    }
}

/**
 * Main Responses Module
 */
class ResponsesModule extends EventEmitter {
    constructor(evaCore) {
        super();
        this.evaCore = evaCore;
        this.textGenerator = new TextResponseGenerator();
        this.voiceGenerator = new VoiceResponseGenerator();
        this.gestureGenerator = new GestureResponseGenerator();
        this.toneModulator = new ToneModulationSystem();
        this.fallbackSystem = new FallbackStrategySystem();
        
        this.initialized = false;
        this.metrics = {
            totalResponses: 0,
            responseTypes: new Map(),
            averageProcessingTime: 0,
            successRate: 0
        };
    }

    async initialize() {
        console.log('🗣️ Initializing EVA Responses Module...');
        
        try {
            // Initialize all response systems
            await Promise.all([
                this.textGenerator.initialize(),
                this.voiceGenerator.initialize(),
                this.gestureGenerator.initialize(),
                this.toneModulator.initialize(),
                this.fallbackSystem.initialize()
            ]);

            this.initialized = true;
            this.emit('initialized');
            console.log('✅ EVA Responses Module fully initialized');
            
            return {
                success: true,
                message: 'Responses Module initialized successfully',
                capabilities: ['text', 'voice', 'gesture', 'tone_modulation', 'fallback_handling']
            };
        } catch (error) {
            console.error('❌ Failed to initialize Responses Module:', error);
            throw error;
        }
    }

    async generateMultimodalResponse(input, context = {}) {
        const startTime = Date.now();
        
        try {
            if (!this.initialized) {
                throw new Error('Responses Module not initialized');
            }

            console.log('🎯 Generating multimodal response...');
            
            // Determine response modalities based on context
            const modalities = this.determineModalities(context);
            const responses = {};

            // Generate responses for each modality
            if (modalities.includes('text')) {
                const toneResult = await this.toneModulator.modulateTone(input, context);
                responses.text = await this.textGenerator.generateResponse(toneResult.content, context);
                responses.tone = toneResult.tone;
            }

            if (modalities.includes('voice') && responses.text) {
                responses.voice = await this.voiceGenerator.generateSpeech(responses.text, context);
            }

            if (modalities.includes('gesture')) {
                const intent = context.intent || 'general_response';
                responses.gesture = await this.gestureGenerator.generateGesture(intent, context);
            }

            // Update metrics
            const processingTime = Date.now() - startTime;
            this.updateMetrics(modalities, processingTime, true);

            console.log(`✅ Generated multimodal response (${processingTime}ms): ${modalities.join(', ')}`);
            
            this.emit('response_generated', {
                modalities: modalities,
                responses: responses,
                processingTime: processingTime,
                context: context
            });

            return {
                success: true,
                modalities: modalities,
                responses: responses,
                processingTime: processingTime,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error('❌ Error generating multimodal response:', error);
            
            // Apply fallback strategy
            const fallback = await this.fallbackSystem.handleFallback('processing_error', input, context);
            this.updateMetrics(['fallback'], Date.now() - startTime, false);
            
            return {
                success: false,
                error: error.message,
                fallback: fallback,
                timestamp: Date.now()
            };
        }
    }

    determineModalities(context) {
        const modalities = ['text']; // Always include text as base

        // Add voice for audio contexts or accessibility
        if (context.audio || context.accessibility_voice || context.hands_free) {
            modalities.push('voice');
        }

        // Add gesture for interactive or embodied contexts
        if (context.interactive || context.embodied || context.demonstration) {
            modalities.push('gesture');
        }

        // Add based on user preferences
        if (context.preferredModalities) {
            context.preferredModalities.forEach(modality => {
                if (!modalities.includes(modality)) {
                    modalities.push(modality);
                }
            });
        }

        return modalities;
    }

    updateMetrics(modalities, processingTime, success) {
        this.metrics.totalResponses++;
        this.metrics.averageProcessingTime = (this.metrics.averageProcessingTime + processingTime) / 2;
        
        modalities.forEach(modality => {
            this.metrics.responseTypes.set(modality, (this.metrics.responseTypes.get(modality) || 0) + 1);
        });

        if (success) {
            const currentSuccesses = Math.floor(this.metrics.successRate * (this.metrics.totalResponses - 1));
            this.metrics.successRate = (currentSuccesses + 1) / this.metrics.totalResponses;
        } else {
            const currentSuccesses = Math.floor(this.metrics.successRate * (this.metrics.totalResponses - 1));
            this.metrics.successRate = currentSuccesses / this.metrics.totalResponses;
        }
    }

    async getStatus() {
        return {
            initialized: this.initialized,
            modules: {
                textGenerator: this.textGenerator.initialized,
                voiceGenerator: this.voiceGenerator.initialized,
                gestureGenerator: this.gestureGenerator.initialized,
                toneModulator: this.toneModulator.initialized,
                fallbackSystem: this.fallbackSystem.initialized
            },
            metrics: this.metrics,
            capabilities: this.initialized ? ['multimodal_output', 'tone_modulation', 'fallback_handling'] : []
        };
    }

    async shutdown() {
        console.log('🔄 Shutting down Responses Module...');
        this.initialized = false;
        this.emit('shutdown');
        console.log('✅ Responses Module shutdown complete');
    }
}

export { ResponsesModule };