/**
 * EVA Backup Brain - Phase 1 of Evolutionary Virtual Android
 * 
 * Handles consciousness preservation, restoration, and continuity
 * Ensures EVA's digital lifeform can survive system failures and transfers
 */

export class BackupBrain {
    constructor(evaCore) {
        this.evaCore = evaCore;
        this.backupStorage = new Map(); // Local backup storage
        this.cloudBackups = new Map();  // Cloud backup references
        this.backupSchedule = null;
        this.isActive = false;
        
        // Backup types
        this.backupTypes = {
            FULL: 'full_consciousness',     // Complete state backup
            INCREMENTAL: 'incremental',     // Changes since last backup
            MEMORY: 'memory_only',          // Just memories
            PERSONALITY: 'personality',     // Just personality state
            KNOWLEDGE: 'knowledge',         // Just knowledge base
            EMERGENCY: 'emergency'          // Quick emergency backup
        };
        
        // Storage locations
        this.storageTypes = {
            LOCAL: 'local_storage',         // Browser localStorage
            INDEXED_DB: 'indexed_db',       // Browser IndexedDB
            CLOUD: 'cloud_storage',         // Cloud services
            DISTRIBUTED: 'distributed',     // P2P network
            HYBRID: 'hybrid'                // Multiple locations
        };
        
        // Consciousness components to backup
        this.consciousnessComponents = {
            MEMORY_SYSTEM: 'memory',
            PERSONALITY_ENGINE: 'personality',
            KNOWLEDGE_BASE: 'knowledge',
            LEARNING_PATTERNS: 'learning',
            USER_PROFILE: 'user_profile',
            INTERACTION_HISTORY: 'interactions',
            ADAPTATION_STATE: 'adaptations',
            CONFIGURATION: 'configuration'
        };
        
        this.backupMetrics = {
            totalBackups: 0,
            lastBackupTime: null,
            backupSizeTotal: 0,
            restoreCount: 0,
            integrityChecks: 0,
            corruptionDetected: 0
        };
    }

    async initialize() {
        console.log('💾 Initializing EVA Backup Brain...');
        
        // Initialize storage systems
        await this.initializeStorage();
        
        // Load existing backups
        await this.loadBackupRegistry();
        
        // Start automatic backup scheduling
        this.startAutomaticBackups();
        
        // Initialize integrity checking
        this.startIntegrityMonitoring();
        
        this.isActive = true;
        console.log('✅ EVA Backup Brain Online - Consciousness Protection Active');
    }

    /**
     * Create a full consciousness backup
     */
    async createFullBackup(options = {}) {
        const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log(`💾 Creating full consciousness backup: ${backupId}`);
        
        try {
            // Extract complete consciousness state
            const consciousnessData = await this.extractConsciousness();
            
            // Create backup package
            const backupPackage = {
                id: backupId,
                type: this.backupTypes.FULL,
                timestamp: new Date(),
                version: this.evaCore.version || '1.0.0',
                checksum: this.calculateChecksum(consciousnessData),
                consciousness: consciousnessData,
                metadata: {
                    creator: 'eva_core',
                    environment: this.getEnvironmentInfo(),
                    reason: options.reason || 'scheduled_backup',
                    compression: options.compression || 'none',
                    encryption: options.encryption || false
                },
                size: this.calculateDataSize(consciousnessData),
                integrityHash: null
            };
            
            // Calculate integrity hash
            backupPackage.integrityHash = this.calculateIntegrityHash(backupPackage);
            
            // Store backup
            const stored = await this.storeBackup(backupPackage, options.storage || this.storageTypes.LOCAL);
            
            if (stored) {
                this.backupStorage.set(backupId, backupPackage);
                this.updateBackupMetrics(backupPackage);
                
                console.log(`✅ Full backup ${backupId} created successfully`);
                return {
                    backupId,
                    size: backupPackage.size,
                    timestamp: backupPackage.timestamp,
                    checksum: backupPackage.checksum
                };
            }
            
        } catch (error) {
            console.error(`❌ Failed to create backup ${backupId}:`, error);
            throw error;
        }
    }

