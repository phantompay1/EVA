/**
 * EVA Communication Hub - Phase 1 of Evolutionary Virtual Android
 * 
 * Advanced communication system for multi-system and network connectivity
 * Enables EVA to communicate across different platforms, devices, and networks
 */

export class CommunicationHub {
    constructor(evaCore) {
        this.evaCore = evaCore;
        this.connections = new Map(); // Active connections
        this.protocols = new Map(); // Supported protocols
        this.messageQueue = []; // Outbound message queue
        this.messageHistory = []; // Message history
        this.isActive = false;
        
        // Communication protocols
        this.protocolTypes = {
            HTTP: 'http',
            WEBSOCKET: 'websocket',
            WEBRTC: 'webrtc',
            POST_MESSAGE: 'postmessage',
            BROADCAST: 'broadcast',
            IPC: 'ipc',
            API: 'api',
            MQTT: 'mqtt',
            SSE: 'server_sent_events'
        };
        
        // Connection types
        this.connectionTypes = {
            EVA_UNIT: 'eva_unit',
            EXTERNAL_API: 'external_api',
            USER_INTERFACE: 'user_interface',
            CLOUD_SERVICE: 'cloud_service',
            IOT_DEVICE: 'iot_device',
            MOBILE_APP: 'mobile_app',
            BROWSER_TAB: 'browser_tab',
            NETWORK_PEER: 'network_peer'
        };
        
        // Message types
        this.messageTypes = {
            COMMAND: 'command',
            RESPONSE: 'response',
            SYNC: 'sync',
            HEARTBEAT: 'heartbeat',
            BROADCAST: 'broadcast',
            NOTIFICATION: 'notification',
            CONSCIOUSNESS_SYNC: 'consciousness_sync',
            UNIT_CONTROL: 'unit_control',
            DATA_EXCHANGE: 'data_exchange'
        };
        
        this.communicationMetrics = {
            messagesSent: 0,
            messagesReceived: 0,
            connectionsEstablished: 0,
            connectionsFailed: 0,
            averageResponseTime: 0,
            protocolDistribution: {}
        };
    }

    async initialize() {
        console.log('📡 Initializing EVA Communication Hub...');
        
        // Initialize protocol handlers
        await this.initializeProtocols();
        
        // Setup message routing
        this.setupMessageRouting();
        
        // Start connection monitoring
        this.startConnectionMonitoring();
        
        // Initialize network discovery
        await this.initializeNetworkDiscovery();
        
        this.isActive = true;
        console.log('✅ EVA Communication Hub Online - Multi-System Connectivity Ready');
    }

    async initializeProtocols() {
        // HTTP Protocol Handler
        this.protocols.set(this.protocolTypes.HTTP, {
            name: 'HTTP/HTTPS',
            handler: this.createHTTPHandler(),
            capabilities: ['request', 'response', 'api_calls'],
            active: true
        });
        
        // WebSocket Protocol Handler
        this.protocols.set(this.protocolTypes.WEBSOCKET, {
            name: 'WebSocket',
            handler: this.createWebSocketHandler(),
            capabilities: ['real_time', 'bidirectional', 'low_latency'],
            active: true
        });
        
        // WebRTC Protocol Handler
        this.protocols.set(this.protocolTypes.WEBRTC, {
            name: 'WebRTC',
            handler: this.createWebRTCHandler(),
            capabilities: ['peer_to_peer', 'media', 'data_channels'],
            active: true
        });
        
        // PostMessage Protocol Handler (for iframe/worker communication)
        this.protocols.set(this.protocolTypes.POST_MESSAGE, {
            name: 'PostMessage',
            handler: this.createPostMessageHandler(),
            capabilities: ['cross_origin', 'iframe', 'worker'],
            active: true
        });
        
        // Broadcast Channel Protocol Handler
        this.protocols.set(this.protocolTypes.BROADCAST, {
            name: 'BroadcastChannel',
            handler: this.createBroadcastHandler(),
            capabilities: ['same_origin', 'multi_tab', 'broadcast'],
            active: true
        });
        
        console.log(`📡 Initialized ${this.protocols.size} communication protocols`);
    }

