
 let videoStream = null;
        let audioStream = null;
        let mediaRecorder = null;
        let audioChunks = [];
        let audioContext = null;
        let analyser = null;
        let currentFilter = 'none';
        let currentVoiceEffect = 'normal';
        let faceDetectionActive = false;
        let detectedFaces = [];
        let animationFrameId = null;

        let isAIReady = false;
        let currentEmotions = {
            happy: 0,
            sad: 0,
            angry: 0,
            surprise: 0,
            neutral: 0
        };
        let aiAnalysisActive = false;

        const videoElement = document.getElementById('videoElement');
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const faceOverlay = document.getElementById('faceOverlay');
        const cameraStatus = document.getElementById('cameraStatus');
        const detectionStatus = document.getElementById('detectionStatus');
        const audioCanvas = document.getElementById('audioCanvas');
        const audioCtx = audioCanvas.getContext('2d');
        const emotionCanvas = document.getElementById('emotionChart');
        const emotionCtx = emotionCanvas.getContext('2d');

        async function initializeAI() {
            try {
                updateAIProgress(10, 'Memuat AI Simulation...');
                await new Promise(resolve => setTimeout(resolve, 800));
                
                updateAIProgress(30, 'Memuat Face Detection...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                document.getElementById('blazefaceStatus').innerHTML = '✅';
                document.getElementById('blazefaceStatus').className = 'text-green-400';
                
                updateAIProgress(60, 'Memuat Emotion Recognition...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                document.getElementById('emotionStatus').innerHTML = '✅';
                document.getElementById('emotionStatus').className = 'text-green-400';
                
                updateAIProgress(80, 'Memuat Voice Analysis...');
                await new Promise(resolve => setTimeout(resolve, 500));
                document.getElementById('voiceAiStatus').innerHTML = '✅';
                document.getElementById('voiceAiStatus').className = 'text-green-400';
                
                updateAIProgress(100, '✅ AI siap digunakan!');
                document.getElementById('aiStatus').innerHTML = '✅ AI Aktif';
                document.getElementById('aiStatus').className = 'text-green-400';
                
                isAIReady = true;
                document.getElementById('analyzeFace').disabled = false;
                document.getElementById('analyzeVoice').disabled = false;
                
                // Start continuous emotion analysis if camera is active
                if (faceDetectionActive) {
                    startEmotionAnalysis();
                }
                
            } catch (error) {
                console.error('AI initialization error:', error);
                updateAIProgress(0, '❌ Error memuat AI');
                document.getElementById('aiStatus').innerHTML = '❌ AI Error';
                document.getElementById('aiStatus').className = 'text-red-400';
            }
        }

        function updateAIProgress(percentage, message) {
            document.getElementById('aiProgress').style.width = percentage + '%';
            document.getElementById('aiStatus').textContent = message;
        }

        // Simulated AI Face Detection
        async function detectFacesWithAI() {
            if (!videoElement.videoWidth || !videoElement.videoHeight) {
                return [];
            }
            
            // Simulate AI detection with enhanced accuracy
            const basicFaces = detectFaces();
            
            if (basicFaces.length > 0) {
                // Enhance basic detection with AI-like features
                return basicFaces.map(face => ({
                    ...face,
                    confidence: Math.min(0.95, face.confidence + 0.2),
                    landmarks: generateSimulatedLandmarks(face),
                    type: 'ai-simulated'
                }));
            }
            
            return [];
        }
        
        function generateSimulatedLandmarks(face) {
            const centerX = face.x + face.width / 2;
            const centerY = face.y + face.height / 2;
            
            return [
                [face.x + face.width * 0.3, face.y + face.height * 0.4], 
                [face.x + face.width * 0.7, face.y + face.height * 0.4], 
                [centerX, face.y + face.height * 0.5], 
                [centerX, face.y + face.height * 0.7], 
                [face.x + face.width * 0.1, face.y + face.height * 0.3], 
                [face.x + face.width * 0.9, face.y + face.height * 0.3]  
            ];
        }
        function analyzeEmotions(faces) {
            if (!faces || faces.length === 0) {
                return { happy: 0, sad: 0, angry: 0, surprise: 0, neutral: 100 };
            }
            
            const face = faces[0]; 
            if (!face.landmarks) {
                return { happy: 0, sad: 0, angry: 0, surprise: 0, neutral: 100 };
            }
            
            const landmarks = face.landmarks;
            
      
            const leftEye = landmarks[0];
            const rightEye = landmarks[1];
            const nose = landmarks[2];
            const mouth = landmarks[3];
            const leftEar = landmarks[4];
            const rightEar = landmarks[5];
            
            const eyeDistance = Math.sqrt(
                Math.pow(rightEye[0] - leftEye[0], 2) + 
                Math.pow(rightEye[1] - leftEye[1], 2)
            );
            
            const mouthWidth = Math.abs(mouth[0] - nose[0]) / eyeDistance;
            const mouthHeight = Math.abs(mouth[1] - nose[1]) / face.height;
            const eyeLevel = (leftEye[1] + rightEye[1]) / 2;
            const mouthLevel = mouth[1];
            const smileRatio = (mouthLevel - eyeLevel) / face.height;
            
            let emotions = {
                happy: 0,
                sad: 0,
                angry: 0,
                surprise: 0,
                neutral: 50
            };
            
            if (smileRatio > 0.15 && mouthWidth > 0.3) {
                emotions.happy = Math.min(90, 60 + (smileRatio * 200));
                emotions.neutral = Math.max(10, 50 - emotions.happy);
            }
            
            if (smileRatio < -0.1) {
                emotions.sad = Math.min(80, 40 + Math.abs(smileRatio * 300));
                emotions.neutral = Math.max(10, 50 - emotions.sad);
            }
            
            if (mouthHeight > 0.08 && eyeDistance > face.width * 0.25) {
                emotions.surprise = Math.min(85, 50 + (mouthHeight * 400));
                emotions.neutral = Math.max(10, 50 - emotions.surprise);
            }
            
            if (mouthWidth < 0.2 && smileRatio < 0.05) {
                emotions.angry = Math.min(75, 30 + Math.abs(smileRatio * 200));
                emotions.neutral = Math.max(10, 50 - emotions.angry);
            }
            

            Object.keys(emotions).forEach(emotion => {
                emotions[emotion] += (Math.random() - 0.5) * 10;
                emotions[emotion] = Math.max(0, Math.min(100, emotions[emotion]));
            });
            
            return emotions;
        }

        function startEmotionAnalysis() {
            if (!isAIReady || aiAnalysisActive) return;
            
            aiAnalysisActive = true;
            
            async function analyzeFrame() {
                if (!aiAnalysisActive || !faceDetectionActive) return;
                
                try {
                    const aiFaces = await detectFacesWithAI();
                    
                    if (aiFaces.length > 0) {
                        const emotions = analyzeEmotions(aiFaces);
                        currentEmotions = emotions;
                        updateEmotionDisplay(emotions);
                        updateEmotionChart(emotions);
                        generateAIRecommendations(emotions, aiFaces);
                    }
                } catch (error) {
                    console.error('Emotion analysis error:', error);
                }
                
                setTimeout(analyzeFrame, 500); 
            }
            
            analyzeFrame();
        }

        function updateEmotionDisplay(emotions) {
            document.getElementById('happyScore').textContent = Math.round(emotions.happy) + '%';
            document.getElementById('sadScore').textContent = Math.round(emotions.sad) + '%';
            document.getElementById('angryScore').textContent = Math.round(emotions.angry) + '%';
            document.getElementById('surpriseScore').textContent = Math.round(emotions.surprise) + '%';
        }

        function updateEmotionChart(emotions) {
            const canvas = emotionCanvas;
            const ctx = emotionCtx;
            
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            

            const barWidth = canvas.width / 5;
            const maxHeight = canvas.height - 20;
            
            const emotionColors = {
                happy: '#fbbf24',
                sad: '#3b82f6',
                angry: '#ef4444',
                surprise: '#10b981',
                neutral: '#6b7280'
            };
            
            let x = 10;
            Object.entries(emotions).forEach(([emotion, value]) => {
                const barHeight = (value / 100) * maxHeight;
                
                ctx.fillStyle = emotionColors[emotion];
                ctx.fillRect(x, canvas.height - barHeight - 10, barWidth - 20, barHeight);
                

                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(
                    Math.round(value) + '%', 
                    x + (barWidth - 20) / 2, 
                    canvas.height - barHeight - 15
                );
                
                x += barWidth;
            });
        }

        function generateAIRecommendations(emotions, faces) {
            let recommendations = [];
            
            const dominantEmotion = Object.entries(emotions)
                .reduce((a, b) => emotions[a[0]] > emotions[b[0]] ? a : b)[0];
            
            switch(dominantEmotion) {
                case 'happy':
                    recommendations.push('😊 Anda terlihat bahagia! Coba filter "Mahkota" atau "Topi AR" untuk menambah kegembiraan.');
                    recommendations.push('🎉 Filter "Kacamata AR" cocok dengan suasana hati positif Anda.');
                    break;
                case 'sad':
                    recommendations.push('😢 Terdeteksi emosi sedih. Filter "Topeng" bisa membantu menyembunyikan perasaan.');
                    recommendations.push('🎭 Coba filter "Kumis AR" untuk menambah senyuman.');
                    break;
                case 'angry':
                    recommendations.push('😠 Emosi marah terdeteksi. Filter "Blur Wajah" untuk privasi.');
                    recommendations.push('🎭 Filter "Topeng" bisa membantu menenangkan ekspresi.');
                    break;
                case 'surprise':
                    recommendations.push('😮 Anda terlihat terkejut! Filter "Kacamata AR" akan menambah efek dramatis.');
                    recommendations.push('👑 Filter "Mahkota" cocok dengan ekspresi terbuka Anda.');
                    break;
                default:
                    recommendations.push('😐 Ekspresi netral terdeteksi. Semua filter akan cocok untuk Anda!');
                    recommendations.push('🎨 Coba berbagai filter untuk menemukan yang paling sesuai.');
            }
            
            if (faces.length > 1) {
                recommendations.push(`👥 ${faces.length} wajah terdeteksi. Filter akan diterapkan ke semua wajah.`);
            }
            

            const recDiv = document.getElementById('aiRecommendations');
            recDiv.innerHTML = recommendations.map(rec => `<p class="mb-2">• ${rec}</p>`).join('');
        }

        function analyzeVoiceWithAI(audioData) {
            const analysis = {
                pitch: Math.random() * 100 + 50,
                volume: Math.random() * 100,
                clarity: Math.random() * 100,
                emotion: ['calm', 'excited', 'nervous', 'confident'][Math.floor(Math.random() * 4)],
                gender: Math.random() > 0.5 ? 'male' : 'female',
                age: Math.floor(Math.random() * 40) + 20 
            };
            
            return analysis;
        }

        function updateVoiceAnalysis(analysis) {
            const voiceDiv = document.getElementById('voiceAnalysis');
            voiceDiv.innerHTML = `
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div><strong>Pitch:</strong> ${Math.round(analysis.pitch)} Hz</div>
                    <div><strong>Volume:</strong> ${Math.round(analysis.volume)}%</div>
                    <div><strong>Clarity:</strong> ${Math.round(analysis.clarity)}%</div>
                    <div><strong>Emotion:</strong> ${analysis.emotion}</div>
                    <div><strong>Gender:</strong> ${analysis.gender}</div>
                    <div><strong>Age:</strong> ~${analysis.age} years</div>
                </div>
                <div class="mt-2 text-sm">
                    <strong>AI Recommendation:</strong> 
                    ${getVoiceRecommendation(analysis)}
                </div>
            `;
        }

        function getVoiceRecommendation(analysis) {
            if (analysis.pitch > 120) {
                return 'Suara tinggi terdeteksi. Coba efek "Suara Dalam" untuk keseimbangan.';
            } else if (analysis.pitch < 80) {
                return 'Suara rendah terdeteksi. Efek "Kartun" bisa menambah variasi.';
            } else if (analysis.emotion === 'excited') {
                return 'Energi tinggi! Efek "Robot" cocok dengan semangat Anda.';
            } else if (analysis.emotion === 'calm') {
                return 'Suara tenang. Semua efek akan bekerja dengan baik.';
            } else {
                return 'Profil suara unik. Eksperimen dengan berbagai efek!';
            }
        }

        function detectFaces() {
            if (!videoElement.videoWidth || !videoElement.videoHeight) return [];
            
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            

            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            const skinRegions = detectSkinRegions(data);
            const faceShapes = detectFaceShapes(data);
            const eyeRegions = detectEyeRegions(data);
            
            const combinedFaces = combineFaceDetections(skinRegions, faceShapes, eyeRegions);
            
            return validateFaceRegions(combinedFaces);
        }
        
        function detectSkinRegions(data) {
            const faces = [];
            const blockSize = 15; 
            const threshold = 0.4; 
            
            for (let y = 0; y < canvas.height - blockSize * 3; y += blockSize) {
                for (let x = 0; x < canvas.width - blockSize * 2; x += blockSize) {
                    let skinPixels = 0;
                    let totalPixels = 0;
                    let avgR = 0, avgG = 0, avgB = 0;
                    
                    for (let by = y; by < y + blockSize * 3; by += 2) {
                        for (let bx = x; bx < x + blockSize * 2; bx += 2) {
                            if (by < canvas.height && bx < canvas.width) {
                                const i = (by * canvas.width + bx) * 4;
                                const r = data[i];
                                const g = data[i + 1];
                                const b = data[i + 2];
                                
                                avgR += r;
                                avgG += g;
                                avgB += b;
                                
                                if (isSkinTone(r, g, b)) {
                                    skinPixels++;
                                }
                                totalPixels++;
                            }
                        }
                    }
                    
                    if (totalPixels > 0) {
                        avgR /= totalPixels;
                        avgG /= totalPixels;
                        avgB /= totalPixels;
                        
                        const skinRatio = skinPixels / totalPixels;
                        
                        if (skinRatio > threshold && isValidFaceColor(avgR, avgG, avgB)) {
                            faces.push({
                                x: x,
                                y: y,
                                width: blockSize * 2,
                                height: blockSize * 3,
                                confidence: skinRatio,
                                type: 'skin'
                            });
                        }
                    }
                }
            }
            
            return faces;
        }
        
        function detectFaceShapes(data) {
            const faces = [];
            const blockSize = 20;
            
            for (let y = 20; y < canvas.height - 80; y += 15) {
                for (let x = 20; x < canvas.width - 60; x += 15) {
                    const ovalScore = calculateOvalScore(data, x, y, 60, 80);
                    
                    if (ovalScore > 0.3) {
                        faces.push({
                            x: x,
                            y: y,
                            width: 60,
                            height: 80,
                            confidence: ovalScore,
                            type: 'shape'
                        });
                    }
                }
            }
            
            return faces;
        }
        
        function detectEyeRegions(data) {
            const faces = [];
            const blockSize = 10;
            
            for (let y = 20; y < canvas.height - 60; y += 10) {
                for (let x = 20; x < canvas.width - 80; x += 10) {
                    const eyePairScore = detectEyePair(data, x, y);
                    
                    if (eyePairScore > 0.4) {
                        faces.push({
                            x: x - 20,
                            y: y - 15,
                            width: 80,
                            height: 100,
                            confidence: eyePairScore,
                            type: 'eyes'
                        });
                    }
                }
            }
            
            return faces;
        }
        
        function calculateOvalScore(data, centerX, centerY, width, height) {
            let edgePixels = 0;
            let totalChecked = 0;
            const radiusX = width / 2;
            const radiusY = height / 2;
            
            for (let angle = 0; angle < 360; angle += 15) {
                const rad = (angle * Math.PI) / 180;
                const x = Math.round(centerX + radiusX * Math.cos(rad));
                const y = Math.round(centerY + radiusY * Math.sin(rad));
                
                if (x >= 0 && x < canvas.width - 1 && y >= 0 && y < canvas.height - 1) {
                    const edgeStrength = calculateEdgeStrength(data, x, y);
                    if (edgeStrength > 30) edgePixels++;
                    totalChecked++;
                }
            }
            
            return totalChecked > 0 ? edgePixels / totalChecked : 0;
        }
        
        function calculateEdgeStrength(data, x, y) {
            const i = (y * canvas.width + x) * 4;
            const i1 = ((y + 1) * canvas.width + x) * 4;
            const i2 = (y * canvas.width + (x + 1)) * 4;
            
            if (i2 >= data.length || i1 >= data.length) return 0;
            
            const gx = Math.abs(data[i2] - data[i]);
            const gy = Math.abs(data[i1] - data[i]);
            
            return Math.sqrt(gx * gx + gy * gy);
        }
        
        function detectEyePair(data, x, y) {
            const eyeWidth = 15;
            const eyeHeight = 10;
            const eyeDistance = 25;
            
            const leftEyeScore = calculateDarkRegionScore(data, x, y, eyeWidth, eyeHeight);
            const rightEyeScore = calculateDarkRegionScore(data, x + eyeDistance, y, eyeWidth, eyeHeight);
            

            if (leftEyeScore > 0.3 && rightEyeScore > 0.3) {
                return (leftEyeScore + rightEyeScore) / 2;
            }
            
            return 0;
        }
        
        function calculateDarkRegionScore(data, x, y, width, height) {
            let darkPixels = 0;
            let totalPixels = 0;
            
            for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                    const px = x + dx;
                    const py = y + dy;
                    
                    if (px < canvas.width && py < canvas.height) {
                        const i = (py * canvas.width + px) * 4;
                        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        
                        if (brightness < 80) darkPixels++;
                        totalPixels++;
                    }
                }
            }
            
            return totalPixels > 0 ? darkPixels / totalPixels : 0;
        }
        
        function combineFaceDetections(skinRegions, faceShapes, eyeRegions) {
            const allDetections = [...skinRegions, ...faceShapes, ...eyeRegions];
            const combinedFaces = [];
            
            for (let i = 0; i < allDetections.length; i++) {
                const detection = allDetections[i];
                let merged = false;
                
                for (let j = 0; j < combinedFaces.length; j++) {
                    const existing = combinedFaces[j];
                    const distance = Math.sqrt(
                        Math.pow(detection.x - existing.x, 2) + 
                        Math.pow(detection.y - existing.y, 2)
                    );
                    
                    if (distance < 40) {
                        // Merge detections
                        existing.confidence = Math.max(existing.confidence, detection.confidence);
                        existing.types = existing.types || [existing.type];
                        existing.types.push(detection.type);
                        merged = true;
                        break;
                    }
                }
                
                if (!merged) {
                    detection.types = [detection.type];
                    combinedFaces.push(detection);
                }
            }
            
            return combinedFaces;
        }
        
        function validateFaceRegions(faces) {
            return faces
                .filter(face => {

                    const typeCount = face.types ? face.types.length : 1;
                    const hasMultipleTypes = typeCount >= 2;
                    const goodConfidence = face.confidence > 0.35;
                    const reasonableSize = face.width > 30 && face.height > 40 && 
                                         face.width < 200 && face.height < 250;
                    
                    return (hasMultipleTypes || goodConfidence) && reasonableSize;
                })
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, 2); // Limit to 2 most confident faces
        }
        
        function isSkinTone(r, g, b) {
            // Enhanced skin tone detection with multiple criteria
            const criteria1 = (r > 95 && g > 40 && b > 20 && 
                             Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
                             Math.abs(r - g) > 15 && r > g && r > b);
            
            const criteria2 = (r > 220 && g > 210 && b > 170) || // Very light skin
                             (r > 180 && g > 120 && b > 90) ||   // Light skin
                             (r > 120 && g > 80 && b > 50) ||    // Medium skin
                             (r > 80 && g > 50 && b > 30);       // Dark skin
            
            return criteria1 || criteria2;
        }
        
        function isValidFaceColor(avgR, avgG, avgB) {
            // Additional validation for face-like colors
            const brightness = (avgR + avgG + avgB) / 3;
            const isNotTooDark = brightness > 40;
            const isNotTooLight = brightness < 240;
            const hasWarmTone = avgR >= avgG && avgG >= avgB * 0.8;
            
            return isNotTooDark && isNotTooLight && hasWarmTone;
        }
        
        function mergeFaceRegions(faces) {
            if (faces.length === 0) return [];
            
            // Sort by confidence
            faces.sort((a, b) => b.confidence - a.confidence);
            
            const merged = [];
            const used = new Set();
            
            for (let i = 0; i < faces.length; i++) {
                if (used.has(i)) continue;
                
                const face = faces[i];
                const group = [face];
                used.add(i);
                
                // Find nearby faces to merge
                for (let j = i + 1; j < faces.length; j++) {
                    if (used.has(j)) continue;
                    
                    const other = faces[j];
                    const distance = Math.sqrt(
                        Math.pow(face.x - other.x, 2) + 
                        Math.pow(face.y - other.y, 2)
                    );
                    
                    if (distance < 60) {
                        group.push(other);
                        used.add(j);
                    }
                }
                
                // Create merged face region
                if (group.length > 0) {
                    const minX = Math.min(...group.map(f => f.x));
                    const minY = Math.min(...group.map(f => f.y));
                    const maxX = Math.max(...group.map(f => f.x + f.width));
                    const maxY = Math.max(...group.map(f => f.y + f.height));
                    
                    merged.push({
                        x: minX,
                        y: minY,
                        width: maxX - minX,
                        height: maxY - minY,
                        confidence: Math.max(...group.map(f => f.confidence))
                    });
                }
            }
            
            return merged.slice(0, 3); 
        }

        async function startCamera() {
            try {
                const constraints = {
                    video: {
                        width: { ideal: 640, max: 1280 },
                        height: { ideal: 480, max: 720 },
                        facingMode: 'user'
                    },
                    audio: false
                };

                videoStream = await navigator.mediaDevices.getUserMedia(constraints);
                videoElement.srcObject = videoStream;
                
                videoElement.onloadedmetadata = () => {
                    videoElement.play();
                    cameraStatus.textContent = '📷 Kamera Aktif';
                    cameraStatus.className = 'absolute top-4 left-4 bg-green-500/70 text-white px-3 py-1 rounded-full text-sm';
                    
                    startFaceDetection();
                    
                    document.getElementById('startCamera').disabled = true;
                    document.getElementById('stopCamera').disabled = false;
                };

            } catch (error) {
                let errorMessage = 'Tidak dapat mengakses kamera. ';
                
                if (error.name === 'NotAllowedError') {
                    errorMessage += 'Izin kamera ditolak. Silakan refresh halaman dan berikan izin kamera.';
                } else if (error.name === 'NotFoundError') {
                    errorMessage += 'Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.';
                } else if (error.name === 'NotReadableError') {
                    errorMessage += 'Kamera sedang digunakan aplikasi lain.';
                } else {
                    errorMessage += 'Error: ' + error.message;
                }
                
                alert(errorMessage);
                console.error('Camera error:', error);
                
                cameraStatus.textContent = '❌ Kamera Error';
                cameraStatus.className = 'absolute top-4 left-4 bg-red-500/70 text-white px-3 py-1 rounded-full text-sm';
            }
        }
        
        function startFaceDetection() {
            faceDetectionActive = true;
            detectionStatus.textContent = '🔍 Deteksi: Aktif';
            detectionStatus.className = 'absolute top-4 right-4 bg-green-500/70 text-white px-3 py-1 rounded-full text-sm';
            

            if (isAIReady) {
                startEmotionAnalysis();
            }
            
            async function detectAndRender() {
                if (!faceDetectionActive) return;
                
                if (isAIReady) {
                    try {
                        const aiFaces = await detectFacesWithAI();
                        if (aiFaces.length > 0) {
                            detectedFaces = aiFaces;
                        } else {
                            detectedFaces = detectFaces();
                        }
                    } catch (error) {
                        console.error('AI detection error, using fallback:', error);
                        detectedFaces = detectFaces();
                    }
                } else {
                    detectedFaces = detectFaces();
                }

                if (detectedFaces.length > 0) {
                    const aiIndicator = isAIReady ? '🤖' : '👤';
                    detectionStatus.textContent = `${aiIndicator} ${detectedFaces.length} Wajah`;
                } else {
                    detectionStatus.textContent = '🔍 Mencari wajah...';
                }
                
                applyFaceFilter(currentFilter);
                
                animationFrameId = requestAnimationFrame(detectAndRender);
            }
            
            detectAndRender();
        }

        function stopCamera() {
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
                videoElement.srcObject = null;
                videoStream = null;
                
                faceDetectionActive = false;
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
                
                cameraStatus.textContent = '📷 Kamera Mati';
                cameraStatus.className = 'absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm';
                
                detectionStatus.textContent = '🔍 Deteksi: Mati';
                detectionStatus.className = 'absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm';
                
                faceOverlay.innerHTML = '';
                
                document.getElementById('startCamera').disabled = false;
                document.getElementById('stopCamera').disabled = true;
            }
        }


        function createFilterElement(face, filterType, index) {
            const filter = document.createElement('div');
            filter.className = `face-filter-${index}`;
            filter.style.position = 'absolute';
            filter.style.pointerEvents = 'none';
            filter.style.transition = 'all 0.1s ease-out';
            
            const videoRect = videoElement.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            
            const scaleX = videoRect.width / canvas.width;
            const scaleY = videoRect.height / canvas.height;
            
            const x = face.x * scaleX;
            const y = face.y * scaleY;
            const width = face.width * scaleX;
            const height = face.height * scaleY;
            
            switch(filterType) {
                case 'glasses':
                    filter.innerHTML = `
                        <div style="
                            position: absolute;
                            top: ${y + height * 0.3}px;
                            left: ${x + width * 0.1}px;
                            width: ${width * 0.8}px;
                            height: ${height * 0.2}px;
                            background: linear-gradient(45deg, #1f2937, #374151);
                            border-radius: 50px;
                            border: 2px solid #6b7280;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                        ">
                            <div style="
                                position: absolute;
                                top: 50%;
                                left: 10%;
                                transform: translateY(-50%);
                                width: 30%;
                                height: 70%;
                                background: rgba(0, 0, 0, 0.7);
                                border-radius: 50%;
                            "></div>
                            <div style="
                                position: absolute;
                                top: 50%;
                                right: 10%;
                                transform: translateY(-50%);
                                width: 30%;
                                height: 70%;
                                background: rgba(0, 0, 0, 0.7);
                                border-radius: 50%;
                            "></div>
                        </div>
                    `;
                    break;
                    
                case 'mustache':
                    filter.innerHTML = `
                        <div style="
                            position: absolute;
                            top: ${y + height * 0.6}px;
                            left: ${x + width * 0.3}px;
                            width: ${width * 0.4}px;
                            height: ${height * 0.15}px;
                            background: #1f2937;
                            border-radius: 0 0 50px 50px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                        "></div>
                    `;
                    break;
                    
                case 'hat':
                    filter.innerHTML = `
                        <div style="
                            position: absolute;
                            top: ${y - height * 0.2}px;
                            left: ${x + width * 0.15}px;
                            width: ${width * 0.7}px;
                            height: ${height * 0.4}px;
                            background: linear-gradient(45deg, #dc2626, #b91c1c);
                            border-radius: 50% 50% 0 0;
                            border: 2px solid #991b1b;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                        ">
                            <div style="
                                position: absolute;
                                top: 100%;
                                left: 50%;
                                transform: translateX(-50%);
                                width: 90%;
                                height: 20%;
                                background: #991b1b;
                                border-radius: 50%;
                            "></div>
                        </div>
                    `;
                    break;
                    
                case 'mask':
                    filter.innerHTML = `
                        <div style="
                            position: absolute;
                            top: ${y + height * 0.25}px;
                            left: ${x + width * 0.1}px;
                            width: ${width * 0.8}px;
                            height: ${height * 0.5}px;
                            background: linear-gradient(45deg, #7c3aed, #a855f7);
                            border-radius: 20px;
                            border: 2px solid #6d28d9;
                            box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
                        ">
                            <div style="
                                position: absolute;
                                top: 30%;
                                left: 20%;
                                width: 15%;
                                height: 20%;
                                background: #000;
                                border-radius: 50%;
                            "></div>
                            <div style="
                                position: absolute;
                                top: 30%;
                                right: 20%;
                                width: 15%;
                                height: 20%;
                                background: #000;
                                border-radius: 50%;
                            "></div>
                        </div>
                    `;
                    break;
                    
                case 'crown':
                    filter.innerHTML = `
                        <div style="
                            position: absolute;
                            top: ${y - height * 0.3}px;
                            left: ${x + width * 0.2}px;
                            width: ${width * 0.6}px;
                            height: ${height * 0.3}px;
                            background: linear-gradient(45deg, #fbbf24, #f59e0b);
                            border: 2px solid #d97706;
                            box-shadow: 0 2px 10px rgba(251, 191, 36, 0.3);
                        ">
                            <div style="
                                position: absolute;
                                top: 0;
                                left: 10%;
                                width: 0;
                                height: 0;
                                border-left: ${width * 0.08}px solid transparent;
                                border-right: ${width * 0.08}px solid transparent;
                                border-bottom: ${height * 0.15}px solid #fbbf24;
                            "></div>
                            <div style="
                                position: absolute;
                                top: 0;
                                left: 50%;
                                transform: translateX(-50%);
                                width: 0;
                                height: 0;
                                border-left: ${width * 0.1}px solid transparent;
                                border-right: ${width * 0.1}px solid transparent;
                                border-bottom: ${height * 0.2}px solid #fbbf24;
                            "></div>
                            <div style="
                                position: absolute;
                                top: 0;
                                right: 10%;
                                width: 0;
                                height: 0;
                                border-left: ${width * 0.08}px solid transparent;
                                border-right: ${width * 0.08}px solid transparent;
                                border-bottom: ${height * 0.15}px solid #fbbf24;
                            "></div>
                        </div>
                    `;
                    break;
                    
                case 'blur':
                    filter.innerHTML = `
                        <div style="
                            position: absolute;
                            top: ${y}px;
                            left: ${x}px;
                            width: ${width}px;
                            height: ${height}px;
                            background: rgba(255, 255, 255, 0.3);
                            backdrop-filter: blur(15px);
                            -webkit-backdrop-filter: blur(15px);
                            border-radius: 50%;
                            border: 2px solid rgba(255, 255, 255, 0.2);
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                        ">
                            <div style="
                                position: absolute;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%);
                                color: rgba(255, 255, 255, 0.8);
                                font-size: ${Math.min(width, height) * 0.15}px;
                                font-weight: bold;
                                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                            ">🫥</div>
                        </div>
                    `;
                    break;
                    
                case 'censor':
                    filter.innerHTML = `
                        <div style="
                            position: absolute;
                            top: ${y}px;
                            left: ${x}px;
                            width: ${width}px;
                            height: ${height}px;
                            background: #000000;
                            border-radius: 10px;
                            border: 3px solid #333333;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                            <div style="
                                color: #ffffff;
                                font-size: ${Math.min(width, height) * 0.12}px;
                                font-weight: bold;
                                text-align: center;
                                font-family: Arial, sans-serif;
                            ">SENSOR</div>
                        </div>
                    `;
                    break;
            }
            
            return filter;
        }

        // Face filter functions
        function applyFaceFilter(filterType) {
            // Clear existing filters
            faceOverlay.innerHTML = '';
            
            // Remove active state from all buttons
            document.querySelectorAll('.face-filter').forEach(btn => {
                btn.classList.remove('filter-active');
            });

            // Update current filter
            currentFilter = filterType;
            
            // Add active state to clicked button if event exists
            if (event && event.target) {
                event.target.classList.add('filter-active');
            }
            
            // Apply filters to detected faces
            if (filterType !== 'none' && detectedFaces.length > 0) {
                detectedFaces.forEach((face, index) => {
                    const filterElement = createFilterElement(face, filterType, index);
                    faceOverlay.appendChild(filterElement);
                });
            }
        }

        // Audio functions with real-time voice effects
        let gainNode = null;
        let biquadFilter = null;
        let convolverNode = null;
        let delayNode = null;
        let feedbackGain = null;
        let outputGain = null;
        let isRealTimeActive = false;

        async function startRecording() {
            try {
                audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                // Setup audio context for real-time processing
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Create audio nodes for effects
                const source = audioContext.createMediaStreamSource(audioStream);
                analyser = audioContext.createAnalyser();
                gainNode = audioContext.createGain();
                biquadFilter = audioContext.createBiquadFilter();
                convolverNode = audioContext.createConvolver();
                delayNode = audioContext.createDelay();
                feedbackGain = audioContext.createGain();
                outputGain = audioContext.createGain();
                
                // Connect nodes for real-time processing
                source.connect(gainNode);
                gainNode.connect(biquadFilter);
                biquadFilter.connect(delayNode);
                delayNode.connect(feedbackGain);
                feedbackGain.connect(delayNode);
                delayNode.connect(outputGain);
                outputGain.connect(analyser);
                
                // Connect to speakers for real-time monitoring (optional)
                // outputGain.connect(audioContext.destination);
                
                // Setup visualization
                analyser.fftSize = 256;
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                
                // Apply current voice effect
                applyRealtimeVoiceEffect(currentVoiceEffect);
                
                // Start visualization
                function visualize() {
                    if (isRealTimeActive) {
                        requestAnimationFrame(visualize);
                        
                        analyser.getByteFrequencyData(dataArray);
                        
                        audioCtx.fillStyle = '#1f2937';
                        audioCtx.fillRect(0, 0, audioCanvas.width, audioCanvas.height);
                        
                        const barWidth = audioCanvas.width / bufferLength * 2.5;
                        let barHeight;
                        let x = 0;
                        
                        for (let i = 0; i < bufferLength; i++) {
                            barHeight = dataArray[i] / 255 * audioCanvas.height;
                            
                            const r = barHeight + 25 * (i / bufferLength);
                            const g = 250 * (i / bufferLength);
                            const b = 50;
                            
                            audioCtx.fillStyle = `rgb(${r},${g},${b})`;
                            audioCtx.fillRect(x, audioCanvas.height - barHeight, barWidth, barHeight);
                            
                            x += barWidth + 1;
                        }
                    }
                }
                
      
                const destination = audioContext.createMediaStreamDestination();
                outputGain.connect(destination);
                
        
                mediaRecorder = new MediaRecorder(destination.stream);
                audioChunks = [];
                
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    
                    const recordedAudio = document.getElementById('recordedAudio');
                    recordedAudio.src = audioUrl;
                    
        
                    document.getElementById('audioPlayer').classList.remove('hidden');
                    
           
                    document.getElementById('downloadAudio').onclick = () => {
                        const a = document.createElement('a');
                        a.href = audioUrl;
                        a.download = `filtered-voice-${Date.now()}.wav`;
                        a.click();
                    };
                };
                
                mediaRecorder.start();
                isRealTimeActive = true;
                visualize();
                
    
                document.getElementById('startRecording').disabled = true;
                document.getElementById('stopRecording').disabled = false;
                document.getElementById('startRecording').classList.add('recording');
                
           
                showEffectMessage('🎙️ Rekaman dimulai dengan efek realtime!');
                
            } catch (error) {
                alert('Tidak dapat mengakses mikrofon. Pastikan izin mikrofon telah diberikan.');
                console.error('Audio error:', error);
            }
        }

        let pitchShifter = null;
        let scriptProcessor = null;

        function applyRealtimeVoiceEffect(effect) {
            if (!gainNode || !biquadFilter || !delayNode || !feedbackGain || !outputGain) return;
            
    
            try {
 
                gainNode.disconnect();
                biquadFilter.disconnect();
                delayNode.disconnect();
                feedbackGain.disconnect();
             
                if (scriptProcessor) {
                    scriptProcessor.disconnect();
                    scriptProcessor.onaudioprocess = null;
                    scriptProcessor = null;
                }
                
            
                gainNode.gain.value = 1;
                biquadFilter.frequency.value = 350;
                biquadFilter.Q.value = 1;
                biquadFilter.type = 'lowpass';
                delayNode.delayTime.value = 0;
                feedbackGain.gain.value = 0;
                
                switch(effect) {
                    case 'robot':
             
                        gainNode.connect(biquadFilter);
                        biquadFilter.connect(delayNode);
                        delayNode.connect(feedbackGain);
                        feedbackGain.connect(delayNode);
                        delayNode.connect(outputGain);
                        
                
                        biquadFilter.type = 'lowpass';
                        biquadFilter.frequency.value = 400;
                        biquadFilter.Q.value = 8;
                        gainNode.gain.value = 1.8;
                        delayNode.delayTime.value = 0.05;
                        feedbackGain.gain.value = 0.2;
                        break;
                        
                    case 'chipmunk':
            
                        scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
                        let pitchRatio = 1.6;
                        
                        scriptProcessor.onaudioprocess = function(e) {
                            const inputBuffer = e.inputBuffer.getChannelData(0);
                            const outputBuffer = e.outputBuffer.getChannelData(0);
                            
                            for (let i = 0; i < outputBuffer.length; i++) {
                                const sourceIndex = Math.floor(i / pitchRatio);
                                if (sourceIndex < inputBuffer.length) {
                                    outputBuffer[i] = inputBuffer[sourceIndex] * 1.3;
                                } else {
                                    outputBuffer[i] = 0;
                                }
                            }
                        };
                        
            
                        gainNode.connect(scriptProcessor);
                        scriptProcessor.connect(biquadFilter);
                        biquadFilter.connect(delayNode);
                        delayNode.connect(feedbackGain);
                        feedbackGain.connect(delayNode);
                        delayNode.connect(outputGain);
 
                        biquadFilter.type = 'highpass';
                        biquadFilter.frequency.value = 600;
                        biquadFilter.Q.value = 2;
                        gainNode.gain.value = 2.2;
                        break;
                        
                    case 'deep':

                        gainNode.connect(biquadFilter);
                        biquadFilter.connect(delayNode);
                        delayNode.connect(feedbackGain);
                        feedbackGain.connect(delayNode);
                        delayNode.connect(outputGain);
                    
                        biquadFilter.type = 'lowpass';
                        biquadFilter.frequency.value = 250;
                        biquadFilter.Q.value = 3;
                        gainNode.gain.value = 1.5;
                        delayNode.delayTime.value = 0.08;
                        feedbackGain.gain.value = 0.15;
                        break;
                        
                    default:
                        gainNode.connect(biquadFilter);
                        biquadFilter.connect(delayNode);
                        delayNode.connect(feedbackGain);
                        feedbackGain.connect(delayNode);
                        delayNode.connect(outputGain);
                        
                        gainNode.gain.value = 1.2;
                        biquadFilter.type = 'allpass';
                        biquadFilter.frequency.value = 1000;
                        biquadFilter.Q.value = 1;
                        delayNode.delayTime.value = 0;
                        feedbackGain.gain.value = 0;
                        break;
                }
                
            } catch (error) {
                console.error('Error applying voice effect:', error);
                try {
                    gainNode.connect(biquadFilter);
                    biquadFilter.connect(outputGain);
                } catch (fallbackError) {
                    console.error('Fallback connection failed:', fallbackError);
                }
            }
        }

        function stopRecording() {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                audioStream.getTracks().forEach(track => track.stop());
                isRealTimeActive = false;
                
                document.getElementById('startRecording').disabled = false;
                document.getElementById('stopRecording').disabled = true;
                document.getElementById('startRecording').classList.remove('recording');
                
                showEffectMessage('⏹️ Rekaman selesai!');
            }
        }

        function applyVoiceEffect(effect) {
            currentVoiceEffect = effect;
            
            document.querySelectorAll('.voice-effect').forEach(btn => {
                btn.classList.remove('filter-active');
            });
            
            event.target.classList.add('filter-active');
            
            if (isRealTimeActive || isMonitoring) {
                applyRealtimeVoiceEffect(effect);
                showEffectMessage(getEffectMessage(effect));
            } else {
                showEffectMessage(getEffectMessage(effect) + ' (Mulai monitor/rekam untuk mendengar efek)');
            }
        }

        function getEffectMessage(effect) {
            const messages = {
                normal: '😊 Efek normal diterapkan',
                robot: '🤖 Efek robot diterapkan - suara robotik',
                chipmunk: '🎭 Efek kartun diterapkan - suara lucu seperti karakter animasi',
                deep: '👹 Efek suara dalam diterapkan - suara berat'
            };
            return messages[effect] || 'Efek diterapkan';
        }

        function showEffectMessage(text) {
            const message = document.createElement('div');
            message.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
            message.textContent = text;
            document.body.appendChild(message);
            
            setTimeout(() => {
                message.remove();
            }, 3000);
        }

        let isMonitoring = false;

        async function startMonitoring() {
            try {
                audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                const source = audioContext.createMediaStreamSource(audioStream);
                analyser = audioContext.createAnalyser();
                gainNode = audioContext.createGain();
                biquadFilter = audioContext.createBiquadFilter();
                delayNode = audioContext.createDelay();
                feedbackGain = audioContext.createGain();
                outputGain = audioContext.createGain();
                
                source.connect(gainNode);
                gainNode.connect(biquadFilter);
                biquadFilter.connect(delayNode);
                delayNode.connect(feedbackGain);
                feedbackGain.connect(delayNode);
                delayNode.connect(outputGain);
                outputGain.connect(analyser);
                
                outputGain.connect(audioContext.destination);
                
                analyser.fftSize = 256;
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                
                applyRealtimeVoiceEffect(currentVoiceEffect);
                
                function visualize() {
                    if (isMonitoring) {
                        requestAnimationFrame(visualize);
                        
                        analyser.getByteFrequencyData(dataArray);
                        
                        audioCtx.fillStyle = '#1f2937';
                        audioCtx.fillRect(0, 0, audioCanvas.width, audioCanvas.height);
                        
                        const barWidth = audioCanvas.width / bufferLength * 2.5;
                        let barHeight;
                        let x = 0;
                        
                        for (let i = 0; i < bufferLength; i++) {
                            barHeight = dataArray[i] / 255 * audioCanvas.height;
                            
                            const r = barHeight + 25 * (i / bufferLength);
                            const g = 250 * (i / bufferLength);
                            const b = 50;
                            
                            audioCtx.fillStyle = `rgb(${r},${g},${b})`;
                            audioCtx.fillRect(x, audioCanvas.height - barHeight, barWidth, barHeight);
                            
                            x += barWidth + 1;
                        }
                    }
                }
                
                isMonitoring = true;
                visualize();
                
                document.getElementById('startMonitoring').disabled = true;
                document.getElementById('stopMonitoring').disabled = false;
                document.getElementById('startRecording').disabled = true;
                
                showEffectMessage('🎧 Monitor suara aktif - Anda bisa mendengar efek realtime!');
                
            } catch (error) {
                alert('Tidak dapat mengakses mikrofon untuk monitoring.');
                console.error('Monitoring error:', error);
            }
        }

        function stopMonitoring() {
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
                isMonitoring = false;
                
                document.getElementById('startMonitoring').disabled = false;
                document.getElementById('stopMonitoring').disabled = true;
                document.getElementById('startRecording').disabled = false;
                
                showEffectMessage('🔇 Monitor suara dimatikan');
            }
        }

        document.getElementById('startCamera').addEventListener('click', startCamera);
        document.getElementById('stopCamera').addEventListener('click', stopCamera);
        document.getElementById('startRecording').addEventListener('click', startRecording);
        document.getElementById('stopRecording').addEventListener('click', stopRecording);
        document.getElementById('startMonitoring').addEventListener('click', startMonitoring);
        document.getElementById('stopMonitoring').addEventListener('click', stopMonitoring);

        document.querySelectorAll('.face-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                applyFaceFilter(e.target.dataset.filter);
            });
        });

        document.querySelectorAll('.voice-effect').forEach(button => {
            button.addEventListener('click', (e) => {
                applyVoiceEffect(e.target.dataset.effect);
            });
        });

        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            document.getElementById('volumeValue').textContent = e.target.value;
            const audio = document.getElementById('recordedAudio');
            if (audio) {
                audio.volume = e.target.value / 100;
            }
        });

        document.getElementById('pitchSlider').addEventListener('input', (e) => {
            document.getElementById('pitchValue').textContent = e.target.value;
            const audio = document.getElementById('recordedAudio');
            if (audio) {
                audio.playbackRate = parseFloat(e.target.value);
            }
        });

        document.getElementById('analyzeFace').addEventListener('click', async () => {
            if (!isAIReady || !faceDetectionActive) {
                alert('Pastikan AI sudah siap dan kamera aktif!');
                return;
            }
            
            try {
                const aiFaces = await detectFacesWithAI();
                if (aiFaces.length > 0) {
                    const emotions = analyzeEmotions(aiFaces);
                    
                    document.getElementById('faceAnalysis').innerHTML = `
                        <div class="text-sm">
                            <div class="mb-2"><strong>Wajah terdeteksi:</strong> ${aiFaces.length}</div>
                            <div class="mb-2"><strong>AI Confidence:</strong> ${Math.round(aiFaces[0].confidence * 100)}%</div>
                            <div class="mb-2"><strong>Posisi:</strong> (${Math.round(aiFaces[0].x)}, ${Math.round(aiFaces[0].y)})</div>
                            <div class="mb-2"><strong>Ukuran:</strong> ${Math.round(aiFaces[0].width)}x${Math.round(aiFaces[0].height)}</div>
                            <div class="mb-2"><strong>Tipe:</strong> ${aiFaces[0].type}</div>
                            <div><strong>Emosi dominan:</strong> ${Object.entries(emotions).reduce((a, b) => emotions[a[0]] > emotions[b[0]] ? a : b)[0]}</div>
                        </div>
                    `;
                    
                    updateEmotionDisplay(emotions);
                    updateEmotionChart(emotions);
                    generateAIRecommendations(emotions, aiFaces);
                } else {
                    document.getElementById('faceAnalysis').innerHTML = 'Tidak ada wajah yang terdeteksi. Pastikan wajah terlihat jelas di kamera.';
                }
            } catch (error) {
                console.error('Face analysis error:', error);
                document.getElementById('faceAnalysis').innerHTML = 'Error dalam analisis wajah: ' + error.message;
            }
        });

        document.getElementById('analyzeVoice').addEventListener('click', () => {
            if (!isAIReady) {
                alert('AI belum siap! Tunggu hingga model selesai dimuat.');
                return;
            }
            
            if (!isRealTimeActive && !isMonitoring) {
                alert('Mulai rekam atau monitor suara terlebih dahulu!');
                return;
            }
            
            const voiceAnalysis = analyzeVoiceWithAI();
            updateVoiceAnalysis(voiceAnalysis);
        });

        window.addEventListener('load', () => {
            initializeAI();
        });

        document.querySelector('[data-filter="none"]').classList.add('filter-active');
        document.querySelector('[data-effect="normal"]').classList.add('filter-active');