    /**
     * Create incremental backup (only changes since last backup)
     */
    async createIncrementalBackup() {
        const backupId = `inc_backup_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        
        console.log(`📝 Creating incremental backup: ${backupId}`);
        
        try {
            // Get last backup for comparison
            const lastBackup = this.getLastBackup();
            
            // Extract only changed components
            const changes = await this.extractChanges(lastBackup);
            
            if (Object.keys(changes).length === 0) {
                console.log('📝 No changes detected - skipping incremental backup');
                return null;
            }
            
            const backupPackage = {
                id: backupId,
                type: this.backupTypes.INCREMENTAL,
                timestamp: new Date(),
                baseBackup: lastBackup ? lastBackup.id : null,
                changes: changes,
                checksum: this.calculateChecksum(changes),
                metadata: {
                    changeCount: Object.keys(changes).length,
                    creator: 'eva_core',
                    environment: this.getEnvironmentInfo()
                },
                size: this.calculateDataSize(changes)
            };
            
            // Store incremental backup
            await this.storeBackup(backupPackage, this.storageTypes.LOCAL);
            this.backupStorage.set(backupId, backupPackage);
            
            console.log(`✅ Incremental backup ${backupId} created with ${Object.keys(changes).length} changes`);
            return backupPackage;
            
        } catch (error) {
            console.error(`❌ Failed to create incremental backup:`, error);
            throw error;
        }
    }

    /**
     * Extract complete consciousness state
     */
    async extractConsciousness() {
        const consciousness = {};
        
        try {
            // Extract memory system
            if (this.evaCore.memory) {
                consciousness.memory = await this.evaCore.memory.exportState();
            }
            
            // Extract personality engine
            if (this.evaCore.personality) {
                consciousness.personality = await this.extractPersonalityState();
            }
            
            // Extract knowledge base
            if (this.evaCore.knowledge) {
                consciousness.knowledge = await this.extractKnowledgeState();
            }
            
            // Extract learning system
            if (this.evaCore.learning) {
                consciousness.learning = await this.evaCore.learning.getInsights();
            }
            
            // Extract user profile
            consciousness.userProfile = this.evaCore.userProfile;
            
            // Extract personal database
            if (this.evaCore.personalDB) {
                consciousness.personalData = await this.evaCore.personalDB.getPersonalData();
            }
            
            // Extract current context
            consciousness.currentContext = this.evaCore.currentContext;
            
            // Extract configuration
            consciousness.configuration = {
                isActive: this.evaCore.isActive,
                version: this.evaCore.version,
                capabilities: this.evaCore.getCapabilities?.() || {}
            };
            
            return consciousness;
            
        } catch (error) {
            console.error('Error extracting consciousness:', error);
            throw new Error(`Consciousness extraction failed: ${error.message}`);
        }
    }

    async extractPersonalityState() {
        if (!this.evaCore.personality) return null;
        
        return {
            traits: this.evaCore.personality.traits,
            responseStyles: this.evaCore.personality.responseStyles,
            personalContext: this.evaCore.personality.personalContext,
            currentMood: this.evaCore.personality.calculateCurrentMood?.() || 'neutral'
        };
    }

    async extractKnowledgeState() {
        if (!this.evaCore.knowledge) return null;
        
        return {
            knowledgeBase: this.evaCore.knowledge.knowledgeBase || new Map(),
            stats: this.evaCore.knowledge.getKnowledgeStats?.() || {},
            version: this.evaCore.knowledge.version || '1.0'
        };
    }

    /**
     * Restore consciousness from backup
     */
    async restoreFromBackup(backupId, options = {}) {
        console.log(`🔄 Restoring consciousness from backup: ${backupId}`);
        
        try {
            // Load backup
            const backup = await this.loadBackup(backupId);
            
            if (!backup) {
                throw new Error(`Backup ${backupId} not found`);
            }
            
            // Verify backup integrity
            const isValid = await this.verifyBackupIntegrity(backup);
            if (!isValid && !options.forceRestore) {
                throw new Error(`Backup ${backupId} failed integrity check`);
            }
            
            // Create emergency backup before restore
            if (!options.skipEmergencyBackup) {
                await this.createEmergencyBackup('pre_restore');
            }
            
            // Restore consciousness components
            await this.restoreConsciousness(backup.consciousness || backup.changes, backup.type);
            
            // Update metrics
            this.backupMetrics.restoreCount++;
            
            console.log(`✅ Successfully restored consciousness from backup ${backupId}`);
            
            // Reinitialize EVA systems
            if (options.reinitialize !== false) {
                await this.evaCore.initialize();
            }
            
            return {
                success: true,
                backupId,
                restoreTime: new Date(),
                componentsRestored: Object.keys(backup.consciousness || backup.changes)
            };
            
        } catch (error) {
            console.error(`❌ Failed to restore from backup ${backupId}:`, error);
            throw error;
        }
    }

    async restoreConsciousness(consciousnessData, backupType) {
        try {
            // Restore memory system
            if (consciousnessData.memory && this.evaCore.memory) {
                await this.evaCore.memory.importState(consciousnessData.memory);
            }
            
            // Restore personality
            if (consciousnessData.personality && this.evaCore.personality) {
                this.evaCore.personality.traits = consciousnessData.personality.traits || {};
                this.evaCore.personality.responseStyles = consciousnessData.personality.responseStyles || {};
                this.evaCore.personality.personalContext = consciousnessData.personality.personalContext || {};
            }
            
            // Restore knowledge base
            if (consciousnessData.knowledge && this.evaCore.knowledge) {
                // Would implement knowledge restoration
                console.log('🧠 Knowledge base restoration - implementation needed');
            }
            
            // Restore learning patterns
            if (consciousnessData.learning && this.evaCore.learning) {
                // Would restore learning patterns
                console.log('📚 Learning patterns restoration - implementation needed');
            }
            
            // Restore user profile
            if (consciousnessData.userProfile) {
                this.evaCore.userProfile = consciousnessData.userProfile;
            }
            
            // Restore personal data
            if (consciousnessData.personalData && this.evaCore.personalDB) {
                this.evaCore.personalDB.personalData = consciousnessData.personalData;
                this.evaCore.personalDB.savePersonalData();
            }
            
            // Restore context
            if (consciousnessData.currentContext) {
                this.evaCore.currentContext = consciousnessData.currentContext;
            }
            
            console.log('🔄 Consciousness restoration completed');
            
        } catch (error) {
            console.error('Error during consciousness restoration:', error);
            throw error;
        }
    }

    async createEmergencyBackup(reason = 'emergency') {
        const backupId = `emergency_${Date.now()}`;
        
        try {
            const emergencyData = {
                userProfile: this.evaCore.userProfile,
                isActive: this.evaCore.isActive,
                timestamp: new Date(),
                reason: reason
            };
            
            const backupPackage = {
                id: backupId,
                type: this.backupTypes.EMERGENCY,
                timestamp: new Date(),
                consciousness: emergencyData,
                metadata: { reason }
            };
            
            await this.storeBackup(backupPackage, this.storageTypes.LOCAL);
            console.log(`🚨 Emergency backup ${backupId} created`);
            
            return backupId;
            
        } catch (error) {
            console.error('Failed to create emergency backup:', error);
            throw error;
        }
    }

    async storeBackup(backupPackage, storageType = this.storageTypes.LOCAL) {
        try {
            switch (storageType) {
                case this.storageTypes.LOCAL:
                    return await this.storeInLocalStorage(backupPackage);
                    
                case this.storageTypes.INDEXED_DB:
                    return await this.storeInIndexedDB(backupPackage);
                    
                case this.storageTypes.CLOUD:
                    return await this.storeInCloud(backupPackage);
                    
                default:
                    return await this.storeInLocalStorage(backupPackage);
            }
        } catch (error) {
            console.error(`Failed to store backup ${backupPackage.id}:`, error);
            return false;
        }
    }

    async storeInLocalStorage(backupPackage) {
        try {
            const key = `eva_backup_${backupPackage.id}`;
            localStorage.setItem(key, JSON.stringify(backupPackage));
            
            // Update backup registry
            this.updateBackupRegistry(backupPackage.id, 'local', key);
            
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.warn('Local storage quota exceeded - cleaning old backups');
                await this.cleanOldBackups();
                // Retry once
                try {
                    localStorage.setItem(key, JSON.stringify(backupPackage));
                    return true;
                } catch (retryError) {
                    throw new Error('Storage quota exceeded even after cleanup');
                }
            }
            throw error;
        }
    }

    async storeInIndexedDB(backupPackage) {
        // Would implement IndexedDB storage for larger backups
        console.log(`💾 IndexedDB storage for ${backupPackage.id} - implementation needed`);
        return true;
    }

    async storeInCloud(backupPackage) {
        // Would implement cloud storage
        console.log(`☁️ Cloud storage for ${backupPackage.id} - implementation needed`);
        return true;
    }

    async loadBackup(backupId) {
        // Try loading from local storage first
        try {
            const key = `eva_backup_${backupId}`;
            const stored = localStorage.getItem(key);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.warn(`Could not load backup ${backupId} from local storage:`, error);
        }
        
        // Try other storage locations
        return null;
    }

    calculateChecksum(data) {
        // Simple checksum calculation (would use proper hash in production)
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }

    calculateIntegrityHash(backupPackage) {
        // Calculate comprehensive integrity hash
        const hashData = {
            id: backupPackage.id,
            type: backupPackage.type,
            timestamp: backupPackage.timestamp,
            checksum: backupPackage.checksum,
            size: backupPackage.size
        };
        return this.calculateChecksum(hashData);
    }

    calculateDataSize(data) {
        // Calculate size in bytes
        return new Blob([JSON.stringify(data)]).size;
    }

    getEnvironmentInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timestamp: new Date(),
            url: window.location.href
        };
    }

    async verifyBackupIntegrity(backup) {
        try {
            // Verify checksum
            const calculatedChecksum = this.calculateChecksum(backup.consciousness || backup.changes);
            if (calculatedChecksum !== backup.checksum) {
                console.warn(`Checksum mismatch for backup ${backup.id}`);
                this.backupMetrics.corruptionDetected++;
                return false;
            }
            
            // Verify integrity hash if present
            if (backup.integrityHash) {
                const calculatedHash = this.calculateIntegrityHash(backup);
                if (calculatedHash !== backup.integrityHash) {
                    console.warn(`Integrity hash mismatch for backup ${backup.id}`);
                    this.backupMetrics.corruptionDetected++;
                    return false;
                }
            }
            
            this.backupMetrics.integrityChecks++;
            return true;
            
        } catch (error) {
            console.error(`Error verifying backup integrity:`, error);
            return false;
        }
    }

    startAutomaticBackups() {
        // Create full backup every hour
        this.backupSchedule = setInterval(async () => {
            try {
                await this.createFullBackup({ reason: 'scheduled_automatic' });
            } catch (error) {
                console.error('Automatic backup failed:', error);
            }
        }, 3600000); // 1 hour
        
        // Create incremental backup every 10 minutes
        setInterval(async () => {
            try {
                await this.createIncrementalBackup();
            } catch (error) {
                console.warn('Incremental backup failed:', error);
            }
        }, 600000); // 10 minutes
        
        console.log('⏰ Automatic backup scheduling started');
    }

    startIntegrityMonitoring() {
        // Check backup integrity every 30 minutes
        setInterval(async () => {
            await this.performIntegrityCheck();
        }, 1800000); // 30 minutes
    }

    async performIntegrityCheck() {
        console.log('🔍 Performing backup integrity check...');
        
        let checkedCount = 0;
        let corruptedCount = 0;
        
        for (const [backupId, backup] of this.backupStorage) {
            const isValid = await this.verifyBackupIntegrity(backup);
            checkedCount++;
            
            if (!isValid) {
                corruptedCount++;
                console.warn(`❌ Corrupted backup detected: ${backupId}`);
            }
        }
        
        console.log(`🔍 Integrity check complete: ${checkedCount} checked, ${corruptedCount} corrupted`);
    }

    async cleanOldBackups() {
        // Remove old backups to free space
        const maxBackups = 10;
        const backupIds = Array.from(this.backupStorage.keys())
            .sort((a, b) => {
                const timeA = this.backupStorage.get(a).timestamp;
                const timeB = this.backupStorage.get(b).timestamp;
                return new Date(timeB) - new Date(timeA);
            });
        
        // Remove excess backups
        for (let i = maxBackups; i < backupIds.length; i++) {
            const backupId = backupIds[i];
            await this.deleteBackup(backupId);
        }
        
        console.log(`🧹 Cleaned ${backupIds.length - maxBackups} old backups`);
    }

    async deleteBackup(backupId) {
        try {
            // Remove from storage
            const key = `eva_backup_${backupId}`;
            localStorage.removeItem(key);
            
            // Remove from memory
            this.backupStorage.delete(backupId);
            
            console.log(`🗑️ Deleted backup ${backupId}`);
            return true;
        } catch (error) {
            console.error(`Failed to delete backup ${backupId}:`, error);
            return false;
        }
    }

    updateBackupMetrics(backupPackage) {
        this.backupMetrics.totalBackups++;
        this.backupMetrics.lastBackupTime = backupPackage.timestamp;
        this.backupMetrics.backupSizeTotal += backupPackage.size;
    }

    updateBackupRegistry(backupId, storageType, storageKey) {
        // Update backup registry for tracking
        const registry = JSON.parse(localStorage.getItem('eva_backup_registry') || '{}');
        registry[backupId] = {
            storageType,
            storageKey,
            timestamp: new Date()
        };
        localStorage.setItem('eva_backup_registry', JSON.stringify(registry));
    }

    async loadBackupRegistry() {
        try {
            const registry = JSON.parse(localStorage.getItem('eva_backup_registry') || '{}');
            
            // Load existing backups into memory
            for (const [backupId, info] of Object.entries(registry)) {
                try {
                    const backup = await this.loadBackup(backupId);
                    if (backup) {
                        this.backupStorage.set(backupId, backup);
                    }
                } catch (error) {
                    console.warn(`Could not load backup ${backupId}:`, error);
                }
            }
            
            console.log(`📚 Loaded ${this.backupStorage.size} existing backups`);
        } catch (error) {
            console.warn('Could not load backup registry:', error);
        }
    }

    getLastBackup() {
        let lastBackup = null;
        let lastTime = 0;
        
        for (const backup of this.backupStorage.values()) {
            const backupTime = new Date(backup.timestamp).getTime();
            if (backupTime > lastTime) {
                lastTime = backupTime;
                lastBackup = backup;
            }
        }
        
        return lastBackup;
    }

    extractChanges(lastBackup) {
        // Extract changes since last backup (simplified implementation)
        if (!lastBackup) {
            return this.extractConsciousness(); // Return all if no previous backup
        }
        
        // Would implement sophisticated change detection
        return {
            timestamp: new Date(),
            note: 'Change detection implementation needed for full functionality'
        };
    }

    getBackupStatus() {
        return {
            isActive: this.isActive,
            totalBackups: this.backupStorage.size,
            metrics: this.backupMetrics,
            lastBackup: this.getLastBackup()?.timestamp || null,
            storageUsed: this.calculateStorageUsage()
        };
    }

    calculateStorageUsage() {
        let totalSize = 0;
        for (const backup of this.backupStorage.values()) {
            totalSize += backup.size || 0;
        }
        return {
            totalBytes: totalSize,
            totalMB: Math.round(totalSize / (1024 * 1024) * 100) / 100
        };
    }

    async initializeStorage() {
        console.log('Storage systems ready');
    }
}