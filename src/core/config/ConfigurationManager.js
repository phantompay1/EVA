/**
 * Configuration Manager
 * Handles environment variables, secure configuration, and application settings
 */

class ConfigurationManager {
    constructor() {
        this.config = {};
        this.secureConfig = {};
        this.defaultConfig = {
            openai: {
                models: {
                    chat: 'gpt-4',
                    vision: 'gpt-4-vision-preview',
                    fallback: 'gpt-3.5-turbo'
                },
                maxTokens: 1000,
                temperature: 0.7,
                timeout: 30000
            },
            eva: {
                language: 'en',
                fallbackLanguage: 'sw',
                responseDelay: 100,
                enableVoice: true,
                enableVision: true
            },
            ui: {
                theme: 'dark',
                animations: true,
                chatMaxMessages: 100,
                fileUploadMaxSize: 50 * 1024 * 1024 // 50MB
            },
            storage: {
                useIndexedDB: true,
                fallbackToLocalStorage: true,
                compressionEnabled: true
            }
        };
        this.initialized = false;
    }

    /**
     * Initialize configuration manager
     */
    async initialize() {
        try {
            // Load default configuration
            this.config = { ...this.defaultConfig };

            // Load environment variables
            await this.loadEnvironmentVariables();

            // Load stored configuration
            await this.loadStoredConfiguration();

            // Validate configuration
            this.validateConfiguration();

            this.initialized = true;
            console.log('Configuration manager initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize configuration manager:', error);
            this.initialized = false;
            return false;
        }
    }

    /**
     * Load environment variables (if available)
     */
    async loadEnvironmentVariables() {
        try {
            // Browser environment - check for injected environment variables
            if (typeof window !== 'undefined' && window.EVA_ENV) {
                Object.assign(this.config, window.EVA_ENV);
            }

            // Node.js environment (if running in Node.js context)
            if (typeof process !== 'undefined' && process.env) {
                const envConfig = this.parseEnvironmentVariables(process.env);
                Object.assign(this.config, envConfig);
            }

            // Check for .env file support (if available)
            await this.loadDotEnvFile();

        } catch (error) {
            console.warn('Could not load environment variables:', error.message);
        }
    }

    /**
     * Parse environment variables into configuration structure
     */
    parseEnvironmentVariables(env) {
        const config = {};

        // OpenAI configuration
        if (env.OPENAI_API_KEY) {
            config.openai = config.openai || {};
            config.openai.apiKey = env.OPENAI_API_KEY;
        }

        if (env.OPENAI_MODEL) {
            config.openai = config.openai || {};
            config.openai.models = config.openai.models || {};
            config.openai.models.chat = env.OPENAI_MODEL;
        }

        if (env.OPENAI_MAX_TOKENS) {
            config.openai = config.openai || {};
            config.openai.maxTokens = parseInt(env.OPENAI_MAX_TOKENS, 10);
        }

        if (env.OPENAI_TEMPERATURE) {
            config.openai = config.openai || {};
            config.openai.temperature = parseFloat(env.OPENAI_TEMPERATURE);
        }

        // EVA configuration
        if (env.EVA_LANGUAGE) {
            config.eva = config.eva || {};
            config.eva.language = env.EVA_LANGUAGE;
        }

        if (env.EVA_THEME) {
            config.ui = config.ui || {};
            config.ui.theme = env.EVA_THEME;
        }

        // Debug mode
        if (env.DEBUG === 'true' || env.NODE_ENV === 'development') {
            config.debug = true;
        }

        return config;
    }

