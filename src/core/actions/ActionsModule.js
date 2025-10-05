/**
 * EVA Actions Module
 * Handles command execution, goal prioritization, and environmental interaction
 * Part of EVA's Foundational Knowledge Modules
 */

const EventEmitter = require('events');
const { spawn } = require('child_process');

/**
 * Command Execution Engine
 */
class CommandExecutionEngine {
    constructor() {
        this.commandRegistry = new Map();
        this.executionQueue = [];
        this.activeCommands = new Map();
        this.initialized = false;
        this.metrics = { commandsExecuted: 0, successRate: 0, averageExecutionTime: 0 };
    }

    async initialize() {
        console.log('⚙️ Initializing Command Execution Engine...');
        await this.registerCommands();
        this.initialized = true;
        console.log('✅ Command Execution Engine initialized');
    }

    async registerCommands() {
        // System commands
        this.commandRegistry.set('system', {
            'get_status': { handler: this.getSystemStatus, safety: 'safe', timeout: 5000 },
            'list_processes': { handler: this.listProcesses, safety: 'safe', timeout: 10000 },
            'check_memory': { handler: this.checkMemory, safety: 'safe', timeout: 5000 }
        });

        // File operations
        this.commandRegistry.set('file', {
            'read_file': { handler: this.readFile, safety: 'safe', timeout: 15000 },
            'list_directory': { handler: this.listDirectory, safety: 'safe', timeout: 10000 },
            'check_permissions': { handler: this.checkPermissions, safety: 'safe', timeout: 5000 }
        });

        // Network operations
        this.commandRegistry.set('network', {
            'ping_host': { handler: this.pingHost, safety: 'safe', timeout: 30000 },
            'check_connection': { handler: this.checkConnection, safety: 'safe', timeout: 15000 }
        });

        // Application commands
        this.commandRegistry.set('application', {
            'start_service': { handler: this.startService, safety: 'caution', timeout: 60000 },
            'stop_service': { handler: this.stopService, safety: 'caution', timeout: 30000 }
        });

        console.log(`🛠️ Registered ${Array.from(this.commandRegistry.values()).reduce((sum, cat) => sum + Object.keys(cat).length, 0)} commands`);
    }

    async executeCommand(category, command, parameters = {}, context = {}) {
        const startTime = Date.now();
        const commandId = `${category}_${command}_${Date.now()}`;

        try {
            console.log(`🚀 Executing command: ${category}.${command}`);
            
            const commandDef = this.commandRegistry.get(category)?.[command];
            if (!commandDef) {
                throw new Error(`Command not found: ${category}.${command}`);
            }

            // Safety check
            if (commandDef.safety === 'dangerous' && !context.override_safety) {
                throw new Error(`Command ${category}.${command} requires safety override`);
            }

            // Add to active commands
            this.activeCommands.set(commandId, {
                category, command, parameters, startTime, status: 'running'
            });

            // Execute with timeout
            const result = await Promise.race([
                commandDef.handler.call(this, parameters, context),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Command timeout')), commandDef.timeout)
                )
            ]);

            // Update metrics
            const executionTime = Date.now() - startTime;
            this.updateMetrics(true, executionTime);
            this.activeCommands.delete(commandId);

            console.log(`✅ Command completed: ${category}.${command} (${executionTime}ms)`);
            return { success: true, result, executionTime, commandId };

        } catch (error) {
            console.error(`❌ Command failed: ${category}.${command} - ${error.message}`);
            this.updateMetrics(false, Date.now() - startTime);
            this.activeCommands.delete(commandId);
            return { success: false, error: error.message, commandId };
        }
    }

    // Command handlers
    async getSystemStatus(params, context) {
        return {
            platform: process.platform,
            nodeVersion: process.version,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            timestamp: Date.now()
        };
    }

    async listProcesses(params, context) {
        return new Promise((resolve, reject) => {
            const cmd = process.platform === 'win32' ? 'tasklist' : 'ps aux';
            const child = spawn(cmd, { shell: true });
            let output = '';
            
            child.stdout.on('data', (data) => output += data.toString());
            child.on('close', (code) => {
                resolve({ processes: output.split('\n').slice(0, 10), totalLines: output.split('\n').length });
            });
            child.on('error', reject);
        });
    }

    async checkMemory(params, context) {
        const usage = process.memoryUsage();
        return {
            heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
            external: Math.round(usage.external / 1024 / 1024),
            rss: Math.round(usage.rss / 1024 / 1024)
        };
    }

    updateMetrics(success, executionTime) {
        this.metrics.commandsExecuted++;
        this.metrics.averageExecutionTime = (this.metrics.averageExecutionTime + executionTime) / 2;
        
        if (success) {
            const successes = Math.floor(this.metrics.successRate * (this.metrics.commandsExecuted - 1));
            this.metrics.successRate = (successes + 1) / this.metrics.commandsExecuted;
        } else {
            const successes = Math.floor(this.metrics.successRate * (this.metrics.commandsExecuted - 1));
            this.metrics.successRate = successes / this.metrics.commandsExecuted;
        }
    }
}