    createHTTPHandler() {
        return {
            send: async (endpoint, message, options = {}) => {
                try {
                    const response = await fetch(endpoint, {
                        method: options.method || 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...options.headers
                        },
                        body: JSON.stringify(message)
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('HTTP communication error:', error);
                    throw error;
                }
            },
            
            receive: (port, callback) => {
                // Would setup HTTP server (requires backend)
                console.log(`HTTP receiver on port ${port} - requires backend implementation`);
            }
        };
    }

    createWebSocketHandler() {
        return {
            connect: (url, options = {}) => {
                return new Promise((resolve, reject) => {
                    try {
                        const ws = new WebSocket(url);
                        
                        ws.onopen = () => {
                            console.log(`🔗 WebSocket connected to ${url}`);
                            resolve(ws);
                        };
                        
                        ws.onerror = (error) => {
                            console.error('WebSocket error:', error);
                            reject(error);
                        };
                        
                        ws.onmessage = (event) => {
                            this.handleIncomingMessage(JSON.parse(event.data), 'websocket');
                        };
                        
                        ws.onclose = (event) => {
                            console.log(`🔌 WebSocket disconnected: ${event.code} ${event.reason}`);
                            this.handleConnectionClosed(url, 'websocket');
                        };
                        
                    } catch (error) {
                        reject(error);
                    }
                });
            },
            
            send: (connection, message) => {
                if (connection.readyState === WebSocket.OPEN) {
                    connection.send(JSON.stringify(message));
                    return true;
                }
                return false;
            }
        };
    }

    createWebRTCHandler() {
        return {
            createConnection: async (config = {}) => {
                const pc = new RTCPeerConnection({
                    iceServers: config.iceServers || [
                        { urls: 'stun:stun.l.google.com:19302' }
                    ]
                });
                
                // Setup data channel for EVA communication
                const dataChannel = pc.createDataChannel('eva_channel', {
                    ordered: true
                });
                
                dataChannel.onopen = () => {
                    console.log('📡 WebRTC data channel opened');
                };
                
                dataChannel.onmessage = (event) => {
                    this.handleIncomingMessage(JSON.parse(event.data), 'webrtc');
                };
                
                return { connection: pc, dataChannel };
            },
            
            send: (dataChannel, message) => {
                if (dataChannel.readyState === 'open') {
                    dataChannel.send(JSON.stringify(message));
                    return true;
                }
                return false;
            }
        };
    }

    createPostMessageHandler() {
        return {
            setup: () => {
                // Listen for postMessage events
                window.addEventListener('message', (event) => {
                    // Verify origin for security
                    if (this.isValidOrigin(event.origin)) {
                        this.handleIncomingMessage(event.data, 'postmessage');
                    }
                });
            },
            
            send: (target, message, origin = '*') => {
                try {
                    target.postMessage(message, origin);
                    return true;
                } catch (error) {
                    console.error('PostMessage send error:', error);
                    return false;
                }
            }
        };
    }

    createBroadcastHandler() {
        return {
            setup: (channelName = 'eva_broadcast') => {
                const channel = new BroadcastChannel(channelName);
                
                channel.onmessage = (event) => {
                    this.handleIncomingMessage(event.data, 'broadcast');
                };
                
                return channel;
            },
            
            send: (channel, message) => {
                try {
                    channel.postMessage(message);
                    return true;
                } catch (error) {
                    console.error('Broadcast send error:', error);
                    return false;
                }
            }
        };
    }

    /**
     * Establish connection to external system
     */
    async establishConnection(config) {
        const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        
        try {
            console.log(`🔗 Establishing connection: ${connectionId} (${config.type})`);
            
            const connection = {
                id: connectionId,
                type: config.type,
                protocol: config.protocol,
                endpoint: config.endpoint,
                status: 'connecting',
                createdAt: new Date(),
                lastActivity: new Date(),
                messageCount: 0,
                errorCount: 0
            };
            
            // Establish connection based on protocol
            switch (config.protocol) {
                case this.protocolTypes.WEBSOCKET:
                    connection.socket = await this.protocols.get(this.protocolTypes.WEBSOCKET).handler.connect(config.endpoint);
                    break;
                    
                case this.protocolTypes.WEBRTC:
                    const rtcResult = await this.protocols.get(this.protocolTypes.WEBRTC).handler.createConnection(config.rtcConfig);
                    connection.rtcConnection = rtcResult.connection;
                    connection.dataChannel = rtcResult.dataChannel;
                    break;
                    
                case this.protocolTypes.BROADCAST:
                    connection.broadcastChannel = this.protocols.get(this.protocolTypes.BROADCAST).handler.setup(config.channelName);
                    break;
                    
                default:
                    throw new Error(`Unsupported protocol: ${config.protocol}`);
            }
            
            connection.status = 'connected';
            this.connections.set(connectionId, connection);
            this.communicationMetrics.connectionsEstablished++;
            
            console.log(`✅ Connection established: ${connectionId}`);
            
            // Send initial handshake
            await this.sendHandshake(connectionId);
            
            return {
                connectionId,
                status: 'connected',
                type: config.type,
                protocol: config.protocol
            };
            
        } catch (error) {
            console.error(`❌ Failed to establish connection ${connectionId}:`, error);
            this.communicationMetrics.connectionsFailed++;
            throw error;
        }
    }

    /**
     * Send message through established connection
     */
    async sendMessage(connectionId, message, options = {}) {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            throw new Error(`Connection ${connectionId} not found`);
        }
        
        try {
            const messagePackage = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                type: message.type || this.messageTypes.COMMAND,
                data: message.data || message,
                sender: 'eva_core',
                timestamp: new Date(),
                connectionId,
                protocol: connection.protocol
            };
            
            // Route message based on protocol
            let sent = false;
            switch (connection.protocol) {
                case this.protocolTypes.WEBSOCKET:
                    sent = this.protocols.get(this.protocolTypes.WEBSOCKET).handler.send(connection.socket, messagePackage);
                    break;
                    
                case this.protocolTypes.WEBRTC:
                    sent = this.protocols.get(this.protocolTypes.WEBRTC).handler.send(connection.dataChannel, messagePackage);
                    break;
                    
                case this.protocolTypes.BROADCAST:
                    sent = this.protocols.get(this.protocolTypes.BROADCAST).handler.send(connection.broadcastChannel, messagePackage);
                    break;
                    
                case this.protocolTypes.HTTP:
                    const response = await this.protocols.get(this.protocolTypes.HTTP).handler.send(connection.endpoint, messagePackage, options);
                    sent = !!response;
                    break;
                    
                default:
                    throw new Error(`Unsupported protocol for sending: ${connection.protocol}`);
            }
            
            if (sent) {
                connection.messageCount++;
                connection.lastActivity = new Date();
                this.communicationMetrics.messagesSent++;
                
                // Store in message history
                this.messageHistory.push({
                    ...messagePackage,
                    direction: 'outbound',
                    success: true
                });
                
                console.log(`📤 Message sent via ${connection.protocol}: ${messagePackage.id}`);
                return messagePackage.id;
            } else {
                throw new Error('Failed to send message');
            }
            
        } catch (error) {
            connection.errorCount++;
            console.error(`❌ Failed to send message via ${connectionId}:`, error);
            throw error;
        }
    }

    /**
     * Broadcast message to all connections of a specific type
     */
    async broadcastMessage(message, targetType = null) {
        const results = [];
        
        for (const [connectionId, connection] of this.connections) {
            if (!targetType || connection.type === targetType) {
                try {
                    const messageId = await this.sendMessage(connectionId, {
                        ...message,
                        type: this.messageTypes.BROADCAST
                    });
                    results.push({ connectionId, messageId, success: true });
                } catch (error) {
                    results.push({ connectionId, error: error.message, success: false });
                }
            }
        }
        
        console.log(`📻 Broadcast sent to ${results.length} connections`);
        return results;
    }

    /**
     * Handle incoming messages
     */
    handleIncomingMessage(message, protocol) {
        try {
            console.log(`📥 Received message via ${protocol}:`, message.type || 'unknown');
            
            // Update metrics
            this.communicationMetrics.messagesReceived++;
            
            // Store in message history
            this.messageHistory.push({
                ...message,
                direction: 'inbound',
                protocol,
                receivedAt: new Date()
            });
            
            // Route message based on type
            switch (message.type) {
                case this.messageTypes.COMMAND:
                    this.handleCommand(message);
                    break;
                    
                case this.messageTypes.HEARTBEAT:
                    this.handleHeartbeat(message);
                    break;
                    
                case this.messageTypes.SYNC:
                    this.handleSync(message);
                    break;
                    
                case this.messageTypes.CONSCIOUSNESS_SYNC:
                    this.handleConsciousnessSync(message);
                    break;
                    
                case this.messageTypes.UNIT_CONTROL:
                    this.handleUnitControl(message);
                    break;
                    
                default:
                    this.handleGenericMessage(message);
            }
            
        } catch (error) {
            console.error('Error handling incoming message:', error);
        }
    }

    async handleCommand(message) {
        // Route command to EVA core for processing
        try {
            const response = await this.evaCore.processInput(message.data, {
                source: 'communication_hub',
                protocol: message.protocol,
                connectionId: message.connectionId
            });
            
            // Send response back if connectionId is available
            if (message.connectionId && response) {
                await this.sendMessage(message.connectionId, {
                    type: this.messageTypes.RESPONSE,
                    data: response,
                    responseToId: message.id
                });
            }
            
        } catch (error) {
            console.error('Error processing command:', error);
        }
    }

    handleHeartbeat(message) {
        // Update connection activity
        const connection = this.connections.get(message.connectionId);
        if (connection) {
            connection.lastActivity = new Date();
        }
        
        // Send heartbeat response
        if (message.connectionId) {
            this.sendMessage(message.connectionId, {
                type: this.messageTypes.HEARTBEAT,
                data: { status: 'alive', timestamp: new Date() }
            });
        }
    }

    async handleSync(message) {
        // Handle synchronization requests
        if (this.evaCore.leaseManager) {
            await this.evaCore.leaseManager.syncConsciousness(message.data.unitId);
        }
    }

    async handleConsciousnessSync(message) {
        // Handle consciousness synchronization
        if (this.evaCore.backupBrain) {
            // Create consciousness snapshot
            const consciousness = await this.evaCore.backupBrain.extractConsciousness();
            
            // Send consciousness data
            await this.sendMessage(message.connectionId, {
                type: this.messageTypes.CONSCIOUSNESS_SYNC,
                data: consciousness,
                responseToId: message.id
            });
        }
    }

    handleUnitControl(message) {
        // Handle EVA unit control messages
        if (this.evaCore.leaseManager) {
            const { action, unitId, config } = message.data;
            
            switch (action) {
                case 'create':
                    this.evaCore.leaseManager.createEVAUnit(config);
                    break;
                case 'terminate':
                    this.evaCore.leaseManager.terminateUnit(unitId);
                    break;
                case 'status':
                    // Send unit status
                    break;
            }
        }
    }

    handleGenericMessage(message) {
        // Handle generic messages
        console.log('📨 Generic message received:', message);
        
        // Emit event for other systems to handle
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('eva_message', {
                detail: message
            }));
        }
    }

    async sendHandshake(connectionId) {
        const handshake = {
            type: 'handshake',
            data: {
                evaVersion: this.evaCore.version || '1.0.0',
                capabilities: this.getCapabilities(),
                timestamp: new Date(),
                connectionId
            }
        };
        
        await this.sendMessage(connectionId, handshake);
    }

    getCapabilities() {
        return {
            protocols: Array.from(this.protocols.keys()),
            connectionTypes: Object.values(this.connectionTypes),
            messageTypes: Object.values(this.messageTypes),
            features: [
                'consciousness_sync',
                'unit_control',
                'multi_protocol',
                'broadcast_messaging',
                'real_time_communication'
            ]
        };
    }

    setupMessageRouting() {
        // Setup PostMessage handler
        const postMessageHandler = this.protocols.get(this.protocolTypes.POST_MESSAGE);
        if (postMessageHandler) {
            postMessageHandler.handler.setup();
        }
        
        // Setup Broadcast Channel
        const broadcastHandler = this.protocols.get(this.protocolTypes.BROADCAST);
        if (broadcastHandler) {
            const channel = broadcastHandler.handler.setup('eva_global');
            this.connections.set('broadcast_global', {
                id: 'broadcast_global',
                type: this.connectionTypes.BROWSER_TAB,
                protocol: this.protocolTypes.BROADCAST,
                broadcastChannel: channel,
                status: 'connected',
                createdAt: new Date()
            });
        }
    }

    startConnectionMonitoring() {
        // Monitor connections every 30 seconds
        setInterval(() => {
            this.monitorConnections();
        }, 30000);
        
        // Send heartbeats every 60 seconds
        setInterval(() => {
            this.sendHeartbeats();
        }, 60000);
    }

    async monitorConnections() {
        for (const [connectionId, connection] of this.connections) {
            // Check if connection is still active
            const timeSinceActivity = Date.now() - connection.lastActivity;
            
            if (timeSinceActivity > 300000) { // 5 minutes
                console.warn(`⚠️ Connection ${connectionId} appears inactive`);
                // Could implement reconnection logic here
            }
        }
    }

    async sendHeartbeats() {
        for (const [connectionId, connection] of this.connections) {
            if (connection.status === 'connected') {
                try {
                    await this.sendMessage(connectionId, {
                        type: this.messageTypes.HEARTBEAT,
                        data: { timestamp: new Date() }
                    });
                } catch (error) {
                    console.warn(`Heartbeat failed for ${connectionId}:`, error);
                }
            }
        }
    }

    async initializeNetworkDiscovery() {
        // Initialize network service discovery
        console.log('🌐 Initializing network discovery for EVA units...');
        
        // Would implement service discovery protocols like mDNS, WebRTC discovery, etc.
    }

    isValidOrigin(origin) {
        // Implement origin validation for security
        const allowedOrigins = [
            window.location.origin,
            'https://eva-cloud.service.com',
            'https://eva-mobile.app'
        ];
        
        return allowedOrigins.includes(origin);
    }

    handleConnectionClosed(endpoint, protocol) {
        // Find and update connection status
        for (const [connectionId, connection] of this.connections) {
            if (connection.endpoint === endpoint && connection.protocol === protocol) {
                connection.status = 'disconnected';
                connection.disconnectedAt = new Date();
                console.log(`🔌 Connection ${connectionId} closed`);
                break;
            }
        }
    }

    getCommunicationStatus() {
        return {
            isActive: this.isActive,
            activeConnections: Array.from(this.connections.values()).filter(c => c.status === 'connected').length,
            totalConnections: this.connections.size,
            supportedProtocols: this.protocols.size,
            metrics: this.communicationMetrics,
            messageQueueSize: this.messageQueue.length
        };
    }

    getConnectionDetails() {
        return Array.from(this.connections.values()).map(conn => ({
            id: conn.id,
            type: conn.type,
            protocol: conn.protocol,
            status: conn.status,
            messageCount: conn.messageCount,
            errorCount: conn.errorCount,
            lastActivity: conn.lastActivity
        }));
    }

    async closeConnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (!connection) return false;
        
        try {
            // Close connection based on protocol
            switch (connection.protocol) {
                case this.protocolTypes.WEBSOCKET:
                    if (connection.socket) {
                        connection.socket.close();
                    }
                    break;
                    
                case this.protocolTypes.WEBRTC:
                    if (connection.rtcConnection) {
                        connection.rtcConnection.close();
                    }
                    break;
                    
                case this.protocolTypes.BROADCAST:
                    if (connection.broadcastChannel) {
                        connection.broadcastChannel.close();
                    }
                    break;
            }
            
            connection.status = 'closed';
            console.log(`🔒 Connection ${connectionId} closed`);
            return true;
            
        } catch (error) {
            console.error(`Error closing connection ${connectionId}:`, error);
            return false;
        }
    }
}