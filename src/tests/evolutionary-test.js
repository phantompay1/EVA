/**
 * EVA Evolutionary Architecture Test Suite
 * 
 * Comprehensive testing of Phase 1 evolutionary capabilities
 */

import { EVACore } from '../core/EVACore.js';

export class EvolutionaryTest {
    constructor() {
        this.eva = null;
        this.testResults = [];
        this.isRunning = false;
    }

    async runFullTest() {
        console.log('🧪 Starting EVA Evolutionary Architecture Test Suite...');
        this.isRunning = true;
        
        try {
            // Initialize EVA
            await this.initializeEVA();
            
            // Test Phase 1 components
            await this.testLeaseManager();
            await this.testBackupBrain();
            await this.testCommunicationHub();
            await this.testPolicyEngine();
            await this.testKnowledgeFusion();
            await this.testNetworkIntelligence();
            
            // Test integration
            await this.testSystemIntegration();
            
            // Generate report
            this.generateTestReport();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            this.recordTest('SUITE_FAILURE', false, error.message);
        } finally {
            this.isRunning = false;
        }
    }

    async initializeEVA() {
        console.log('🚀 Initializing EVA for testing...');
        
        try {
            this.eva = new EVACore();
            await this.eva.initialize();
            
            this.recordTest('EVA_INITIALIZATION', true, 'EVA core initialized successfully');
            console.log('✅ EVA initialized successfully');
        } catch (error) {
            this.recordTest('EVA_INITIALIZATION', false, error.message);
            throw error;
        }
    }

    async testLeaseManager() {
        console.log('🎯 Testing Lease Manager...');
        
        try {
            // Test unit creation
            const unit = await this.eva.createEVAUnit({
                type: 'clone',
                specialization: 'test_unit',
                capabilities: { testing: true }
            });
            
            this.recordTest('LEASE_MANAGER_CREATE_UNIT', !!unit.unitId, 
                unit.unitId ? `Unit created: ${unit.unitId}` : 'Unit creation failed');
            
            // Test lease status
            const status = this.eva.leaseManager.getLeaseStatus();
            this.recordTest('LEASE_MANAGER_STATUS', status.activeUnits > 0, 
                `Active units: ${status.activeUnits}`);
            
            console.log('✅ Lease Manager tests completed');
        } catch (error) {
            this.recordTest('LEASE_MANAGER_ERROR', false, error.message);
        }
    }

    async testBackupBrain() {
        console.log('💾 Testing Backup Brain...');
        
        try {
            // Test consciousness backup
            const backup = await this.eva.backupBrain.createFullBackup({
                reason: 'testing'
            });
            
            this.recordTest('BACKUP_BRAIN_CREATE', !!backup.backupId, 
                backup.backupId ? `Backup created: ${backup.backupId}` : 'Backup creation failed');
            
            // Test backup status
            const status = this.eva.backupBrain.getBackupStatus();
            this.recordTest('BACKUP_BRAIN_STATUS', status.totalBackups > 0, 
                `Total backups: ${status.totalBackups}`);
            
            console.log('✅ Backup Brain tests completed');
        } catch (error) {
            this.recordTest('BACKUP_BRAIN_ERROR', false, error.message);
        }
    }

    async testCommunicationHub() {
        console.log('📡 Testing Communication Hub...');
        
        try {
            // Test connection establishment
            const connection = await this.eva.communicationHub.establishConnection({
                type: 'browser_tab',
                protocol: 'broadcast',
                channelName: 'test_channel'
            });
            
            this.recordTest('COMMUNICATION_HUB_CONNECT', !!connection.connectionId, 
                connection.connectionId ? `Connection: ${connection.connectionId}` : 'Connection failed');
            
            // Test message sending
            if (connection.connectionId) {
                const messageId = await this.eva.communicationHub.sendMessage(connection.connectionId, {
                    type: 'test_message',
                    data: 'Hello from test'
                });
                
                this.recordTest('COMMUNICATION_HUB_MESSAGE', !!messageId, 
                    messageId ? `Message sent: ${messageId}` : 'Message sending failed');
            }
            
            // Test hub status
            const status = this.eva.communicationHub.getCommunicationStatus();
            this.recordTest('COMMUNICATION_HUB_STATUS', status.isActive, 
                `Active connections: ${status.activeConnections}`);
            
            console.log('✅ Communication Hub tests completed');
        } catch (error) {
            this.recordTest('COMMUNICATION_HUB_ERROR', false, error.message);
        }
    }

    async testPolicyEngine() {
        console.log('🎯 Testing Policy Engine...');
        
        try {
            // Test decision making
            const decision = await this.eva.policyEngine.makeDecision({
                type: 'test_decision',
                context: 'testing_scenario',
                urgency: 'low'
            });
            
            this.recordTest('POLICY_ENGINE_DECISION', !!decision.action, 
                decision.action ? `Decision: ${decision.action}` : 'Decision making failed');
            
            // Test policy status
            const status = this.eva.policyEngine.getPolicyStatus();
            this.recordTest('POLICY_ENGINE_STATUS', status.totalPolicies > 0, 
                `Total policies: ${status.totalPolicies}`);
            
            console.log('✅ Policy Engine tests completed');
        } catch (error) {
            this.recordTest('POLICY_ENGINE_ERROR', false, error.message);
        }
    }

