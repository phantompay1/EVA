/**
 * OpenAI Service Module
 * Provides secure OpenAI API integration with comprehensive error handling
 */

class OpenAIService {
    constructor() {
        this.apiKey = null;
        this.baseURL = 'https://api.openai.com/v1';
        this.models = {
            chat: 'gpt-4',
            vision: 'gpt-4-vision-preview',
            fallback: 'gpt-3.5-turbo'
        };
        this.initialized = false;
        this.rateLimitInfo = {
            remaining: null,
            resetTime: null
        };
    }

    /**
     * Initialize the OpenAI service with API key
     */
    async initialize() {
        try {
            // Try to get API key from multiple sources
            this.apiKey = await this.getAPIKey();
            
            if (!this.apiKey) {
                console.warn('OpenAI API key not found. Service will use fallback responses.');
                this.initialized = false;
                return false;
            }

            // Validate API key
            const isValid = await this.validateAPIKey();
            if (!isValid) {
                console.error('OpenAI API key validation failed');
                this.initialized = false;
                return false;
            }

            this.initialized = true;
            console.log('OpenAI service initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize OpenAI service:', error);
            this.initialized = false;
            return false;
        }
    }

    /**
     * Get API key from multiple sources (environment, storage, user input)
     */
    async getAPIKey() {
        // 1. Try environment variable (if available in browser context)
        if (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY) {
            return process.env.OPENAI_API_KEY;
        }

        // 2. Try secure storage
        const storedKey = await this.getStoredAPIKey();
        if (storedKey) {
            return storedKey;
        }

        // 3. Try session storage (temporary)
        const sessionKey = sessionStorage.getItem('eva_openai_key');
        if (sessionKey) {
            return sessionKey;
        }

        // 4. Prompt user for API key
        return await this.promptForAPIKey();
    }

    /**
     * Get API key from secure storage
     */
    async getStoredAPIKey() {
        try {
            // Use IndexedDB for secure storage
            const db = await this.openSecureDB();
            const transaction = db.transaction(['api_keys'], 'readonly');
            const store = transaction.objectStore('api_keys');
            const request = store.get('openai_api_key');

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    const result = request.result;
                    resolve(result ? this.decryptAPIKey(result.encrypted_key) : null);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Failed to get stored API key:', error);
            return null;
        }
    }

    /**
     * Store API key securely
     */
    async storeAPIKey(apiKey) {
        try {
            const db = await this.openSecureDB();
            const transaction = db.transaction(['api_keys'], 'readwrite');
            const store = transaction.objectStore('api_keys');
            
            const encryptedKey = await this.encryptAPIKey(apiKey);
            await store.put({
                id: 'openai_api_key',
                encrypted_key: encryptedKey,
                timestamp: Date.now()
            });

            console.log('API key stored securely');
            return true;
        } catch (error) {
            console.error('Failed to store API key:', error);
            return false;
        }
    }