    /**
     * Attempt to load .env file (if available)
     */
    async loadDotEnvFile() {
        try {
            // Try to load .env file from various locations
            const envPaths = ['.env', '.env.local', '.env.production'];
            
            for (const path of envPaths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        const envContent = await response.text();
                        const envVars = this.parseDotEnvContent(envContent);
                        const config = this.parseEnvironmentVariables(envVars);
                        Object.assign(this.config, config);
                        console.log(`Loaded environment from ${path}`);
                        break;
                    }
                } catch (error) {
                    // Ignore file not found errors
                    continue;
                }
            }
        } catch (error) {
            console.warn('Could not load .env file:', error.message);
        }
    }

    /**
     * Parse .env file content
     */
    parseDotEnvContent(content) {
        const vars = {};
        const lines = content.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                let value = valueParts.join('=').trim();
                
                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                vars[key.trim()] = value;
            }
        }

        return vars;
    }

    /**
     * Load stored configuration from browser storage
     */
    async loadStoredConfiguration() {
        try {
            // Load from localStorage
            const storedConfig = localStorage.getItem('eva_configuration');
            if (storedConfig) {
                const parsed = JSON.parse(storedConfig);
                this.mergeConfiguration(parsed);
            }

            // Load secure configuration from IndexedDB
            await this.loadSecureConfiguration();

        } catch (error) {
            console.warn('Could not load stored configuration:', error.message);
        }
    }

    /**
     * Load secure configuration (API keys, sensitive data)
     */
    async loadSecureConfiguration() {
        try {
            const db = await this.openConfigDB();
            const transaction = db.transaction(['secure_config'], 'readonly');
            const store = transaction.objectStore('secure_config');
            const request = store.getAll();

            return new Promise((resolve) => {
                request.onsuccess = () => {
                    const results = request.result;
                    for (const item of results) {
                        this.secureConfig[item.key] = this.decrypt(item.value);
                    }
                    resolve();
                };
                request.onerror = () => resolve(); // Don't fail on error
            });
        } catch (error) {
            console.warn('Could not load secure configuration:', error.message);
        }
    }

    /**
     * Open configuration database
     */
    async openConfigDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('EVA_Configuration', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('secure_config')) {
                    db.createObjectStore('secure_config', { keyPath: 'key' });
                }
                if (!db.objectStoreNames.contains('user_preferences')) {
                    db.createObjectStore('user_preferences', { keyPath: 'key' });
                }
            };
        });
    }

    /**
     * Save configuration
     */
    async saveConfiguration() {
        try {
            // Save non-sensitive config to localStorage
            const configToSave = { ...this.config };
            delete configToSave.openai?.apiKey; // Don't save API key in localStorage

            localStorage.setItem('eva_configuration', JSON.stringify(configToSave));

            // Save secure configuration to IndexedDB
            await this.saveSecureConfiguration();

            console.log('Configuration saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save configuration:', error);
            return false;
        }
    }

    /**
     * Save secure configuration
     */
    async saveSecureConfiguration() {
        try {
            const db = await this.openConfigDB();
            const transaction = db.transaction(['secure_config'], 'readwrite');
            const store = transaction.objectStore('secure_config');

            for (const [key, value] of Object.entries(this.secureConfig)) {
                await store.put({
                    key: key,
                    value: this.encrypt(value),
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error('Failed to save secure configuration:', error);
        }
    }

    /**
     * Set configuration value
     */
    set(path, value) {
        const keys = path.split('.');
        let current = this.config;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }

        current[keys[keys.length - 1]] = value;
    }

    /**
     * Get configuration value
     */
    get(path, defaultValue = null) {
        const keys = path.split('.');
        let current = this.config;

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return defaultValue;
            }
        }

        return current;
    }

    /**
     * Set secure configuration value (API keys, etc.)
     */
    setSecure(key, value) {
        this.secureConfig[key] = value;
    }

    /**
     * Get secure configuration value
     */
    getSecure(key, defaultValue = null) {
        return this.secureConfig[key] || defaultValue;
    }

    /**
     * Merge configuration objects
     */
    mergeConfiguration(newConfig) {
        this.config = this.deepMerge(this.config, newConfig);
    }

    /**
     * Deep merge objects
     */
    deepMerge(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }

    /**
     * Validate configuration
     */
    validateConfiguration() {
        // Validate OpenAI configuration
        if (this.config.openai) {
            if (this.config.openai.maxTokens && 
                (this.config.openai.maxTokens < 1 || this.config.openai.maxTokens > 4000)) {
                console.warn('Invalid maxTokens value, using default');
                this.config.openai.maxTokens = this.defaultConfig.openai.maxTokens;
            }

            if (this.config.openai.temperature && 
                (this.config.openai.temperature < 0 || this.config.openai.temperature > 2)) {
                console.warn('Invalid temperature value, using default');
                this.config.openai.temperature = this.defaultConfig.openai.temperature;
            }
        }

        // Validate file upload size
        if (this.config.ui?.fileUploadMaxSize && this.config.ui.fileUploadMaxSize > 100 * 1024 * 1024) {
            console.warn('File upload size too large, limiting to 100MB');
            this.config.ui.fileUploadMaxSize = 100 * 1024 * 1024;
        }
    }

    /**
     * Reset configuration to defaults
     */
    resetToDefaults() {
        this.config = { ...this.defaultConfig };
        this.secureConfig = {};
    }

    /**
     * Export configuration (excluding sensitive data)
     */
    exportConfiguration() {
        const configCopy = { ...this.config };
        delete configCopy.openai?.apiKey;
        return JSON.stringify(configCopy, null, 2);
    }

    /**
     * Import configuration
     */
    importConfiguration(configString) {
        try {
            const importedConfig = JSON.parse(configString);
            this.mergeConfiguration(importedConfig);
            return true;
        } catch (error) {
            console.error('Failed to import configuration:', error);
            return false;
        }
    }

    /**
     * Simple encryption (use proper encryption in production)
     */
    encrypt(value) {
        return btoa(JSON.stringify(value));
    }

    /**
     * Simple decryption
     */
    decrypt(encryptedValue) {
        try {
            return JSON.parse(atob(encryptedValue));
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }

    /**
     * Get current configuration status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            hasOpenAIKey: !!this.getSecure('openai_api_key'),
            configurationLoaded: Object.keys(this.config).length > 0,
            secureConfigurationLoaded: Object.keys(this.secureConfig).length > 0
        };
    }

    /**
     * Clear all stored configuration
     */
    async clearConfiguration() {
        try {
            localStorage.removeItem('eva_configuration');
            
            const db = await this.openConfigDB();
            const transaction = db.transaction(['secure_config', 'user_preferences'], 'readwrite');
            
            const secureStore = transaction.objectStore('secure_config');
            const prefsStore = transaction.objectStore('user_preferences');
            
            await secureStore.clear();
            await prefsStore.clear();

            this.config = { ...this.defaultConfig };
            this.secureConfig = {};

            console.log('Configuration cleared successfully');
            return true;
        } catch (error) {
            console.error('Failed to clear configuration:', error);
            return false;
        }
    }
}

export default ConfigurationManager;