/**
 * Goal Prioritization System
 */
class GoalPrioritizationSystem {
    constructor() {
        this.goals = new Map();
        this.priorityQueue = [];
        this.priorityFactors = new Map();
        this.initialized = false;
        this.metrics = { goalsProcessed: 0, averagePriority: 0, completionRate: 0 };
    }

    async initialize() {
        console.log('🎯 Initializing Goal Prioritization System...');
        await this.setupPriorityFactors();
        this.initialized = true;
        console.log('✅ Goal Prioritization System initialized');
    }

    async setupPriorityFactors() {
        this.priorityFactors.set('urgency', {
            weight: 0.4,
            calculator: (goal, context) => {
                if (goal.deadline && goal.deadline < Date.now() + 3600000) return 1.0; // 1 hour
                if (goal.deadline && goal.deadline < Date.now() + 86400000) return 0.7; // 1 day
                if (goal.urgent) return 0.8;
                return 0.3;
            }
        });

        this.priorityFactors.set('importance', {
            weight: 0.3,
            calculator: (goal, context) => {
                if (goal.critical) return 1.0;
                if (goal.important) return 0.8;
                if (goal.userRequested) return 0.6;
                return 0.4;
            }
        });

        this.priorityFactors.set('ethics', {
            weight: 0.2,
            calculator: (goal, context) => {
                if (goal.ethicalRisk === 'high') return 0.1;
                if (goal.ethicalRisk === 'medium') return 0.5;
                if (goal.beneficial) return 0.9;
                return 0.7;
            }
        });

        this.priorityFactors.set('resources', {
            weight: 0.1,
            calculator: (goal, context) => {
                const available = context.availableResources || 1.0;
                const required = goal.resourceRequirement || 0.5;
                return Math.min(available / required, 1.0);
            }
        });

        console.log(`⚖️ Setup ${this.priorityFactors.size} priority factors`);
    }

    async addGoal(goalData, context = {}) {
        try {
            const goalId = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const goal = {
                id: goalId,
                ...goalData,
                status: 'pending',
                createdAt: Date.now(),
                priority: 0
            };

            // Calculate priority
            goal.priority = await this.calculatePriority(goal, context);
            
            // Add to goals map and priority queue
            this.goals.set(goalId, goal);
            this.insertIntoPriorityQueue(goal);

            console.log(`🎯 Added goal: ${goal.name} (Priority: ${goal.priority.toFixed(2)})`);
            return { success: true, goalId, priority: goal.priority };

        } catch (error) {
            console.error('❌ Error adding goal:', error);
            return { success: false, error: error.message };
        }
    }

    async calculatePriority(goal, context) {
        let totalPriority = 0;
        let totalWeight = 0;

        for (const [factorName, factor] of this.priorityFactors) {
            const score = factor.calculator(goal, context);
            totalPriority += score * factor.weight;
            totalWeight += factor.weight;
        }

        return totalWeight > 0 ? totalPriority / totalWeight : 0.5;
    }

    insertIntoPriorityQueue(goal) {
        // Insert goal maintaining priority order (highest first)
        let inserted = false;
        for (let i = 0; i < this.priorityQueue.length; i++) {
            if (goal.priority > this.priorityQueue[i].priority) {
                this.priorityQueue.splice(i, 0, goal);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            this.priorityQueue.push(goal);
        }
    }

    async getNextGoal(context = {}) {
        if (this.priorityQueue.length === 0) {
            return null;
        }

        // Get highest priority goal that can be executed
        for (let i = 0; i < this.priorityQueue.length; i++) {
            const goal = this.priorityQueue[i];
            if (goal.status === 'pending' && this.canExecuteGoal(goal, context)) {
                goal.status = 'active';
                console.log(`🚀 Selected goal for execution: ${goal.name}`);
                return goal;
            }
        }

        return null;
    }

    canExecuteGoal(goal, context) {
        // Check resource availability
        if (goal.resourceRequirement && context.availableResources) {
            if (goal.resourceRequirement > context.availableResources) {
                return false;
            }
        }

        // Check dependencies
        if (goal.dependencies) {
            for (const depId of goal.dependencies) {
                const dep = this.goals.get(depId);
                if (!dep || dep.status !== 'completed') {
                    return false;
                }
            }
        }

        return true;
    }

    async completeGoal(goalId, result = {}) {
        const goal = this.goals.get(goalId);
        if (!goal) {
            return { success: false, error: 'Goal not found' };
        }

        goal.status = 'completed';
        goal.completedAt = Date.now();
        goal.result = result;

        // Remove from priority queue
        this.priorityQueue = this.priorityQueue.filter(g => g.id !== goalId);

        // Update metrics
        this.updateMetrics(goal);

        console.log(`✅ Goal completed: ${goal.name}`);
        return { success: true, goal };
    }

    updateMetrics(goal) {
        this.metrics.goalsProcessed++;
        this.metrics.averagePriority = (this.metrics.averagePriority + goal.priority) / 2;
        
        const completedGoals = Array.from(this.goals.values()).filter(g => g.status === 'completed').length;
        this.metrics.completionRate = completedGoals / this.goals.size;
    }
}

/**
 * Environmental Interaction System
 */
class EnvironmentalInteractionSystem {
    constructor() {
        this.environmentMap = new Map();
        this.interactionStrategies = new Map();
        this.safetyProtocols = new Map();
        this.initialized = false;
        this.metrics = { interactionsPerformed: 0, safetyViolations: 0, successRate: 0 };
    }

