
 let videoStream = null;
        let audioStream = null;
        let mediaRecorder = null;
        let audioChunks = [];
        let audioContext = null;
        let analyser = null;
        let currentVoiceEffect = 'normal';
        let faceDetectionActive = false;
        let detectedFaces = [];

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
         let stream = null;
        let currentFilter = 'none';
        let animationFrameId = null;
        let isStreaming = false;

        const video = document.getElementById('videoElement');
        const startBtn = document.getElementById('startCamera');
        const stopBtn = document.getElementById('stopCamera');
        const captureBtn = document.getElementById('captureBtn');
        const filterStatus = document.getElementById('filterStatus');
        const cameraPlaceholder = document.getElementById('cameraPlaceholder');
        const faceIndicator = document.getElementById('faceIndicator');
        const capturedPreview = document.getElementById('capturedPreview');
        const capturedImage = document.getElementById('capturedImage');
        const downloadLink = document.getElementById('downloadLink');
        const closePreview = document.getElementById('closePreview');
        const filterButtons = document.querySelectorAll('.face-filter');

        const filterNames = {
            'none': 'Normal',
            'glasses': 'Kacamata',
            'mustache': 'Kumis',
            'hat': 'Topi',
            'crown': 'Mahkota',
            'mask': 'Topeng',
            'blur': 'Blur',
            'pixel': 'Pixel'
        };

        
        if (window.elementSdk) {
            window.elementSdk.init({
                defaultConfig,
                onConfigChange: async (config) => {
                    document.getElementById('appTitle').textContent = '🎭 ' + (config.app_title || defaultConfig.app_title);
                },
                mapToCapabilities: (config) => ({
                    recolorables: [],
                    borderables: [],
                    fontEditable: undefined,
                    fontSizeable: undefined
                }),
                mapToEditPanelValues: (config) => new Map([
                    ['app_title', config.app_title || defaultConfig.app_title]
                ])
            });
        }

        // Start Camera
        async function startCamera() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false
                });

                video.srcObject = stream;
                
                video.onloadedmetadata = () => {
                    video.play();
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    isStreaming = true;
                    updateUI(true);
                    renderLoop();
                };

            } catch (err) {
                console.error('Camera error:', err);
                cameraStatus.textContent = '❌ Error: ' + err.message;
                
                // Show more specific error messages
                if (err.name === 'NotAllowedError') {
                    cameraStatus.textContent = '🚫 Izin kamera ditolak';
                } else if (err.name === 'NotFoundError') {
                    cameraStatus.textContent = '📷 Kamera tidak ditemukan';
                } else if (err.name === 'NotReadableError') {
                    cameraStatus.textContent = '⚠️ Kamera sedang digunakan';
                }
            }
        }

        // Stop Camera
        function stopCamera() {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
            video.srcObject = null;
            isStreaming = false;
            
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            updateUI(false);
        }

        // Update UI based on camera state
        function updateUI(isActive) {
            if (isActive) {
                cameraStatus.textContent = '🟢 Kamera Aktif';
                startBtn.disabled = true;
                startBtn.classList.add('opacity-50', 'cursor-not-allowed');
                stopBtn.disabled = false;
                stopBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                captureBtn.disabled = false;
                captureBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                cameraPlaceholder.classList.add('hidden');
                video.parentElement.classList.add('camera-active');
                
                if (currentFilter !== 'none') {
                    faceIndicator.classList.remove('hidden');
                }
            } else {
                cameraStatus.textContent = '📷 Kamera Mati';
                startBtn.disabled = false;
                startBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                stopBtn.disabled = true;
                stopBtn.classList.add('opacity-50', 'cursor-not-allowed');
                captureBtn.disabled = true;
                captureBtn.classList.add('opacity-50', 'cursor-not-allowed');
                cameraPlaceholder.classList.remove('hidden');
                video.parentElement.classList.remove('camera-active');
                faceIndicator.classList.add('hidden');
            }
        }

        // Render Loop for filters
        function renderLoop() {
            if (!isStreaming) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (currentFilter !== 'none') {
                applyFilter();
            }

            animationFrameId = requestAnimationFrame(renderLoop);
        }

        // Apply selected filter
        function applyFilter() {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const faceWidth = canvas.width * 0.35;
            const faceHeight = canvas.height * 0.45;

            ctx.save();

            switch (currentFilter) {
                case 'glasses':
                    drawGlasses(centerX, centerY - faceHeight * 0.1, faceWidth);
                    break;
                case 'mustache':
                    drawMustache(centerX, centerY + faceHeight * 0.15, faceWidth * 0.5);
                    break;
                case 'hat':
                    drawHat(centerX, centerY - faceHeight * 0.45, faceWidth);
                    break;
                case 'crown':
                    drawCrown(centerX, centerY - faceHeight * 0.5, faceWidth * 0.8);
                    break;
                case 'mask':
                    drawMask(centerX, centerY, faceWidth);
                    break;
                case 'blur':
                    drawBlurEffect(centerX, centerY, faceWidth * 0.7);
                    break;
                case 'pixel':
                    drawPixelEffect(centerX, centerY, faceWidth * 0.7);
                    break;
            }

            ctx.restore();
        }

        // Draw cool glasses
        function drawGlasses(x, y, width) {
            const glassWidth = width * 0.35;
            const glassHeight = width * 0.2;
            const gap = width * 0.08;

            // Frame gradient
            const gradient = ctx.createLinearGradient(x - width/2, y, x + width/2, y);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(0.5, '#16213e');
            gradient.addColorStop(1, '#1a1a2e');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';

            // Left lens
            ctx.beginPath();
            ctx.roundRect(x - glassWidth - gap, y - glassHeight/2, glassWidth, glassHeight, 15);
            ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
            ctx.fill();
            ctx.stroke();

            // Right lens
            ctx.beginPath();
            ctx.roundRect(x + gap, y - glassHeight/2, glassWidth, glassHeight, 15);
            ctx.fill();
            ctx.stroke();

            // Bridge
            ctx.beginPath();
            ctx.moveTo(x - gap, y);
            ctx.lineTo(x + gap, y);
            ctx.stroke();

            // Temples
            ctx.beginPath();
            ctx.moveTo(x - glassWidth - gap, y);
            ctx.lineTo(x - width * 0.55, y - 10);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + gap + glassWidth, y);
            ctx.lineTo(x + width * 0.55, y - 10);
            ctx.stroke();

            // Lens shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.ellipse(x - glassWidth/2 - gap, y - glassHeight * 0.2, glassWidth * 0.15, glassHeight * 0.15, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x + gap + glassWidth/2, y - glassHeight * 0.2, glassWidth * 0.15, glassHeight * 0.15, -0.3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw fancy mustache
        function drawMustache(x, y, width) {
            ctx.fillStyle = '#2d1810';
            ctx.strokeStyle = '#1a0f0a';
            ctx.lineWidth = 2;

            // Left side
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.bezierCurveTo(x - width * 0.3, y - 15, x - width * 0.6, y - 25, x - width, y - 10);
            ctx.bezierCurveTo(x - width * 0.8, y + 5, x - width * 0.4, y + 15, x, y + 5);
            ctx.fill();
            ctx.stroke();

            // Right side
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.bezierCurveTo(x + width * 0.3, y - 15, x + width * 0.6, y - 25, x + width, y - 10);
            ctx.bezierCurveTo(x + width * 0.8, y + 5, x + width * 0.4, y + 15, x, y + 5);
            ctx.fill();
            ctx.stroke();

            // Curly tips
            ctx.beginPath();
            ctx.arc(x - width - 5, y - 15, 8, 0, Math.PI * 1.5);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + width + 5, y - 15, 8, Math.PI * 0.5, Math.PI * 2);
            ctx.fill();
        }

        // Draw top hat
        function drawHat(x, y, width) {
            const hatWidth = width * 0.9;
            const hatHeight = width * 0.6;

            // Hat shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(x, y + hatHeight * 0.1 + 5, hatWidth * 0.65, hatHeight * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();

            // Hat body gradient
            const gradient = ctx.createLinearGradient(x, y - hatHeight, x, y);
            gradient.addColorStop(0, '#2d2d2d');
            gradient.addColorStop(0.5, '#1a1a1a');
            gradient.addColorStop(1, '#0d0d0d');

            // Main hat body
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(x - hatWidth * 0.35, y);
            ctx.lineTo(x - hatWidth * 0.3, y - hatHeight);
            ctx.lineTo(x + hatWidth * 0.3, y - hatHeight);
            ctx.lineTo(x + hatWidth * 0.35, y);
            ctx.closePath();
            ctx.fill();

            // Hat top
            ctx.beginPath();
            ctx.ellipse(x, y - hatHeight, hatWidth * 0.3, hatHeight * 0.12, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#3d3d3d';
            ctx.fill();

            // Brim
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.ellipse(x, y, hatWidth * 0.6, hatHeight * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();

            // Band
            ctx.fillStyle = '#8B0000';
            ctx.fillRect(x - hatWidth * 0.35, y - hatHeight * 0.25, hatWidth * 0.7, hatHeight * 0.12);

            // Shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(x - hatWidth * 0.25, y - hatHeight * 0.9, hatWidth * 0.1, hatHeight * 0.6);
        }

        // Draw crown
        function drawCrown(x, y, width) {
            const crownHeight = width * 0.5;

            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(x, y + crownHeight + 10, width * 0.55, crownHeight * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();

            // Crown body gradient
            const gradient = ctx.createLinearGradient(x, y - crownHeight, x, y + crownHeight * 0.3);
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(0.5, '#FFA500');
            gradient.addColorStop(1, '#B8860B');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(x - width * 0.5, y + crownHeight * 0.3);
            ctx.lineTo(x - width * 0.45, y - crownHeight * 0.3);
            ctx.lineTo(x - width * 0.3, y);
            ctx.lineTo(x - width * 0.15, y - crownHeight);
            ctx.lineTo(x, y - crownHeight * 0.2);
            ctx.lineTo(x + width * 0.15, y - crownHeight);
            ctx.lineTo(x + width * 0.3, y);
            ctx.lineTo(x + width * 0.45, y - crownHeight * 0.3);
            ctx.lineTo(x + width * 0.5, y + crownHeight * 0.3);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#B8860B';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Jewels
            const jewels = [
                { cx: x, cy: y - crownHeight * 0.6, color: '#DC143C' },
                { cx: x - width * 0.25, cy: y - crownHeight * 0.15, color: '#4169E1' },
                { cx: x + width * 0.25, cy: y - crownHeight * 0.15, color: '#32CD32' }
            ];

            jewels.forEach(jewel => {
                ctx.beginPath();
                ctx.arc(jewel.cx, jewel.cy, width * 0.06, 0, Math.PI * 2);
                ctx.fillStyle = jewel.color;
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Jewel shine
                ctx.beginPath();
                ctx.arc(jewel.cx - 3, jewel.cy - 3, width * 0.02, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fill();
            });

            // Base band
            ctx.fillStyle = '#B8860B';
            ctx.fillRect(x - width * 0.5, y + crownHeight * 0.15, width, crownHeight * 0.15);
        }

        // Draw carnival mask
        function drawMask(x, y, width) {
            const maskHeight = width * 0.4;

            // Mask gradient
            const gradient = ctx.createLinearGradient(x - width/2, y, x + width/2, y);
            gradient.addColorStop(0, '#9333EA');
            gradient.addColorStop(0.5, '#EC4899');
            gradient.addColorStop(1, '#9333EA');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(x, y - maskHeight * 0.1, width * 0.55, maskHeight, 0, 0, Math.PI * 2);
            ctx.fill();

            // Eye holes
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.beginPath();
            ctx.ellipse(x - width * 0.2, y - maskHeight * 0.15, width * 0.12, maskHeight * 0.25, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x + width * 0.2, y - maskHeight * 0.15, width * 0.12, maskHeight * 0.25, 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Decorations
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            
            // Swirls
            for (let i = -1; i <= 1; i += 2) {
                ctx.beginPath();
                ctx.arc(x + i * width * 0.35, y - maskHeight * 0.3, width * 0.08, 0, Math.PI * 1.5);
                ctx.stroke();
            }

            // Top feather decorations
            ctx.fillStyle = '#FFD700';
            for (let i = -2; i <= 2; i++) {
                ctx.beginPath();
                ctx.ellipse(x + i * width * 0.12, y - maskHeight * 1.1, 8, 25, i * 0.15, 0, Math.PI * 2);
                ctx.fill();
            }

            // Glitter dots
            ctx.fillStyle = '#FFD700';
            for (let i = 0; i < 12; i++) {
                const dotX = x + (Math.random() - 0.5) * width * 0.9;
                const dotY = y - maskHeight * 0.1 + (Math.random() - 0.5) * maskHeight * 1.5;
                ctx.beginPath();
                ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw blur effect
        function drawBlurEffect(x, y, radius) {
            ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
            ctx.filter = 'blur(20px)';
            ctx.beginPath();
            ctx.ellipse(x, y, radius, radius * 1.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.filter = 'none';

            // Border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.ellipse(x, y, radius, radius * 1.3, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw pixel effect
        function drawPixelEffect(x, y, radius) {
            const pixelSize = 15;
            const startX = x - radius;
            const startY = y - radius * 1.3;
            const endX = x + radius;
            const endY = y + radius * 1.3;

            for (let px = startX; px < endX; px += pixelSize) {
                for (let py = startY; py < endY; py += pixelSize) {
                    // Check if pixel is within ellipse
                    const dx = (px - x) / radius;
                    const dy = (py - y) / (radius * 1.3);
                    if (dx * dx + dy * dy <= 1) {
                        const hue = Math.random() * 360;
                        ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.7)`;
                        ctx.fillRect(px, py, pixelSize - 1, pixelSize - 1);
                    }
                }
            }
        }

        // Capture photo
        function capturePhoto() {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = video.videoWidth;
            tempCanvas.height = video.videoHeight;
            const tempCtx = tempCanvas.getContext('2d');

            // Draw video frame
            tempCtx.drawImage(video, 0, 0);

            // Draw filter overlay
            if (currentFilter !== 'none') {
                tempCtx.drawImage(canvas, 0, 0);
            }

            // Create image
            const dataUrl = tempCanvas.toDataURL('image/png');
            capturedImage.src = dataUrl;
            downloadLink.href = dataUrl;
            capturedPreview.classList.remove('hidden');
            
            // Scroll to preview
            capturedPreview.scrollIntoView({ behavior: 'smooth' });
        }

        // Event Listeners
        startBtn.addEventListener('click', startCamera);
        stopBtn.addEventListener('click', stopCamera);
        captureBtn.addEventListener('click', capturePhoto);
        closePreview.addEventListener('click', () => {
            capturedPreview.classList.add('hidden');
        });

        // Filter selection
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                filterStatus.textContent = '🎭 Filter: ' + filterNames[currentFilter];
                
                if (isStreaming) {
                    if (currentFilter !== 'none') {
                        faceIndicator.classList.remove('hidden');
                    } else {
                        faceIndicator.classList.add('hidden');
                    }
                }
            });
        });

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }})

        init();

        // Audio functions with real-time voice effects
        let gainNode = null;
        let biquadFilter = null;
        let convolverNode = null;
        let delayNode = null;
        let feedbackGain = null;
        let outputGain = null;
        let isRealTimeActive = false;
        let recognition = null;
        let isHolding = false;

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
function initSpeechRecognition() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!SpeechRecognition) {
                showMessage('Speech recognition tidak didukung di browser ini.');
                return;
            }

            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onresult = async (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript;
                document.getElementById('originalText').innerHTML = `<span>${transcript}</span>`;
                
                if (event.results[event.results.length - 1].isFinal) {
                    await translateText(transcript, selectedLanguage);
                }
            };

            recognition.onerror = (event) => {
                console.error('Recognition error:', event.error);
                if (event.error === 'no-speech') {
                    showMessage('Tidak ada suara terdeteksi. Coba lagi.');
                } else if (event.error === 'aborted') {
                    // Ignore aborted errors
                } else {
                    showMessage('Error: ' + event.error);
                }
            };

            recognition.onend = () => {
                document.getElementById('holdStatus').textContent = '';
            };
        }

        async function translateText(text, targetLang) {
            document.getElementById('translatedText').innerHTML = '<span class="opacity-50">Menerjemahkan...</span>';
            
            try {
                const langCode = targetLang.split('-')[0];
                const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|${langCode}`;
                
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.responseStatus === 200 || data.responseData) {
                    const translatedText = data.responseData.translatedText;
                    document.getElementById('translatedText').innerHTML = `<span>${translatedText}</span>`;
                } else {
                    throw new Error('Translation failed');
                }
            } catch (error) {
                document.getElementById('translatedText').innerHTML = '<span class="text-red-400">⚠️ Terjemahan gagal. Coba lagi.</span>';
                console.error('Translation error:', error);
            }
        }

        function showMessage(message) {
            document.getElementById('holdStatus').textContent = message;
            setTimeout(() => {
                document.getElementById('holdStatus').textContent = '';
            }, 3000);
        }

        document.querySelectorAll('.language-btn').forEach(button => {
            button.addEventListener('click', () => {
                selectedLanguage = button.dataset.lang;
                document.querySelectorAll('.language-btn').forEach(btn => btn.classList.remove('active', 'ring-2', 'ring-white'));
                button.classList.add('active', 'ring-2', 'ring-white');
            });
        });

        const holdButton = document.getElementById('holdToSpeak');
        
        holdButton.addEventListener('mousedown', () => {
            if (!recognition) initSpeechRecognition();
            
            isHolding = true;
            holdButton.classList.add('hold-indicator');
            document.getElementById('holdStatus').textContent = '🎤 Mendengarkan...';
            
            try {
                recognition.lang = 'id-ID';
                recognition.start();
            } catch (error) {
                showMessage('Error memulai recognition');
            }
        });

        holdButton.addEventListener('mouseup', () => {
            isHolding = false;
            holdButton.classList.remove('hold-indicator');
            
            if (recognition) {
                recognition.stop();
            }
        });

        holdButton.addEventListener('mouseleave', () => {
            if (isHolding) {
                isHolding = false;
                holdButton.classList.remove('hold-indicator');
                if (recognition) recognition.stop();
            }
        });

        holdButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!recognition) initSpeechRecognition();
            
            isHolding = true;
            holdButton.classList.add('hold-indicator');
            document.getElementById('holdStatus').textContent = '🎤 Mendengarkan...';
            
            try {
                recognition.lang = 'id-ID';
                recognition.start();
            } catch (error) {
                showMessage('Error memulai recognition');
            }
        });

        holdButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            isHolding = false;
            holdButton.classList.remove('hold-indicator');
            
            if (recognition) {
                recognition.stop();
            }
        });

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