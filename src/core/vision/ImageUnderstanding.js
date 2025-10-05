/**
 * EVA Image Understanding Module
 * Integrates with foundational modules for AI-powered image analysis
 */

export class ImageUnderstanding {
    constructor(evaCore) {
        this.eva = evaCore;
        this.openaiService = null; // Will be injected
        this.initialized = false;
        this.analysisCache = new Map();
        this.supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
        this.maxImageSize = 10 * 1024 * 1024; // 10MB
        this.models = new Map();
        this.metrics = {
            imagesAnalyzed: 0,
            averageProcessingTime: 0,
            cacheHitRate: 0,
            accuracyScores: [],
            openaiUsage: 0,
            fallbackUsage: 0
        };
    }

    async initialize() {
        console.log('👁️ Initializing EVA Image Understanding Module...');
        
        try {
            // Initialize vision models
            await this.initializeVisionModels();
            
            // Setup analysis pipeline
            this.setupAnalysisPipeline();
            
            // Initialize cache cleanup
            this.startCacheCleanup();
            
            this.initialized = true;
            console.log('✅ Image Understanding Module initialized');
            
            return {
                success: true,
                message: 'Image Understanding Module ready',
                supportedFormats: this.supportedFormats
            };
        } catch (error) {
            console.error('❌ Failed to initialize Image Understanding:', error);
            throw error;
        }
    }

    async initializeVisionModels() {
        // Object Detection Model
        this.models.set('object_detection', {
            type: 'object_detection',
            confidence_threshold: 0.5,
            classes: [
                'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck',
                'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
                'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra',
                'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
                'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
                'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup',
                'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
                'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
                'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
                'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
                'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
                'toothbrush'
            ]
        });

        // Scene Classification Model
        this.models.set('scene_classification', {
            type: 'scene_classification',
            classes: [
                'indoor', 'outdoor', 'natural', 'urban', 'beach', 'mountain', 'forest',
                'desert', 'office', 'kitchen', 'bedroom', 'living room', 'bathroom',
                'restaurant', 'street', 'park', 'garden', 'sunset', 'sunrise', 'night'
            ]
        });

        // Text Recognition Model
        this.models.set('text_recognition', {
            type: 'ocr',
            languages: ['en', 'sw'], // English and Swahili
            confidence_threshold: 0.7
        });

        // Face Analysis Model
        this.models.set('face_analysis', {
            type: 'face_analysis',
            detect_emotions: true,
            detect_age: true,
            detect_gender: true,
            privacy_mode: true // Respects privacy by default
        });

        // Color Analysis Model
        this.models.set('color_analysis', {
            type: 'color_analysis',
            extract_palette: true,
            dominant_colors: 5
        });

        console.log(`🧠 Initialized ${this.models.size} vision models`);
    }

    setupAnalysisPipeline() {
        this.analysisPipeline = [
            {
                name: 'preprocessing',
                handler: this.preprocessImage.bind(this)
            },
            {
                name: 'basic_analysis',
                handler: this.performBasicAnalysis.bind(this)
            },
            {
                name: 'object_detection',
                handler: this.detectObjects.bind(this)
            },
            {
                name: 'scene_classification',
                handler: this.classifyScene.bind(this)
            },
            {
                name: 'text_recognition',
                handler: this.recognizeText.bind(this)
            },
            {
                name: 'color_analysis',
                handler: this.analyzeColors.bind(this)
            },
            {
                name: 'context_integration',
                handler: this.integrateWithFoundationalModules.bind(this)
            },
            {
                name: 'response_generation',
                handler: this.generateResponse.bind(this)
            }
        ];
    }

