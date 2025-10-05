/**
 * Error Handling and Fallback Systems
 * Provides comprehensive error management and graceful degradation for EVA
 */

class ErrorHandlingManager {
    constructor() {
        this.errorLog = [];
        this.fallbackStrategies = new Map();
        this.recoveryAttempts = new Map();
        this.maxRetryAttempts = 3;
        this.fallbackThreshold = 5; // Switch to fallback after 5 consecutive failures
        this.systemStatus = {
            openai: 'unknown',
            storage: 'unknown',
            vision: 'unknown',
            voice: 'unknown',
            network: 'unknown'
        };
        this.errorHandlers = new Map();
        this.initialized = false;
    }

    async initialize() {
        try {
            // Register default error handlers
            this.registerErrorHandlers();
            
            // Register fallback strategies
            this.registerFallbackStrategies();
            
            // Start system monitoring
            this.startSystemMonitoring();
            
            // Setup global error handling
            this.setupGlobalErrorHandling();
            
            this.initialized = true;
            console.log('🛡️ Error Handling Manager initialized');
            
            return { success: true };
        } catch (error) {
            console.error('Failed to initialize Error Handling Manager:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Register default error handlers for different error types
     */
    registerErrorHandlers() {
        // Network errors
        this.errorHandlers.set('NetworkError', async (error, context) => {
            console.warn('🌐 Network error detected:', error.message);
            
            if (context.service === 'openai') {
                return await this.handleOpenAINetworkError(error, context);
            }
            
            return this.getGenericNetworkFallback(error, context);
        });

        // API quota/rate limit errors
        this.errorHandlers.set('QuotaError', async (error, context) => {
            console.warn('📊 API quota exceeded:', error.message);
            return await this.handleQuotaError(error, context);
        });

        // Authentication errors
        this.errorHandlers.set('AuthError', async (error, context) => {
            console.warn('🔐 Authentication error:', error.message);
            return await this.handleAuthError(error, context);
        });

        // Storage errors
        this.errorHandlers.set('StorageError', async (error, context) => {
            console.warn('💾 Storage error:', error.message);
            return await this.handleStorageError(error, context);
        });

        // Processing errors
        this.errorHandlers.set('ProcessingError', async (error, context) => {
            console.warn('⚙️ Processing error:', error.message);
            return await this.handleProcessingError(error, context);
        });

        // Timeout errors
        this.errorHandlers.set('TimeoutError', async (error, context) => {
            console.warn('⏱️ Timeout error:', error.message);
            return await this.handleTimeoutError(error, context);
        });
    }

    /**
     * Register fallback strategies for different services
     */
    registerFallbackStrategies() {
        // OpenAI API fallback
        this.fallbackStrategies.set('openai_chat', {
            priority: ['openai', 'foundational', 'cached', 'generic'],
            handlers: {
                foundational: async (input, context) => {
                    return {
                        success: true,
                        content: "I'm currently using my foundational capabilities to respond. While I may not have access to the most advanced AI features right now, I can still help you with basic tasks and information.",
                        source: 'foundational',
                        confidence: 0.7
                    };
                },
                cached: async (input, context) => {
                    const cached = this.getCachedResponse(input);
                    if (cached) {
                        return {
                            success: true,
                            content: cached,
                            source: 'cached',
                            confidence: 0.6
                        };
                    }
                    return null;
                },
                generic: async (input, context) => {
                    return {
                        success: true,
                        content: "I apologize, but I'm experiencing some technical difficulties with my advanced AI capabilities. I'm working on resolving this issue. In the meantime, please try again or rephrase your request.",
                        source: 'generic',
                        confidence: 0.3
                    };
                }
            }
        });

        // Image analysis fallback
        this.fallbackStrategies.set('image_analysis', {
            priority: ['openai_vision', 'local_analysis', 'basic_info', 'generic'],
            handlers: {
                local_analysis: async (imageData, context) => {
                    return {
                        success: true,
                        description: "I can see that you've shared an image. While my advanced image analysis capabilities are currently limited, I can still help you with basic image information and answer questions about what you're trying to achieve.",
                        source: 'local_analysis',
                        confidence: 0.5
                    };
                },
                basic_info: async (imageData, context) => {
                    const info = this.extractBasicImageInfo(imageData);
                    return {
                        success: true,
                        description: `I can see an image file (${info.type}, ${info.size}). While I can't analyze the content in detail right now, I'm still here to help if you have questions about it.`,
                        source: 'basic_info',
                        confidence: 0.4
                    };
                },
                generic: async (imageData, context) => {
                    return {
                        success: true,
                        description: "I can see that you've shared an image, but I'm currently unable to analyze its contents. Please try again later or describe what you'd like to know about the image.",
                        source: 'generic',
                        confidence: 0.2
                    };
                }
            }
        });

        // Voice processing fallback
        this.fallbackStrategies.set('voice_processing', {
            priority: ['web_speech_api', 'basic_recording', 'manual_input'],
            handlers: {
                basic_recording: async (audioData, context) => {
                    return {
                        success: true,
                        transcription: '[Voice message recorded - transcription not available]',
                        source: 'basic_recording',
                        confidence: 0.3
                    };
                },
                manual_input: async (audioData, context) => {
                    return {
                        success: true,
                        transcription: '[Please type your message instead]',
                        source: 'manual_input',
                        confidence: 0.1,
                        suggestion: 'Voice processing is currently unavailable. Please use text input.'
                    };
                }
            }
        });
    }

    /**
     * Handle errors with automatic fallback
     */
    async handleError(error, context = {}) {
        try {
            // Log the error
            this.logError(error, context);
            
            // Determine error type
            const errorType = this.classifyError(error);
            
            // Update system status
            this.updateSystemStatus(errorType, 'error', context);
            
            // Get appropriate error handler
            const handler = this.errorHandlers.get(errorType);
            
            if (handler) {
                const result = await handler(error, context);
                if (result && result.success) {
                    console.log(`✅ Error handled successfully with ${errorType} handler`);
                    return result;
                }
            }
            
            // Fallback to general error handling
            return await this.handleGenericError(error, context);
            
        } catch (handlingError) {
            console.error('Error in error handler:', handlingError);
            return this.getLastResortFallback(error, context);
        }
    }

    /**
     * Execute fallback strategy for a service
     */
    async executeFallback(serviceName, input, context = {}) {
        const strategy = this.fallbackStrategies.get(serviceName);
        if (!strategy) {
            return this.getGenericFallback(serviceName, input, context);
        }

        for (const method of strategy.priority) {
            try {
                const handler = strategy.handlers[method];
                if (handler) {
                    const result = await handler(input, context);
                    if (result && result.success) {
                        console.log(`✅ Fallback successful: ${serviceName} -> ${method}`);
                        return result;
                    }
                }
            } catch (fallbackError) {
                console.warn(`Fallback method ${method} failed:`, fallbackError);
                continue;
            }
        }

        return this.getGenericFallback(serviceName, input, context);
    }

    /**
     * Classify error type based on error object
     */
    classifyError(error) {
        const message = error.message?.toLowerCase() || '';
        const name = error.name?.toLowerCase() || '';
        
        // Network-related errors
        if (message.includes('network') || message.includes('fetch') || 
            message.includes('connection') || name.includes('networkerror')) {
            return 'NetworkError';
        }
        
        // Authentication errors
        if (message.includes('unauthorized') || message.includes('api key') ||
            message.includes('authentication') || error.status === 401) {
            return 'AuthError';
        }
        
        // Quota/rate limit errors
        if (message.includes('quota') || message.includes('rate limit') ||
            message.includes('too many requests') || error.status === 429) {
            return 'QuotaError';
        }
        
        // Storage errors
        if (message.includes('storage') || message.includes('database') ||
            message.includes('indexeddb') || message.includes('localstorage')) {
            return 'StorageError';
        }
        
        // Timeout errors
        if (message.includes('timeout') || name.includes('timeouterror')) {
            return 'TimeoutError';
        }
        
        return 'ProcessingError';
    }

    /**
     * Handle OpenAI network errors
     */
    async handleOpenAINetworkError(error, context) {
        this.systemStatus.openai = 'error';
        this.systemStatus.network = 'error';
        
        // Try fallback to foundational system
        return await this.executeFallback('openai_chat', context.input, context);
    }

    /**
     * Handle API quota errors
     */
    async handleQuotaError(error, context) {
        this.systemStatus.openai = 'quota_exceeded';
        
        // Implement exponential backoff
        const backoffTime = this.calculateBackoffTime(context.service);
        
        return {
            success: true,
            content: `I've temporarily reached my API usage limit. I'll continue using my foundational capabilities to help you. Advanced features will be available again in ${Math.round(backoffTime / 60000)} minutes.`,
            source: 'quota_fallback',
            confidence: 0.8,
            retryAfter: backoffTime
        };
    }

    /**
     * Handle authentication errors
     */
    async handleAuthError(error, context) {
        this.systemStatus.openai = 'auth_error';
        
        return {
            success: true,
            content: "I'm experiencing authentication issues with my advanced AI services. I'll use my foundational capabilities to assist you. Please check the API key configuration if you're the administrator.",
            source: 'auth_fallback',
            confidence: 0.7,
            requiresAction: 'check_api_key'
        };
    }

    /**
     * Handle storage errors
     */
    async handleStorageError(error, context) {
        this.systemStatus.storage = 'error';
        
        // Try to switch to alternative storage
        if (context.storageType === 'indexeddb') {
            return {
                success: true,
                content: 'Switching to alternative storage method due to technical difficulties.',
                source: 'storage_fallback',
                confidence: 0.8,
                action: 'switch_to_localstorage'
            };
        }
        
        return {
            success: true,
            content: "I'm experiencing storage issues. Your data may not be saved during this session.",
            source: 'storage_fallback',
            confidence: 0.6,
            warning: 'data_not_persistent'
        };
    }

    /**
     * Handle processing errors
     */
    async handleProcessingError(error, context) {
        return {
            success: true,
            content: 'I encountered a processing error, but I\'m still here to help. Please try rephrasing your request or try again.',
            source: 'processing_fallback',
            confidence: 0.6,
            suggestion: 'rephrase_or_retry'
        };
    }

    /**
     * Handle timeout errors
     */
    async handleTimeoutError(error, context) {
        return {
            success: true,
            content: 'The request took longer than expected to process. I\'m still working on it, but here\'s what I can tell you right now based on my immediate capabilities.',
            source: 'timeout_fallback',
            confidence: 0.5,
            suggestion: 'try_simpler_request'
        };
    }

    /**
     * Log error for analysis
     */
    logError(error, context) {
        const errorEntry = {
            timestamp: new Date(),
            type: this.classifyError(error),
            message: error.message,
            stack: error.stack,
            context: context,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.errorLog.push(errorEntry);
        
        // Keep only recent errors (last 100)
        if (this.errorLog.length > 100) {
            this.errorLog = this.errorLog.slice(-100);
        }
        
        // Store critical errors
        if (this.isCriticalError(error)) {
            localStorage.setItem('eva_critical_errors', JSON.stringify(this.errorLog.slice(-10)));
        }
    }

    /**
     * Update system status
     */
    updateSystemStatus(component, status, context) {
        if (context.service) {
            this.systemStatus[context.service] = status;
        }
        
        // Broadcast status update
        window.dispatchEvent(new CustomEvent('evaSystemStatusUpdate', {
            detail: {
                component,
                status,
                timestamp: new Date()
            }
        }));
    }

    /**
     * Check if error is critical
     */
    isCriticalError(error) {
        const criticalKeywords = ['security', 'corruption', 'fatal', 'crash'];
        const message = error.message?.toLowerCase() || '';
        return criticalKeywords.some(keyword => message.includes(keyword));
    }

    /**
     * Calculate backoff time for retries
     */
    calculateBackoffTime(service) {
        const baseDelay = 60000; // 1 minute
        const attempts = this.recoveryAttempts.get(service) || 0;
        return baseDelay * Math.pow(2, Math.min(attempts, 5)); // Max 32 minutes
    }

    /**
     * Extract basic image information
     */
    extractBasicImageInfo(imageData) {
        const match = imageData.match(/^data:([^;]+);/);
        const type = match ? match[1] : 'unknown';
        const base64Data = imageData.split(',')[1] || '';
        const sizeBytes = (base64Data.length * 3) / 4;
        const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
        
        return {
            type: type,
            size: `${sizeMB}MB`,
            format: type.split('/')[1] || 'unknown'
        };
    }

    /**
     * Get cached response for similar inputs
     */
    getCachedResponse(input) {
        // Simple cache lookup (in production, use more sophisticated matching)
        const cached = localStorage.getItem(`eva_cached_${btoa(input.slice(0, 50))}`);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.timestamp < 3600000) { // 1 hour cache
                    return parsed.response;
                }
            } catch (e) {
                // Ignore cache errors
            }
        }
        return null;
    }

    /**
     * Generic fallback for any service
     */
    getGenericFallback(serviceName, input, context) {
        return {
            success: true,
            content: `I'm experiencing technical difficulties with ${serviceName}. I'm still here to help using my alternative capabilities. Please try again or let me know if you need assistance with something else.`,
            source: 'generic_fallback',
            confidence: 0.4
        };
    }

    /**
     * Last resort fallback when all else fails
     */
    getLastResortFallback(error, context) {
        return {
            success: true,
            content: "I'm experiencing some technical difficulties, but I'm still operational. Please try again in a moment, or feel free to ask me something else.",
            source: 'last_resort',
            confidence: 0.3,
            error: error.message
        };
    }

    /**
     * Handle generic errors
     */
    async handleGenericError(error, context) {
        return {
            success: true,
            content: 'I encountered an unexpected issue, but I\'m still here to help. Please try again or let me know if you need assistance with something else.',
            source: 'generic_handler',
            confidence: 0.5
        };
    }

    /**
     * Generic network fallback
     */
    getGenericNetworkFallback(error, context) {
        return {
            success: true,
            content: 'I\'m having trouble connecting to some of my services. I\'ll continue using my offline capabilities to assist you.',
            source: 'network_fallback',
            confidence: 0.6
        };
    }

    /**
     * Start monitoring system health
     */
    startSystemMonitoring() {
        // Monitor every 30 seconds
        setInterval(() => {
            this.performHealthCheck();
        }, 30000);
    }

    /**
     * Perform health check on all systems
     */
    async performHealthCheck() {
        try {
            // Check network connectivity
            if (navigator.onLine) {
                this.systemStatus.network = 'online';
            } else {
                this.systemStatus.network = 'offline';
            }
            
            // Check storage availability
            try {
                localStorage.setItem('eva_health_check', Date.now().toString());
                this.systemStatus.storage = 'available';
            } catch (e) {
                this.systemStatus.storage = 'error';
            }
            
        } catch (error) {
            console.warn('Health check failed:', error);
        }
    }

    /**
     * Setup global error handling
     */
    setupGlobalErrorHandling() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleError(event.reason, { source: 'unhandled_promise' });
        });
        
        // Handle global JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleError(event.error, { source: 'global_error' });
        });
    }

    /**
     * Get current system status
     */
    getSystemStatus() {
        return {
            status: this.systemStatus,
            errorCount: this.errorLog.length,
            lastError: this.errorLog[this.errorLog.length - 1],
            recoveryAttempts: Object.fromEntries(this.recoveryAttempts)
        };
    }

    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
        localStorage.removeItem('eva_critical_errors');
        console.log('🧹 Error log cleared');
    }

    /**
     * Reset system status
     */
    resetSystemStatus() {
        this.systemStatus = {
            openai: 'unknown',
            storage: 'unknown',
            vision: 'unknown',
            voice: 'unknown',
            network: 'unknown'
        };
        this.recoveryAttempts.clear();
        console.log('🔄 System status reset');
    }
}

export default ErrorHandlingManager;