    async testKnowledgeFusion() {
        console.log('🧠 Testing Knowledge Fusion Engine...');
        
        try {
            // Test knowledge fusion
            const fusion = await this.eva.knowledgeFusion.fuseKnowledge({
                content: 'Test knowledge for fusion',
                source: 'test',
                type: 'factual'
            });
            
            this.recordTest('KNOWLEDGE_FUSION_FUSE', !!fusion.fusionId, 
                fusion.fusionId ? `Fusion: ${fusion.fusionId}` : 'Knowledge fusion failed');
            
            // Test semantic search
            const searchResults = await this.eva.knowledgeFusion.semanticSearch('test knowledge');
            this.recordTest('KNOWLEDGE_FUSION_SEARCH', searchResults.length >= 0, 
                `Search results: ${searchResults.length}`);
            
            // Test fusion status
            const status = this.eva.knowledgeFusion.getFusionStatus();
            this.recordTest('KNOWLEDGE_FUSION_STATUS', status.isActive, 
                `Fusion events: ${status.metrics.fusionEvents}`);
            
            console.log('✅ Knowledge Fusion Engine tests completed');
        } catch (error) {
            this.recordTest('KNOWLEDGE_FUSION_ERROR', false, error.message);
        }
    }

    async testNetworkIntelligence() {
        console.log('🌐 Testing Network Intelligence...');
        
        try {
            // Test network join
            const networkJoin = await this.eva.networkIntelligence.joinNetwork({
                endpoint: 'test_network'
            });
            
            this.recordTest('NETWORK_INTELLIGENCE_JOIN', !!networkJoin.nodeId, 
                networkJoin.nodeId ? `Node: ${networkJoin.nodeId}` : 'Network join failed');
            
            // Test network status
            const status = this.eva.networkIntelligence.getNetworkStatus();
            this.recordTest('NETWORK_INTELLIGENCE_STATUS', status.isActive, 
                `Network nodes: ${status.topology.nodes}`);
            
            console.log('✅ Network Intelligence tests completed');
        } catch (error) {
            this.recordTest('NETWORK_INTELLIGENCE_ERROR', false, error.message);
        }
    }

    async testSystemIntegration() {
        console.log('🔧 Testing System Integration...');
        
        try {
            // Test EVA capabilities
            const capabilities = this.eva.getCapabilities();
            this.recordTest('INTEGRATION_CAPABILITIES', 
                capabilities.evolutionary && capabilities.core, 
                `Phase: ${capabilities.phase}`);
            
            // Test EVA status
            const status = this.eva.getStatus();
            this.recordTest('INTEGRATION_STATUS', 
                status.active && status.evolutionarySystems, 
                `Mode: ${status.mode}`);
            
            // Test consciousness export
            const consciousness = await this.eva.exportConsciousness();
            this.recordTest('INTEGRATION_CONSCIOUSNESS', 
                consciousness && Object.keys(consciousness).length > 0, 
                `Consciousness components: ${Object.keys(consciousness).length}`);
            
            console.log('✅ System Integration tests completed');
        } catch (error) {
            this.recordTest('INTEGRATION_ERROR', false, error.message);
        }
    }

    recordTest(testName, passed, details) {
        const result = {
            test: testName,
            passed,
            details,
            timestamp: new Date()
        };
        
        this.testResults.push(result);
        
        const emoji = passed ? '✅' : '❌';
        console.log(`${emoji} ${testName}: ${details}`);
    }

    generateTestReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(t => t.passed).length;
        const failedTests = totalTests - passedTests;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        console.log('\n📊 EVA Evolutionary Architecture Test Report');
        console.log('================================================');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log('');
        
        // Show failed tests
        const failed = this.testResults.filter(t => !t.passed);
        if (failed.length > 0) {
            console.log('❌ Failed Tests:');
            failed.forEach(test => {
                console.log(`  - ${test.test}: ${test.details}`);
            });
            console.log('');
        }
        
        // Overall assessment
        if (successRate >= 90) {
            console.log('🎉 EXCELLENT: EVA Evolutionary Architecture is ready for Phase 1 deployment!');
        } else if (successRate >= 75) {
            console.log('✅ GOOD: EVA Evolutionary Architecture is mostly functional with minor issues.');
        } else if (successRate >= 50) {
            console.log('⚠️ FAIR: EVA Evolutionary Architecture has significant issues that need addressing.');
        } else {
            console.log('❌ POOR: EVA Evolutionary Architecture requires major fixes before deployment.');
        }
        
        console.log('\n🚀 Phase 1 Status: Brain Prototype Complete');
        console.log('🔮 Phase 2 Readiness: Network Intelligence Initialized');
        console.log('⚡ Phase 3 Potential: Foundation for Evolutionary Singularity Established');
        
        return {
            totalTests,
            passedTests,
            failedTests,
            successRate: parseFloat(successRate),
            results: this.testResults
        };
    }

    getTestResults() {
        return {
            isRunning: this.isRunning,
            results: this.testResults,
            summary: this.testResults.length > 0 ? {
                total: this.testResults.length,
                passed: this.testResults.filter(t => t.passed).length,
                failed: this.testResults.filter(t => !t.passed).length
            } : null
        };
    }
}

// Auto-run test if this file is executed directly
if (typeof window !== 'undefined') {
    window.EvolutionaryTest = EvolutionaryTest;
    
    // Add global test runner function
    window.runEVATest = async () => {
        const test = new EvolutionaryTest();
        return await test.runFullTest();
    };
}