    async analyzeImage(imageData, context = {}) {
        const startTime = Date.now();
        
        try {
            if (!this.initialized) {
                throw new Error('Image Understanding Module not initialized');
            }

            console.log('🔍 Analyzing image...');
            
            // Check cache first
            const cacheKey = this.generateCacheKey(imageData, context);
            if (this.analysisCache.has(cacheKey)) {
                console.log('📋 Using cached analysis');
                this.updateMetrics(true, Date.now() - startTime, true);
                return this.analysisCache.get(cacheKey);
            }

            // Validate image
            const validation = await this.validateImage(imageData);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Try OpenAI Vision API first if available
            if (this.openaiService?.isReady()) {
                try {
                    const openaiResult = await this.analyzeWithOpenAI(imageData, context);
                    if (openaiResult.success) {
                        this.metrics.openaiUsage++;
                        this.analysisCache.set(cacheKey, openaiResult);
                        this.updateMetrics(false, Date.now() - startTime, true);
                        console.log('✅ OpenAI image analysis complete');
                        return openaiResult;
                    }
                } catch (openaiError) {
                    console.warn('⚠️ OpenAI analysis failed, falling back to local analysis:', openaiError);
                }
            }

            // Fallback to local analysis pipeline
            this.metrics.fallbackUsage++;
            const localResult = await this.analyzeWithLocalPipeline(imageData, context, startTime);
            
            return localResult;

        } catch (error) {
            console.error('❌ Image analysis failed:', error);
            this.updateMetrics(false, Date.now() - startTime, false);
            
            return {
                success: false,
                error: error.message,
                fallback: {
                    description: 'Unable to analyze image due to technical difficulties',
                    suggestion: 'Please try again or use a different image format'
                }
            };
        }
    }

    /**
     * Analyze image using OpenAI Vision API
     */
    async analyzeWithOpenAI(imageData, context) {
        try {
            const prompt = this.buildOpenAIPrompt(context);
            const analysis = await this.openaiService.analyzeImage(imageData, prompt);
            
            if (!analysis.success) {
                throw new Error(analysis.error || 'OpenAI analysis failed');
            }

            // Parse OpenAI response and structure it
            const structuredResult = this.parseOpenAIResponse(analysis, imageData, context);
            
            return {
                success: true,
                source: 'openai',
                timestamp: new Date(),
                response: structuredResult,
                usage: analysis.usage,
                model: analysis.model
            };
            
        } catch (error) {
            console.error('OpenAI Vision analysis error:', error);
            throw error;
        }
    }
    
    /**
     * Build context-aware prompt for OpenAI Vision API
     */
    buildOpenAIPrompt(context) {
        let prompt = 'Analyze this image in detail. Please describe:';
        
        const requests = [
            '1. What objects, people, or elements you can see',
            '2. The scene or setting (indoor/outdoor, location type)',
            '3. Colors, lighting, and visual composition',
            '4. Any text visible in the image',
            '5. The mood or atmosphere of the image',
            '6. Any notable details or interesting aspects'
        ];
        
        // Add context-specific requests
        if (context.userMessage) {
            prompt += `\n\nUser's specific question: "${context.userMessage}"`;
            prompt += '\n\nPlease address their question in your analysis.';
        }
        
        if (context.analysisType) {
            switch (context.analysisType) {
                case 'detailed':
                    prompt += '\n\nProvide a very detailed and comprehensive analysis.';
                    break;
                case 'quick':
                    prompt += '\n\nProvide a concise but informative summary.';
                    break;
                case 'technical':
                    prompt += '\n\nFocus on technical aspects, composition, and photographic elements.';
                    break;
            }
        }
        
        prompt += '\n\n' + requests.join('\n');
        
        return prompt;
    }
    
    /**
     * Parse and structure OpenAI response
     */
    parseOpenAIResponse(analysis, imageData, context) {
        const description = analysis.description;
        
        // Extract structured information from the description
        const structured = {
            description: description,
            summary: this.extractSummary(description),
            objects: this.extractObjects(description),
            scene: this.extractScene(description),
            colors: this.extractColors(description),
            text: this.extractText(description),
            mood: this.extractMood(description),
            details: {
                hasText: description.toLowerCase().includes('text') || description.toLowerCase().includes('writing'),
                hasObjects: true, // OpenAI typically identifies objects
                hasPeople: description.toLowerCase().includes('person') || description.toLowerCase().includes('people'),
                confidence: 0.95, // OpenAI Vision is generally highly confident
                analysisType: 'comprehensive'
            }
        };
        
        return structured;
    }
    