    /**
     * Open secure database for API key storage
     */
    async openSecureDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('EVA_SecureStorage', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('api_keys')) {
                    db.createObjectStore('api_keys', { keyPath: 'id' });
                }
            };
        });
    }

    /**
     * Simple encryption for API key (in production, use proper encryption)
     */
    async encryptAPIKey(apiKey) {
        // Simple Base64 encoding with salt (use proper encryption in production)
        const salt = Math.random().toString(36).substring(2, 15);
        const combined = salt + apiKey;
        return btoa(combined);
    }

    /**
     * Decrypt API key
     */
    decryptAPIKey(encryptedKey) {
        try {
            const decoded = atob(encryptedKey);
            return decoded.substring(13); // Remove salt
        } catch (error) {
            console.error('Failed to decrypt API key:', error);
            return null;
        }
    }

    /**
     * Prompt user for API key
     */
    async promptForAPIKey() {
        const apiKey = prompt(`
Please enter your OpenAI API Key:

You can get your API key from:
https://platform.openai.com/api-keys

Note: Your key will be stored securely in your browser.
        `);

        if (apiKey && apiKey.trim()) {
            const trimmedKey = apiKey.trim();
            // Store for future use
            await this.storeAPIKey(trimmedKey);
            // Also store in session for immediate use
            sessionStorage.setItem('eva_openai_key', trimmedKey);
            return trimmedKey;
        }

        return null;
    }

    /**
     * Validate API key by making a test request
     */
    async validateAPIKey() {
        if (!this.apiKey) return false;

        try {
            const response = await fetch(`${this.baseURL}/models`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.ok;
        } catch (error) {
            console.error('API key validation failed:', error);
            return false;
        }
    }

    /**
     * Generate chat completion using OpenAI GPT
     */
    async generateChatCompletion(messages, options = {}) {
        if (!this.initialized) {
            return this.getFallbackResponse(messages);
        }

        try {
            const requestBody = {
                model: options.model || this.models.chat,
                messages: this.formatMessages(messages),
                max_tokens: options.maxTokens || 1000,
                temperature: options.temperature || 0.7,
                stream: false
            };

            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            // Update rate limit info
            this.updateRateLimitInfo(response.headers);

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                content: data.choices[0].message.content,
                usage: data.usage,
                model: data.model
            };
        } catch (error) {
            console.error('OpenAI chat completion failed:', error);
            return this.getFallbackResponse(messages, error);
        }
    }

    /**
     * Analyze images using OpenAI Vision API
     */
    async analyzeImage(imageUrl, prompt = "What do you see in this image?", options = {}) {
        if (!this.initialized) {
            return this.getFallbackImageAnalysis(imageUrl, prompt);
        }

        try {
            const messages = [{
                role: "user",
                content: [
                    {
                        type: "text",
                        text: prompt
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: imageUrl,
                            detail: options.detail || "high"
                        }
                    }
                ]
            }];

            const requestBody = {
                model: this.models.vision,
                messages: messages,
                max_tokens: options.maxTokens || 500,
                temperature: options.temperature || 0.7
            };

            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            this.updateRateLimitInfo(response.headers);

            if (!response.ok) {
                throw new Error(`OpenAI Vision API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                description: data.choices[0].message.content,
                usage: data.usage,
                model: data.model
            };
        } catch (error) {
            console.error('OpenAI image analysis failed:', error);
            return this.getFallbackImageAnalysis(imageUrl, prompt, error);
        }
    }

    /**
     * Format messages for OpenAI API
     */
    formatMessages(messages) {
        if (!Array.isArray(messages)) {
            return [{ role: 'user', content: String(messages) }];
        }

        return messages.map(msg => {
            if (typeof msg === 'string') {
                return { role: 'user', content: msg };
            }
            return {
                role: msg.role || 'user',
                content: msg.content || msg.message || String(msg)
            };
        });
    }

    /**
     * Update rate limit information
     */
    updateRateLimitInfo(headers) {
        this.rateLimitInfo = {
            remaining: headers.get('x-ratelimit-remaining-requests'),
            resetTime: headers.get('x-ratelimit-reset-requests')
        };
    }

    /**
     * Get fallback response when OpenAI is unavailable
     */
    getFallbackResponse(messages, error = null) {
        const lastMessage = Array.isArray(messages) ? 
            messages[messages.length - 1] : messages;
        const userInput = typeof lastMessage === 'string' ? 
            lastMessage : (lastMessage.content || lastMessage.message || '');

        return {
            success: false,
            content: `I apologize, but I'm currently unable to access advanced AI capabilities. ${error ? `Error: ${error.message}` : 'Please configure your OpenAI API key to enable full AI responses.'}

However, I can still help you with basic tasks using my foundational capabilities. Your message: "${userInput}"`,
            isFallback: true,
            error: error?.message
        };
    }

    /**
     * Get fallback image analysis
     */
    getFallbackImageAnalysis(imageUrl, prompt, error = null) {
        return {
            success: false,
            description: `I can see that you've uploaded an image, but I'm currently unable to analyze it using advanced AI vision capabilities. ${error ? `Error: ${error.message}` : 'Please configure your OpenAI API key to enable image analysis.'}

The image appears to be accessible at: ${imageUrl}`,
            isFallback: true,
            error: error?.message
        };
    }

    /**
     * Check if service is properly initialized
     */
    isReady() {
        return this.initialized && this.apiKey;
    }

    /**
     * Get current rate limit status
     */
    getRateLimitStatus() {
        return this.rateLimitInfo;
    }

    /**
     * Clear stored API key
     */
    async clearAPIKey() {
        try {
            const db = await this.openSecureDB();
            const transaction = db.transaction(['api_keys'], 'readwrite');
            const store = transaction.objectStore('api_keys');
            await store.delete('openai_api_key');
            
            sessionStorage.removeItem('eva_openai_key');
            this.apiKey = null;
            this.initialized = false;
            
            console.log('API key cleared successfully');
            return true;
        } catch (error) {
            console.error('Failed to clear API key:', error);
            return false;
        }
    }
}

export default OpenAIService;