    async initialize() {
        console.log('🌍 Initializing Environmental Interaction System...');
        await this.setupInteractionStrategies();
        await this.loadSafetyProtocols();
        this.initialized = true;
        console.log('✅ Environmental Interaction System initialized');
    }

    async setupInteractionStrategies() {
        this.interactionStrategies.set('filesystem', {
            navigate: async (path, options) => this.navigateFilesystem(path, options),
            read: async (path, options) => this.readFromFilesystem(path, options),
            safety: 'medium'
        });

        this.interactionStrategies.set('network', {
            connect: async (endpoint, options) => this.connectToNetwork(endpoint, options),
            query: async (endpoint, data) => this.queryNetwork(endpoint, data),
            safety: 'high'
        });

        this.interactionStrategies.set('process', {
            monitor: async (processName) => this.monitorProcess(processName),
            interact: async (processId, signal) => this.interactWithProcess(processId, signal),
            safety: 'high'
        });

        console.log(`🔧 Setup ${this.interactionStrategies.size} interaction strategies`);
    }

    async loadSafetyProtocols() {
        this.safetyProtocols.set('filesystem', {
            allowedPaths: ['/tmp', '/var/log', process.cwd()],
            blockedPaths: ['/etc', '/usr/bin', '/system'],
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedExtensions: ['.txt', '.log', '.json', '.js']
        });

        this.safetyProtocols.set('network', {
            allowedPorts: [80, 443, 8080, 3000],
            blockedHosts: ['localhost:22', '127.0.0.1:22'],
            timeout: 30000,
            maxRetries: 3
        });

        this.safetyProtocols.set('process', {
            allowedSignals: ['SIGTERM', 'SIGINT'],
            blockedProcesses: ['init', 'kernel', 'system'],
            monitorOnly: true
        });

        console.log(`🛡️ Loaded ${this.safetyProtocols.size} safety protocols`);
    }

    async interact(environment, action, target, options = {}) {
        const startTime = Date.now();
        
        try {
            console.log(`🌍 Interacting with ${environment}: ${action} on ${target}`);
            
            // Safety check
            const safetyResult = await this.checkSafety(environment, action, target, options);
            if (!safetyResult.safe) {
                throw new Error(`Safety violation: ${safetyResult.reason}`);
            }

            // Get interaction strategy
            const strategy = this.interactionStrategies.get(environment);
            if (!strategy) {
                throw new Error(`No interaction strategy for environment: ${environment}`);
            }

            // Execute interaction
            const result = await strategy[action](target, options);
            
            // Update metrics
            const interactionTime = Date.now() - startTime;
            this.updateMetrics(true, interactionTime);

            console.log(`✅ Environment interaction completed (${interactionTime}ms)`);
            return { success: true, result, interactionTime };

        } catch (error) {
            console.error(`❌ Environment interaction failed: ${error.message}`);
            this.updateMetrics(false, Date.now() - startTime);
            
            if (error.message.includes('Safety violation')) {
                this.metrics.safetyViolations++;
            }
            
            return { success: false, error: error.message };
        }
    }

    async checkSafety(environment, action, target, options) {
        const protocol = this.safetyProtocols.get(environment);
        if (!protocol) {
            return { safe: false, reason: `No safety protocol for ${environment}` };
        }

        // Environment-specific safety checks
        if (environment === 'filesystem') {
            if (protocol.blockedPaths.some(blocked => target.startsWith(blocked))) {
                return { safe: false, reason: `Access to ${target} is blocked` };
            }
        }

        if (environment === 'network') {
            if (protocol.blockedHosts.includes(target)) {
                return { safe: false, reason: `Connection to ${target} is blocked` };
            }
        }

        if (environment === 'process') {
            if (protocol.blockedProcesses.some(blocked => target.includes(blocked))) {
                return { safe: false, reason: `Process ${target} interaction is blocked` };
            }
        }

        return { safe: true };
    }