    /**
     * Analyze image using local pipeline (fallback)
     */
    async analyzeWithLocalPipeline(imageData, context, startTime) {
        // Run analysis pipeline
        let analysisResult = {
            imageData: imageData,
            context: context,
            timestamp: new Date(),
            processingSteps: []
        };

        for (const step of this.analysisPipeline) {
            const stepStartTime = Date.now();
            
            try {
                const stepResult = await step.handler(analysisResult);
                analysisResult = { ...analysisResult, ...stepResult };
                
                analysisResult.processingSteps.push({
                    name: step.name,
                    duration: Date.now() - stepStartTime,
                    success: true
                });
            } catch (stepError) {
                console.warn(`⚠️ Analysis step ${step.name} failed:`, stepError);
                analysisResult.processingSteps.push({
                    name: step.name,
                    duration: Date.now() - stepStartTime,
                    success: false,
                    error: stepError.message
                });
            }
        }

        // Calculate overall processing time
        const processingTime = Date.now() - startTime;
        analysisResult.totalProcessingTime = processingTime;
        analysisResult.source = 'local';
        analysisResult.success = true;

        // Cache the result
        const cacheKey = this.generateCacheKey(imageData, context);
        this.analysisCache.set(cacheKey, analysisResult);

        // Update metrics
        this.updateMetrics(false, processingTime, true);

        console.log(`✅ Local image analysis complete (${processingTime}ms)`);
        return analysisResult;
    }
    
