/**
 * EVA Enhanced Chat Storage System
 * Handles chat messages with file attachments, voice messages, and metadata
 */

export class ChatStorage {
    constructor() {
        this.dbName = 'EVAChatDB';
        this.dbVersion = 1;
        this.db = null;
        this.isSupported = this.checkSupport();
        this.fallbackStorage = new Map();
        
        this.stores = {
            messages: 'chat_messages',
            attachments: 'file_attachments',
            sessions: 'chat_sessions',
            analysis: 'ai_analysis'
        };
    }

    checkSupport() {
        return 'indexedDB' in window && 'FileReader' in window && 'Blob' in window;
    }

    async initialize() {
        if (!this.isSupported) {
            console.warn('IndexedDB not supported, using fallback storage');
            return this.initializeFallback();
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Failed to open IndexedDB');
                this.initializeFallback();
                resolve();
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ Chat storage initialized with IndexedDB');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.createStores(db);
            };
        });
    }

    createStores(db) {
        // Messages store
        if (!db.objectStoreNames.contains(this.stores.messages)) {
            const messagesStore = db.createObjectStore(this.stores.messages, { 
                keyPath: 'id',
                autoIncrement: false
            });
            
            messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
            messagesStore.createIndex('sessionId', 'sessionId', { unique: false });
            messagesStore.createIndex('type', 'type', { unique: false });
            messagesStore.createIndex('hasAttachments', 'hasAttachments', { unique: false });
        }

        // File attachments store
        if (!db.objectStoreNames.contains(this.stores.attachments)) {
            const attachmentsStore = db.createObjectStore(this.stores.attachments, { 
                keyPath: 'id',
                autoIncrement: false
            });
            
            attachmentsStore.createIndex('messageId', 'messageId', { unique: false });
            attachmentsStore.createIndex('type', 'type', { unique: false });
            attachmentsStore.createIndex('size', 'size', { unique: false });
            attachmentsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Chat sessions store
        if (!db.objectStoreNames.contains(this.stores.sessions)) {
            const sessionsStore = db.createObjectStore(this.stores.sessions, { 
                keyPath: 'id',
                autoIncrement: false
            });
            
            sessionsStore.createIndex('startTime', 'startTime', { unique: false });
            sessionsStore.createIndex('lastActivity', 'lastActivity', { unique: false });
        }

        // AI Analysis store
        if (!db.objectStoreNames.contains(this.stores.analysis)) {
            const analysisStore = db.createObjectStore(this.stores.analysis, { 
                keyPath: 'id',
                autoIncrement: false
            });
            
            analysisStore.createIndex('messageId', 'messageId', { unique: false });
            analysisStore.createIndex('attachmentId', 'attachmentId', { unique: false });
            analysisStore.createIndex('analysisType', 'analysisType', { unique: false });
            analysisStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
    }

    initializeFallback() {
        console.log('📱 Using fallback storage (localStorage + memory)');
        
        // Load existing data from localStorage
        try {
            const stored = localStorage.getItem('eva-chat-data');
            if (stored) {
                const data = JSON.parse(stored);
                this.fallbackStorage.set('messages', data.messages || []);
                this.fallbackStorage.set('attachments', data.attachments || []);
                this.fallbackStorage.set('sessions', data.sessions || []);
                this.fallbackStorage.set('analysis', data.analysis || []);
            }
        } catch (error) {
            console.error('Error loading fallback data:', error);
        }
        
        return Promise.resolve();
    }

    async saveMessage(message) {
        try {
            // Prepare message data
            const messageData = {
                id: message.id || this.generateId(),
                type: message.type,
                content: message.content,
                timestamp: message.timestamp || new Date(),
                sessionId: message.sessionId || 'default',
                hasAttachments: message.attachments && message.attachments.length > 0,
                metadata: {
                    confidence: message.confidence,
                    language: message.language,
                    analysis: message.analysis,
                    processingTime: message.processingTime,
                    foundational: message.foundational
                }
            };

            if (this.db) {
                await this.saveMessageToDB(messageData);
                
                // Save attachments separately
                if (message.attachments) {
                    await this.saveAttachments(messageData.id, message.attachments);
                }
            } else {
                await this.saveMessageToFallback(messageData, message.attachments);
            }

            return messageData.id;
        } catch (error) {
            console.error('Error saving message:', error);
            throw error;
        }
    }

    async saveMessageToDB(messageData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.messages], 'readwrite');
            const store = transaction.objectStore(this.stores.messages);
            
            const request = store.put(messageData);
            
            request.onsuccess = () => resolve(messageData.id);
            request.onerror = () => reject(request.error);
        });
    }

    async saveMessageToFallback(messageData, attachments) {
        const messages = this.fallbackStorage.get('messages') || [];
        messages.push(messageData);
        this.fallbackStorage.set('messages', messages);

        if (attachments) {
            const existingAttachments = this.fallbackStorage.get('attachments') || [];
            const processedAttachments = attachments.map(att => ({
                ...att,
                messageId: messageData.id,
                id: att.id || this.generateId()
            }));
            
            existingAttachments.push(...processedAttachments);
            this.fallbackStorage.set('attachments', existingAttachments);
        }

        this.saveFallbackToLocalStorage();
    }

    async saveAttachments(messageId, attachments) {
        if (!attachments || attachments.length === 0) return;

        const attachmentPromises = attachments.map(async (attachment) => {
            const attachmentData = {
                id: attachment.id || this.generateId(),
                messageId: messageId,
                name: attachment.name,
                type: attachment.type,
                size: attachment.size,
                data: attachment.url, // Base64 data URL
                timestamp: new Date(),
                metadata: {
                    originalFile: attachment.file ? {
                        lastModified: attachment.file.lastModified,
                        webkitRelativePath: attachment.file.webkitRelativePath
                    } : null
                }
            };

            return this.saveAttachmentToDB(attachmentData);
        });

        return Promise.all(attachmentPromises);
    }

    async saveAttachmentToDB(attachmentData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.attachments], 'readwrite');
            const store = transaction.objectStore(this.stores.attachments);
            
            const request = store.put(attachmentData);
            
            request.onsuccess = () => resolve(attachmentData.id);
            request.onerror = () => reject(request.error);
        });
    }

    async saveAnalysis(messageId, attachmentId, analysisData) {
        const analysis = {
            id: this.generateId(),
            messageId: messageId,
            attachmentId: attachmentId,
            analysisType: analysisData.type || 'image_analysis',
            results: analysisData.results,
            confidence: analysisData.confidence,
            processingTime: analysisData.processingTime,
            timestamp: new Date(),
            metadata: analysisData.metadata || {}
        };

        if (this.db) {
            return this.saveAnalysisToDB(analysis);
        } else {
            const analyses = this.fallbackStorage.get('analysis') || [];
            analyses.push(analysis);
            this.fallbackStorage.set('analysis', analyses);
            this.saveFallbackToLocalStorage();
            return analysis.id;
        }
    }

    async saveAnalysisToDB(analysisData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.analysis], 'readwrite');
            const store = transaction.objectStore(this.stores.analysis);
            
            const request = store.put(analysisData);
            
            request.onsuccess = () => resolve(analysisData.id);
            request.onerror = () => reject(request.error);
        });
    }

    async getMessages(options = {}) {
        const {
            limit = 50,
            offset = 0,
            sessionId = null,
            hasAttachments = null,
            startDate = null,
            endDate = null
        } = options;

        if (this.db) {
            return this.getMessagesFromDB(options);
        } else {
            return this.getMessagesFromFallback(options);
        }
    }

    async getMessagesFromDB(options) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.messages], 'readonly');
            const store = transaction.objectStore(this.stores.messages);
            const index = store.index('timestamp');
            
            const messages = [];
            const request = index.openCursor(null, 'prev'); // Latest first
            
            let count = 0;
            let skipped = 0;
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                
                if (!cursor || count >= options.limit) {
                    resolve(messages);
                    return;
                }
                
                const message = cursor.value;
                
                // Apply filters
                if (options.sessionId && message.sessionId !== options.sessionId) {
                    cursor.continue();
                    return;
                }
                
                if (options.hasAttachments !== null && message.hasAttachments !== options.hasAttachments) {
                    cursor.continue();
                    return;
                }
                
                if (options.startDate && message.timestamp < options.startDate) {
                    cursor.continue();
                    return;
                }
                
                if (options.endDate && message.timestamp > options.endDate) {
                    cursor.continue();
                    return;
                }
                
                // Skip offset
                if (skipped < options.offset) {
                    skipped++;
                    cursor.continue();
                    return;
                }
                
                messages.push(message);
                count++;
                cursor.continue();
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    async getMessagesFromFallback(options) {
        let messages = this.fallbackStorage.get('messages') || [];
        
        // Apply filters
        if (options.sessionId) {
            messages = messages.filter(m => m.sessionId === options.sessionId);
        }
        
        if (options.hasAttachments !== null) {
            messages = messages.filter(m => m.hasAttachments === options.hasAttachments);
        }
        
        if (options.startDate) {
            messages = messages.filter(m => new Date(m.timestamp) >= options.startDate);
        }
        
        if (options.endDate) {
            messages = messages.filter(m => new Date(m.timestamp) <= options.endDate);
        }
        
        // Sort by timestamp (latest first)
        messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Apply pagination
        return messages.slice(options.offset, options.offset + options.limit);
    }

    async getMessageWithAttachments(messageId) {
        const message = await this.getMessage(messageId);
        if (!message) return null;

        if (message.hasAttachments) {
            message.attachments = await this.getAttachments(messageId);
        }

        return message;
    }

    async getMessage(messageId) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.stores.messages], 'readonly');
                const store = transaction.objectStore(this.stores.messages);
                const request = store.get(messageId);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } else {
            const messages = this.fallbackStorage.get('messages') || [];
            return messages.find(m => m.id === messageId) || null;
        }
    }

    async getAttachments(messageId) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.stores.attachments], 'readonly');
                const store = transaction.objectStore(this.stores.attachments);
                const index = store.index('messageId');
                const request = index.getAll(messageId);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } else {
            const attachments = this.fallbackStorage.get('attachments') || [];
            return attachments.filter(a => a.messageId === messageId);
        }
    }

    async getAnalysis(messageId, attachmentId = null) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.stores.analysis], 'readonly');
                const store = transaction.objectStore(this.stores.analysis);
                const index = store.index('messageId');
                const request = index.getAll(messageId);
                
                request.onsuccess = () => {
                    let results = request.result;
                    if (attachmentId) {
                        results = results.filter(a => a.attachmentId === attachmentId);
                    }
                    resolve(results);
                };
                request.onerror = () => reject(request.error);
            });
        } else {
            const analyses = this.fallbackStorage.get('analysis') || [];
            let results = analyses.filter(a => a.messageId === messageId);
            if (attachmentId) {
                results = results.filter(a => a.attachmentId === attachmentId);
            }
            return results;
        }
    }

    async deleteMessage(messageId) {
        try {
            if (this.db) {
                // Delete from IndexedDB
                await this.deleteMessageFromDB(messageId);
                await this.deleteAttachmentsFromDB(messageId);
                await this.deleteAnalysisFromDB(messageId);
            } else {
                // Delete from fallback storage
                this.deleteMessageFromFallback(messageId);
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting message:', error);
            return false;
        }
    }

    async deleteMessageFromDB(messageId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.messages], 'readwrite');
            const store = transaction.objectStore(this.stores.messages);
            const request = store.delete(messageId);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async deleteAttachmentsFromDB(messageId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.attachments], 'readwrite');
            const store = transaction.objectStore(this.stores.attachments);
            const index = store.index('messageId');
            const request = index.openCursor(messageId);
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    async deleteAnalysisFromDB(messageId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.analysis], 'readwrite');
            const store = transaction.objectStore(this.stores.analysis);
            const index = store.index('messageId');
            const request = index.openCursor(messageId);
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    deleteMessageFromFallback(messageId) {
        // Delete message
        let messages = this.fallbackStorage.get('messages') || [];
        messages = messages.filter(m => m.id !== messageId);
        this.fallbackStorage.set('messages', messages);

        // Delete attachments
        let attachments = this.fallbackStorage.get('attachments') || [];
        attachments = attachments.filter(a => a.messageId !== messageId);
        this.fallbackStorage.set('attachments', attachments);

        // Delete analysis
        let analyses = this.fallbackStorage.get('analysis') || [];
        analyses = analyses.filter(a => a.messageId !== messageId);
        this.fallbackStorage.set('analysis', analyses);

        this.saveFallbackToLocalStorage();
    }

    async clearChatHistory(sessionId = null) {
        try {
            if (this.db) {
                await this.clearChatHistoryFromDB(sessionId);
            } else {
                this.clearChatHistoryFromFallback(sessionId);
            }
            
            return true;
        } catch (error) {
            console.error('Error clearing chat history:', error);
            return false;
        }
    }

    async clearChatHistoryFromDB(sessionId) {
        const stores = [this.stores.messages, this.stores.attachments, this.stores.analysis];
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(stores, 'readwrite');
            let completed = 0;
            
            const checkComplete = () => {
                completed++;
                if (completed === stores.length) {
                    resolve();
                }
            };
            
            stores.forEach(storeName => {
                const store = transaction.objectStore(storeName);
                
                if (sessionId && storeName === this.stores.messages) {
                    // Clear specific session
                    const index = store.index('sessionId');
                    const request = index.openCursor(sessionId);
                    
                    request.onsuccess = (event) => {
                        const cursor = event.target.result;
                        if (cursor) {
                            cursor.delete();
                            cursor.continue();
                        } else {
                            checkComplete();
                        }
                    };
                } else if (!sessionId) {
                    // Clear all
                    const request = store.clear();
                    request.onsuccess = () => checkComplete();
                } else {
                    checkComplete();
                }
            });
        });
    }

    clearChatHistoryFromFallback(sessionId) {
        if (sessionId) {
            // Clear specific session
            let messages = this.fallbackStorage.get('messages') || [];
            const sessionMessages = messages.filter(m => m.sessionId === sessionId);
            const messageIds = sessionMessages.map(m => m.id);
            
            messages = messages.filter(m => m.sessionId !== sessionId);
            this.fallbackStorage.set('messages', messages);
            
            // Clear related attachments and analysis
            let attachments = this.fallbackStorage.get('attachments') || [];
            attachments = attachments.filter(a => !messageIds.includes(a.messageId));
            this.fallbackStorage.set('attachments', attachments);
            
            let analyses = this.fallbackStorage.get('analysis') || [];
            analyses = analyses.filter(a => !messageIds.includes(a.messageId));
            this.fallbackStorage.set('analysis', analyses);
        } else {
            // Clear all
            this.fallbackStorage.set('messages', []);
            this.fallbackStorage.set('attachments', []);
            this.fallbackStorage.set('analysis', []);
        }
        
        this.saveFallbackToLocalStorage();
    }

    async getStorageStats() {
        if (this.db) {
            return this.getStorageStatsFromDB();
        } else {
            return this.getStorageStatsFromFallback();
        }
    }

    async getStorageStatsFromDB() {
        const stores = [this.stores.messages, this.stores.attachments, this.stores.analysis];
        const stats = {};
        
        for (const storeName of stores) {
            stats[storeName] = await new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.count();
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }
        
        return stats;
    }

    getStorageStatsFromFallback() {
        return {
            [this.stores.messages]: (this.fallbackStorage.get('messages') || []).length,
            [this.stores.attachments]: (this.fallbackStorage.get('attachments') || []).length,
            [this.stores.analysis]: (this.fallbackStorage.get('analysis') || []).length
        };
    }

    saveFallbackToLocalStorage() {
        try {
            const data = {
                messages: this.fallbackStorage.get('messages') || [],
                attachments: this.fallbackStorage.get('attachments') || [],
                sessions: this.fallbackStorage.get('sessions') || [],
                analysis: this.fallbackStorage.get('analysis') || []
            };
            
            localStorage.setItem('eva-chat-data', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    async exportChatData(sessionId = null) {
        const messages = await this.getMessages({ 
            sessionId, 
            limit: 10000 // Get all messages
        });
        
        const exportData = {
            timestamp: new Date().toISOString(),
            sessionId: sessionId,
            messages: []
        };
        
        for (const message of messages) {
            const messageWithAttachments = await this.getMessageWithAttachments(message.id);
            const analysis = await this.getAnalysis(message.id);
            
            exportData.messages.push({
                ...messageWithAttachments,
                analysis: analysis
            });
        }
        
        return exportData;
    }

    async importChatData(data) {
        try {
            for (const message of data.messages) {
                await this.saveMessage(message);
                
                if (message.analysis) {
                    for (const analysis of message.analysis) {
                        await this.saveAnalysis(message.id, analysis.attachmentId, {
                            type: analysis.analysisType,
                            results: analysis.results,
                            confidence: analysis.confidence,
                            processingTime: analysis.processingTime,
                            metadata: analysis.metadata
                        });
                    }
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error importing chat data:', error);
            return false;
        }
    }
}