    updateMetrics(success, interactionTime) {
        this.metrics.interactionsPerformed++;
        
        if (success) {
            const successes = Math.floor(this.metrics.successRate * (this.metrics.interactionsPerformed - 1));
            this.metrics.successRate = (successes + 1) / this.metrics.interactionsPerformed;
        } else {
            const successes = Math.floor(this.metrics.successRate * (this.metrics.interactionsPerformed - 1));
            this.metrics.successRate = successes / this.metrics.interactionsPerformed;
        }
    }
}

/**
 * Main Actions Module
 */
class ActionsModule extends EventEmitter {
    constructor(evaCore) {
        super();
        this.evaCore = evaCore;
        this.commandEngine = new CommandExecutionEngine();
        this.goalSystem = new GoalPrioritizationSystem();
        this.environmentSystem = new EnvironmentalInteractionSystem();
        
        this.initialized = false;
        this.metrics = {
            totalActions: 0,
            successfulActions: 0,
            averageExecutionTime: 0,
            activeGoals: 0
        };
    }

    async initialize() {
        console.log('🎬 Initializing EVA Actions Module...');
        
        try {
            await Promise.all([
                this.commandEngine.initialize(),
                this.goalSystem.initialize(),
                this.environmentSystem.initialize()
            ]);

            this.initialized = true;
            this.emit('initialized');
            console.log('✅ EVA Actions Module fully initialized');
            
            return {
                success: true,
                message: 'Actions Module initialized successfully',
                capabilities: ['command_execution', 'goal_prioritization', 'environmental_interaction']
            };
        } catch (error) {
            console.error('❌ Failed to initialize Actions Module:', error);
            throw error;
        }
    }

    async executeAction(actionType, actionData, context = {}) {
        const startTime = Date.now();
        
        try {
            if (!this.initialized) {
                throw new Error('Actions Module not initialized');
            }

            console.log(`🎬 Executing action: ${actionType}`);
            let result;

            switch (actionType) {
                case 'command':
                    result = await this.commandEngine.executeCommand(
                        actionData.category,
                        actionData.command,
                        actionData.parameters,
                        context
                    );
                    break;

                case 'goal':
                    if (actionData.operation === 'add') {
                        result = await this.goalSystem.addGoal(actionData.goal, context);
                    } else if (actionData.operation === 'complete') {
                        result = await this.goalSystem.completeGoal(actionData.goalId, actionData.result);
                    }
                    break;

                case 'environment':
                    result = await this.environmentSystem.interact(
                        actionData.environment,
                        actionData.action,
                        actionData.target,
                        actionData.options
                    );
                    break;

                default:
                    throw new Error(`Unknown action type: ${actionType}`);
            }

            const executionTime = Date.now() - startTime;
            this.updateMetrics(result.success, executionTime);

            console.log(`✅ Action executed: ${actionType} (${executionTime}ms)`);
            this.emit('action_executed', { actionType, result, executionTime });

            return {
                success: true,
                actionType,
                result,
                executionTime,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error(`❌ Action execution failed: ${error.message}`);
            this.updateMetrics(false, Date.now() - startTime);
            
            return {
                success: false,
                actionType,
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    async getNextPrioritizedAction(context = {}) {
        try {
            const nextGoal = await this.goalSystem.getNextGoal(context);
            if (!nextGoal) {
                return null;
            }

            return {
                goalId: nextGoal.id,
                goalName: nextGoal.name,
                priority: nextGoal.priority,
                actions: nextGoal.actions || [],
                context: nextGoal.context || {}
            };
        } catch (error) {
            console.error('❌ Error getting prioritized action:', error);
            return null;
        }
    }

    updateMetrics(success, executionTime) {
        this.metrics.totalActions++;
        this.metrics.averageExecutionTime = (this.metrics.averageExecutionTime + executionTime) / 2;
        
        if (success) {
            this.metrics.successfulActions++;
        }

        this.metrics.activeGoals = this.goalSystem.priorityQueue.filter(g => g.status === 'pending').length;
    }

    async getStatus() {
        return {
            initialized: this.initialized,
            modules: {
                commandEngine: this.commandEngine.initialized,
                goalSystem: this.goalSystem.initialized,
                environmentSystem: this.environmentSystem.initialized
            },
            metrics: this.metrics,
            capabilities: this.initialized ? ['command_execution', 'goal_prioritization', 'environmental_interaction'] : []
        };
    }

    async shutdown() {
        console.log('🔄 Shutting down Actions Module...');
        this.initialized = false;
        this.emit('shutdown');
        console.log('✅ Actions Module shutdown complete');
    }
}

module.exports = ActionsModule;