    /**
     * Helper methods to extract information from OpenAI response
     */
    extractSummary(description) {
        const sentences = description.split('. ');
        return sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '');
    }
    
    extractObjects(description) {
        // Simple keyword extraction for objects
        const objectKeywords = ['person', 'people', 'car', 'building', 'tree', 'animal', 'furniture', 'food', 'device', 'tool'];
        const found = [];
        
        objectKeywords.forEach(keyword => {
            if (description.toLowerCase().includes(keyword)) {
                found.push(keyword);
            }
        });
        
        return found;
    }
    
    extractScene(description) {
        if (description.toLowerCase().includes('outdoor') || description.toLowerCase().includes('outside')) {
            return 'outdoor';
        }
        if (description.toLowerCase().includes('indoor') || description.toLowerCase().includes('inside')) {
            return 'indoor';
        }
        return 'unknown';
    }
    
    extractColors(description) {
        const colorKeywords = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'brown', 'orange', 'purple', 'pink'];
        const found = [];
        
        colorKeywords.forEach(color => {
            if (description.toLowerCase().includes(color)) {
                found.push(color);
            }
        });
        
        return found;
    }
    
    extractText(description) {
        return description.toLowerCase().includes('text') || 
               description.toLowerCase().includes('writing') ||
               description.toLowerCase().includes('sign') ||
               description.toLowerCase().includes('letter');
    }
    
    extractMood(description) {
        if (description.toLowerCase().includes('bright') || description.toLowerCase().includes('cheerful')) {
            return 'cheerful';
        }
        if (description.toLowerCase().includes('dark') || description.toLowerCase().includes('moody')) {
            return 'moody';
        }
        if (description.toLowerCase().includes('calm') || description.toLowerCase().includes('peaceful')) {
            return 'calm';
        }
        return 'neutral';
    }

    async validateImage(imageData) {
        // Check if it's a data URL
        if (!imageData.startsWith('data:image/')) {
            return { valid: false, error: 'Invalid image data format' };
        }

        // Extract mime type
        const mimeMatch = imageData.match(/data:([^;]+);/);
        if (!mimeMatch) {
            return { valid: false, error: 'Unable to determine image type' };
        }

        const mimeType = mimeMatch[1];
        if (!this.supportedFormats.includes(mimeType)) {
            return { valid: false, error: `Unsupported image format: ${mimeType}` };
        }

        // Estimate file size (base64 is ~33% larger than binary)
        const base64Data = imageData.split(',')[1];
        const estimatedSize = (base64Data.length * 3) / 4;
        
        if (estimatedSize > this.maxImageSize) {
            return { valid: false, error: `Image too large: ${Math.round(estimatedSize / 1024 / 1024)}MB (max: ${this.maxImageSize / 1024 / 1024}MB)` };
        }

        return { valid: true };
    }

    async preprocessImage(analysisResult) {
        // Convert data URL to canvas for analysis
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        return new Promise((resolve) => {
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                resolve({
                    imageElement: img,
                    canvas: canvas,
                    context: ctx,
                    imageData: imageData,
                    dimensions: {
                        width: img.width,
                        height: img.height,
                        aspectRatio: img.width / img.height
                    }
                });
            };

            img.src = analysisResult.imageData;
        });
    }

    async performBasicAnalysis(analysisResult) {
        const { dimensions, imageData } = analysisResult;
        
        // Analyze basic properties
        let totalR = 0, totalG = 0, totalB = 0;
        let brightness = 0;
        const pixels = imageData.data;
        const pixelCount = pixels.length / 4;

        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            
            totalR += r;
            totalG += g;
            totalB += b;
            
            // Calculate brightness using luminance formula
            brightness += (0.299 * r + 0.587 * g + 0.114 * b);
        }

        const avgR = Math.round(totalR / pixelCount);
        const avgG = Math.round(totalG / pixelCount);
        const avgB = Math.round(totalB / pixelCount);
        const avgBrightness = brightness / pixelCount;

        return {
            basicAnalysis: {
                dimensions: dimensions,
                averageColor: { r: avgR, g: avgG, b: avgB },
                brightness: Math.round((avgBrightness / 255) * 100),
                colorProfile: this.determineColorProfile(avgR, avgG, avgB),
                imageType: this.classifyImageType(dimensions.aspectRatio, avgBrightness)
            }
        };
    }

    async detectObjects(analysisResult) {
        // Simulated object detection (in a real implementation, this would use TensorFlow.js or similar)
        const { basicAnalysis } = analysisResult;
        const objects = [];

        // Simple heuristic-based object detection simulation
        if (basicAnalysis.brightness > 150) {
            objects.push({
                class: 'bright_object',
                confidence: 0.8,
                description: 'Well-lit scene or bright objects'
            });
        }

        if (basicAnalysis.colorProfile.includes('blue')) {
            objects.push({
                class: 'sky_or_water',
                confidence: 0.7,
                description: 'Possible sky, water, or blue objects'
            });
        }

        if (basicAnalysis.colorProfile.includes('green')) {
            objects.push({
                class: 'vegetation',
                confidence: 0.6,
                description: 'Likely contains plants or vegetation'
            });
        }

        return {
            objectDetection: {
                objects: objects,
                objectCount: objects.length,
                detectionConfidence: objects.length > 0 ? 
                    objects.reduce((sum, obj) => sum + obj.confidence, 0) / objects.length : 0
            }
        };
    }

    async classifyScene(analysisResult) {
        const { basicAnalysis, objectDetection } = analysisResult;
        let sceneType = 'unknown';
        let confidence = 0.5;

        // Simple scene classification based on analysis
        if (basicAnalysis.brightness > 180) {
            sceneType = 'outdoor_daylight';
            confidence = 0.8;
        } else if (basicAnalysis.brightness < 100) {
            sceneType = 'indoor_or_night';
            confidence = 0.7;
        }

        if (objectDetection.objects.some(obj => obj.class === 'sky_or_water')) {
            sceneType = 'outdoor_natural';
            confidence = 0.9;
        }

        if (objectDetection.objects.some(obj => obj.class === 'vegetation')) {
            sceneType = 'natural_environment';
            confidence = 0.8;
        }

        return {
            sceneClassification: {
                scene: sceneType,
                confidence: confidence,
                category: this.categorizeScene(sceneType)
            }
        };
    }

    async recognizeText(analysisResult) {
        // Simulated OCR (in a real implementation, this would use Tesseract.js or similar)
        const { basicAnalysis } = analysisResult;
        const textRegions = [];

        // Simple text detection heuristic
        if (basicAnalysis.brightness > 100 && basicAnalysis.brightness < 200) {
            // Good contrast conditions for text
            textRegions.push({
                text: 'Text detected but not yet readable',
                confidence: 0.6,
                language: 'unknown',
                region: { x: 0, y: 0, width: 100, height: 20 }
            });
        }

        return {
            textRecognition: {
                hasText: textRegions.length > 0,
                textRegions: textRegions,
                extractedText: textRegions.map(region => region.text).join(' '),
                languages: [...new Set(textRegions.map(region => region.language))]
            }
        };
    }

    async analyzeColors(analysisResult) {
        const { basicAnalysis } = analysisResult;
        const { averageColor } = basicAnalysis;

        // Generate color palette based on average color
        const palette = this.generateColorPalette(averageColor);
        const dominantColor = this.identifyDominantColor(averageColor);

        return {
            colorAnalysis: {
                dominantColor: dominantColor,
                palette: palette,
                colorHarmony: this.analyzeColorHarmony(palette),
                mood: this.determineColorMood(dominantColor, basicAnalysis.brightness)
            }
        };
    }

    async integrateWithFoundationalModules(analysisResult) {
        try {
            // Use EVA's Understanding Module for context analysis
            const contextData = {
                imageAnalysis: analysisResult,
                userContext: analysisResult.context
            };

            const understandingResult = await this.eva.understanding.comprehendInput(
                `Analyze image context: ${JSON.stringify(contextData)}`,
                {
                    type: 'image_context_analysis',
                    imageData: analysisResult.basicAnalysis,
                    objects: analysisResult.objectDetection?.objects || [],
                    scene: analysisResult.sceneClassification?.scene || 'unknown'
                }
            );

            // Use Decision-Making Module to determine response approach
            const decisionInput = {
                treeName: 'user_interaction',
                modelName: 'user_intent',
                context: {
                    hasImage: true,
                    imageComplexity: this.calculateImageComplexity(analysisResult),
                    userRequest: analysisResult.context.userMessage || 'image_analysis'
                },
                evidence: {
                    visual_content: true,
                    object_detected: (analysisResult.objectDetection?.objects?.length || 0) > 0,
                    text_present: analysisResult.textRecognition?.hasText || false,
                    scene_identifiable: (analysisResult.sceneClassification?.confidence || 0) > 0.7
                }
            };

            const decisionResult = await this.eva.decisionMaking.makeDecision('hybrid', decisionInput);

            return {
                foundationalIntegration: {
                    understanding: understandingResult,
                    decision: decisionResult,
                    confidence: this.calculateOverallConfidence(analysisResult),
                    recommendedResponse: this.getResponseRecommendation(analysisResult, decisionResult)
                }
            };

        } catch (error) {
            console.warn('⚠️ Foundational integration failed:', error);
            return {
                foundationalIntegration: {
                    error: error.message,
                    fallback: true
                }
            };
        }
    }

    async generateResponse(analysisResult) {
        const response = this.buildNaturalLanguageResponse(analysisResult);
        
        // Use EVA's Response Module for enhanced output
        try {
            const enhancedResponse = await this.eva.responses.generateMultimodalResponse(
                response.description,
                {
                    type: 'image_analysis_result',
                    confidence: analysisResult.foundationalIntegration?.confidence || 0.7,
                    hasVisualContent: true,
                    analysisData: analysisResult
                }
            );

            return {
                response: {
                    description: response.description,
                    summary: response.summary,
                    details: response.details,
                    multimodal: enhancedResponse.success ? enhancedResponse.responses : null,
                    confidence: analysisResult.foundationalIntegration?.confidence || 0.7
                }
            };
        } catch (error) {
            console.warn('⚠️ Enhanced response generation failed:', error);
            return {
                response: response
            };
        }
    }

    buildNaturalLanguageResponse(analysisResult) {
        const parts = [];
        
        // Basic description
        if (analysisResult.basicAnalysis) {
            const { dimensions, brightness, colorProfile } = analysisResult.basicAnalysis;
            parts.push(`I can see an image that is ${dimensions.width}x${dimensions.height} pixels`);
            
            if (brightness > 150) {
                parts.push('with bright lighting');
            } else if (brightness < 100) {
                parts.push('with dim lighting');
            }
            
            if (colorProfile.length > 0) {
                parts.push(`featuring ${colorProfile.join(', ')} tones`);
            }
        }

        // Objects
        if (analysisResult.objectDetection?.objects?.length > 0) {
            const objects = analysisResult.objectDetection.objects.map(obj => obj.description);
            parts.push(`I detected: ${objects.join(', ')}`);
        }

        // Scene
        if (analysisResult.sceneClassification?.scene) {
            const scene = analysisResult.sceneClassification.scene.replace(/_/g, ' ');
            parts.push(`This appears to be ${scene.includes('outdoor') ? 'an outdoor scene' : 'an indoor scene'}`);
        }

        // Text
        if (analysisResult.textRecognition?.hasText) {
            parts.push('The image contains text elements');
        }

        // Colors
        if (analysisResult.colorAnalysis?.dominantColor) {
            parts.push(`The dominant color scheme is ${analysisResult.colorAnalysis.dominantColor}`);
        }

        const description = parts.join('. ') + '.';
        
        // Generate summary
        const objectCount = analysisResult.objectDetection?.objects?.length || 0;
        const sceneConfidence = analysisResult.sceneClassification?.confidence || 0;
        const overallConfidence = analysisResult.foundationalIntegration?.confidence || 0.7;

        let summary = `Image analysis complete with ${Math.round(overallConfidence * 100)}% confidence. `;
        
        if (objectCount > 0) {
            summary += `Identified ${objectCount} visual element${objectCount > 1 ? 's' : ''}. `;
        }
        
        if (sceneConfidence > 0.8) {
            summary += 'Scene classification is highly confident. ';
        }

        return {
            description: description,
            summary: summary,
            details: {
                processingTime: analysisResult.totalProcessingTime,
                stepsCompleted: analysisResult.processingSteps?.filter(s => s.success)?.length || 0,
                confidence: overallConfidence,
                features: {
                    objects: objectCount,
                    hasText: analysisResult.textRecognition?.hasText || false,
                    colorCount: analysisResult.colorAnalysis?.palette?.length || 0,
                    sceneIdentified: sceneConfidence > 0.7
                }
            }
        };
    }

    // Helper methods
    determineColorProfile(r, g, b) {
        const profile = [];
        
        if (r > g && r > b) profile.push('red');
        if (g > r && g > b) profile.push('green');
        if (b > r && b > g) profile.push('blue');
        
        if (r > 200 && g > 200 && b > 200) profile.push('bright');
        if (r < 100 && g < 100 && b < 100) profile.push('dark');
        
        if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30) profile.push('neutral');
        
        return profile;
    }

    classifyImageType(aspectRatio, brightness) {
        if (aspectRatio > 1.5) return 'landscape';
        if (aspectRatio < 0.7) return 'portrait';
        return 'square';
    }

    categorizeScene(sceneType) {
        if (sceneType.includes('outdoor')) return 'outdoor';
        if (sceneType.includes('indoor')) return 'indoor';
        if (sceneType.includes('natural')) return 'nature';
        return 'general';
    }

    generateColorPalette(averageColor) {
        const { r, g, b } = averageColor;
        return [
            `rgb(${r}, ${g}, ${b})`,
            `rgb(${Math.min(255, r + 50)}, ${g}, ${b})`,
            `rgb(${r}, ${Math.min(255, g + 50)}, ${b})`,
            `rgb(${r}, ${g}, ${Math.min(255, b + 50)})`,
            `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`
        ];
    }

    identifyDominantColor(averageColor) {
        const { r, g, b } = averageColor;
        
        if (r > g && r > b) return 'red-dominant';
        if (g > r && g > b) return 'green-dominant';
        if (b > r && b > g) return 'blue-dominant';
        
        if (r + g + b > 600) return 'bright';
        if (r + g + b < 300) return 'dark';
        
        return 'balanced';
    }

    analyzeColorHarmony(palette) {
        // Simple color harmony analysis
        return {
            type: 'analogous', // Simplified
            harmony_score: 0.7
        };
    }

    determineColorMood(dominantColor, brightness) {
        if (brightness > 180) return 'cheerful';
        if (brightness < 80) return 'moody';
        if (dominantColor.includes('blue')) return 'calm';
        if (dominantColor.includes('red')) return 'energetic';
        if (dominantColor.includes('green')) return 'natural';
        return 'neutral';
    }

    calculateImageComplexity(analysisResult) {
        let complexity = 0.5; // Base complexity
        
        if (analysisResult.objectDetection?.objects?.length > 0) {
            complexity += 0.2;
        }
        
        if (analysisResult.textRecognition?.hasText) {
            complexity += 0.15;
        }
        
        if (analysisResult.colorAnalysis?.palette?.length > 3) {
            complexity += 0.1;
        }
        
        if (analysisResult.sceneClassification?.confidence > 0.8) {
            complexity += 0.05;
        }
        
        return Math.min(complexity, 1.0);
    }

    calculateOverallConfidence(analysisResult) {
        const confidences = [];
        
        if (analysisResult.objectDetection?.detectionConfidence) {
            confidences.push(analysisResult.objectDetection.detectionConfidence);
        }
        
        if (analysisResult.sceneClassification?.confidence) {
            confidences.push(analysisResult.sceneClassification.confidence);
        }
        
        if (analysisResult.textRecognition?.textRegions?.length > 0) {
            const textConfidence = analysisResult.textRecognition.textRegions
                .reduce((sum, region) => sum + region.confidence, 0) / 
                analysisResult.textRecognition.textRegions.length;
            confidences.push(textConfidence);
        }
        
        return confidences.length > 0 ? 
            confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length : 0.7;
    }

    getResponseRecommendation(analysisResult, decisionResult) {
        if (decisionResult?.success && decisionResult.result?.decision?.name) {
            return decisionResult.result.decision.name;
        }
        
        const complexity = this.calculateImageComplexity(analysisResult);
        
        if (complexity > 0.8) return 'detailed_analysis';
        if (complexity > 0.5) return 'standard_analysis';
        return 'basic_analysis';
    }

    generateCacheKey(imageData, context) {
        // Create a hash-like key from image data and context
        const imageHash = imageData.substring(0, 100); // First 100 chars as simple hash
        const contextHash = JSON.stringify(context);
        return `${imageHash}_${contextHash}`.replace(/[^a-zA-Z0-9]/g, '');
    }

    startCacheCleanup() {
        // Clean cache every 30 minutes
        setInterval(() => {
            const maxAge = 30 * 60 * 1000; // 30 minutes
            const now = Date.now();
            
            for (const [key, result] of this.analysisCache.entries()) {
                if (now - result.timestamp.getTime() > maxAge) {
                    this.analysisCache.delete(key);
                }
            }
            
            console.log(`🧹 Cleaned image analysis cache: ${this.analysisCache.size} items remaining`);
        }, 30 * 60 * 1000);
    }

    updateMetrics(cacheHit, processingTime, success) {
        this.metrics.imagesAnalyzed++;
        
        if (cacheHit) {
            const hits = Math.floor(this.metrics.cacheHitRate * (this.metrics.imagesAnalyzed - 1));
            this.metrics.cacheHitRate = (hits + 1) / this.metrics.imagesAnalyzed;
        } else {
            const hits = Math.floor(this.metrics.cacheHitRate * (this.metrics.imagesAnalyzed - 1));
            this.metrics.cacheHitRate = hits / this.metrics.imagesAnalyzed;
        }
        
        if (!cacheHit) {
            this.metrics.averageProcessingTime = 
                (this.metrics.averageProcessingTime + processingTime) / 2;
        }
        
        if (success) {
            this.metrics.accuracyScores.push(0.8); // Placeholder accuracy
            if (this.metrics.accuracyScores.length > 100) {
                this.metrics.accuracyScores = this.metrics.accuracyScores.slice(-100);
            }
        }
    }

    async getStatus() {
        return {
            initialized: this.initialized,
            supportedFormats: this.supportedFormats,
            modelsLoaded: this.models.size,
            cacheSize: this.analysisCache.size,
            metrics: this.metrics,
            capabilities: [
                'object_detection',
                'scene_classification', 
                'text_recognition',
                'color_analysis',
                'foundational_integration'
            ]
        };
    }

    async clearCache() {
        this.analysisCache.clear();
        console.log('🧹 Image analysis cache cleared');
    }
}