// OceanVision AI - Main JavaScript (Clean Version - No Preloaded Data)

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    API_BASE_URL: 'https://api.oceanvision.ai', // Replace with your actual API URL
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png'],
    API_ENDPOINTS: {
        PROCESS: '/api/process',
        STREAM: '/api/stream'
    }
};

// ============================================
// NAVIGATION & UI INTERACTIONS
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('mobileMenu').classList.remove('active');
        }
    });
});

document.getElementById('mobileMenuBtn').addEventListener('click', function() {
    document.getElementById('mobileMenu').classList.toggle('active');
});

window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (window.pageYOffset > 100) {
        nav.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    } else {
        nav.style.boxShadow = 'none';
    }
});

// ============================================
// ANIMATED STATISTICS
// ============================================

function animateValue(id, start, end, duration, suffix = '') {
    const obj = document.getElementById(id);
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    let current = start;
    const timer = setInterval(function() {
        current += increment;
        obj.textContent = current + suffix;
        if (current == end) {
            clearInterval(timer);
        }
    }, stepTime);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateValue('accuracyStat', 0, 94.2, 2000, '%');
            animateValue('timeStat', 0, 2.3, 2000, 's');
            animateValue('imagesStat', 0, 247, 2000, '+');
            statsObserver.unobserve(entry.target);
        }
    });
});
statsObserver.observe(document.getElementById('home'));

// ============================================
// FEATURE CARDS ANIMATION
// ============================================

const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease-out';
    featureObserver.observe(card);
});

// ============================================
// IMAGE UPLOAD AND PROCESSING
// ============================================

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const processingStatus = document.getElementById('processingStatus');
const results = document.getElementById('results');
const progressBar = document.getElementById('progressBar');
const processingText = document.getElementById('processingText');

selectFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
});

uploadArea.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('border-blue-400', 'bg-blue-500/10');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('border-blue-400', 'bg-blue-500/10');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('border-blue-400', 'bg-blue-500/10');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// ============================================
// FILE HANDLING
// ============================================

function handleFile(file) {
    if (!CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
        showNotification('Please upload a JPG or PNG image file', 'error');
        return;
    }

    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showNotification('File size must be less than 10MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        processImage(imageData);
    };
    reader.readAsDataURL(file);
}

// ============================================
// IMAGE PROCESSING - API CALL
// ============================================

async function processImage(imageData) {
    uploadArea.classList.add('hidden');
    processingStatus.classList.remove('hidden');
    results.classList.add('hidden');

    try {
        // Set original image preview
        document.getElementById('imagePreview').src = imageData;

        // Prepare API request
        const requestBody = {
            image: imageData.split(',')[1], // Remove data:image/jpeg;base64, prefix
            format: 'jpg',
            options: {
                enhance: true,
                detect_threats: true,
                calculate_metrics: true
            }
        };

        // Simulate progress updates
        updateProgress(0, 'Uploading image...');
        
        // Make API call
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.API_ENDPOINTS.PROCESS}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add your API key here
                // 'Authorization': 'Bearer YOUR_API_KEY'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        updateProgress(50, 'Processing image...');

        const data = await response.json();
        
        updateProgress(100, 'Finalizing results...');

        setTimeout(() => {
            showResults(imageData, data);
        }, 500);

    } catch (error) {
        console.error('Processing error:', error);
        processingStatus.classList.add('hidden');
        uploadArea.classList.remove('hidden');
        
        if (error.message.includes('fetch')) {
            showNotification('Unable to connect to server. Please check your connection and try again.', 'error');
        } else {
            showNotification(`Error processing image: ${error.message}`, 'error');
        }
    }
}

function updateProgress(percentage, message) {
    progressBar.style.width = percentage + '%';
    processingText.textContent = message;
}

// ============================================
// DISPLAY RESULTS
// ============================================

function showResults(originalImage, apiData) {
    processingStatus.classList.add('hidden');
    results.classList.remove('hidden');

    // Display enhanced image
    if (apiData.enhanced_image) {
        document.getElementById('enhancedPreview').src = 'data:image/jpeg;base64,' + apiData.enhanced_image;
    } else {
        document.getElementById('enhancedPreview').src = originalImage;
    }

    // Display threats
    if (apiData.threats && apiData.threats.length > 0) {
        displayThreats(apiData.threats);
    } else {
        displayNoThreats();
    }

    // Display metrics
    if (apiData.metrics) {
        displayMetrics(apiData.metrics);
    } else {
        displayNoMetrics();
    }

    showNotification('Image processed successfully!', 'success');

    setTimeout(() => {
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ============================================
// DISPLAY THREATS
// ============================================

function displayThreats(threats) {
    document.getElementById('threatCount').textContent = threats.length;
    const threatsList = document.getElementById('threatsList');
    threatsList.innerHTML = '';

    threats.forEach(threat => {
        const priorityClass = threat.priority === 'HIGH' ? 'red' : 'yellow';
        const threatEl = document.createElement('div');
        threatEl.className = `p-4 bg-${priorityClass}-500/10 border border-${priorityClass}-500/50 rounded-lg`;
        threatEl.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-white">${threat.type}</span>
                <span class="text-sm font-medium text-${priorityClass}-400">${(threat.confidence * 100).toFixed(1)}% confidence</span>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-slate-400">Position: (${threat.position.x}, ${threat.position.y})</span>
                <span class="px-3 py-1 bg-${priorityClass}-500/20 text-${priorityClass}-400 rounded-full text-xs font-bold">${threat.priority} PRIORITY</span>
            </div>
        `;
        threatsList.appendChild(threatEl);
    });
}

function displayNoThreats() {
    document.getElementById('threatCount').textContent = '0';
    const threatsList = document.getElementById('threatsList');
    threatsList.innerHTML = `
        <div class="text-center py-8 text-slate-400">
            <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>No threats detected</p>
        </div>
    `;
}

// ============================================
// DISPLAY METRICS
// ============================================

function displayMetrics(metrics) {
    const metricsGrid = document.getElementById('metricsGrid');
    metricsGrid.innerHTML = `
        <div class="bg-slate-800/50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-blue-400">${metrics.psnr ? metrics.psnr.toFixed(2) : 'N/A'}</div>
            <div class="text-sm text-slate-400">PSNR</div>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-cyan-400">${metrics.ssim ? metrics.ssim.toFixed(3) : 'N/A'}</div>
            <div class="text-sm text-slate-400">SSIM</div>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-purple-400">${metrics.uiqm ? metrics.uiqm.toFixed(2) : 'N/A'}</div>
            <div class="text-sm text-slate-400">UIQM</div>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-green-400">${metrics.color_correction ? (metrics.color_correction * 100).toFixed(0) : 'N/A'}%</div>
            <div class="text-sm text-slate-400">Color</div>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-yellow-400">${metrics.haze_factor ? (metrics.haze_factor * 100).toFixed(0) : 'N/A'}%</div>
            <div class="text-sm text-slate-400">Haze</div>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-emerald-400">${metrics.visibility ? (metrics.visibility * 100).toFixed(0) : 'N/A'}%</div>
            <div class="text-sm text-slate-400">Visibility</div>
        </div>
    `;
}

function displayNoMetrics() {
    const metricsGrid = document.getElementById('metricsGrid');
    metricsGrid.innerHTML = `
        <div class="col-span-3 text-center py-8 text-slate-400">
            <p>Metrics unavailable</p>
        </div>
    `;
}

// ============================================
// DOWNLOAD AND RESET
// ============================================

document.getElementById('downloadBtn').addEventListener('click', function() {
    const enhancedImage = document.getElementById('enhancedPreview').src;
    const link = document.createElement('a');
    link.href = enhancedImage;
    link.download = 'oceanvision_enhanced_' + Date.now() + '.jpg';
    link.click();
    showNotification('Image downloaded successfully!', 'success');
});

document.getElementById('processAnotherBtn').addEventListener('click', function() {
    results.classList.add('hidden');
    uploadArea.classList.remove('hidden');
    progressBar.style.width = '0%';
    fileInput.value = '';
    document.getElementById('demo').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ============================================
// NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-24 right-6 z-50 px-6 py-4 rounded-lg shadow-2xl fade-in ${
        type === 'success' ? 'bg-green-500/90' : 
        type === 'error' ? 'bg-red-500/90' : 
        'bg-blue-500/90'
    }`;
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-white font-medium">${message}</span>
        </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', function(e) {
    if (e.key === 'u' || e.key === 'U') {
        if (!uploadArea.classList.contains('hidden')) {
            fileInput.click();
        }
    }
    
    if (e.key === 'd' || e.key === 'D') {
        if (!results.classList.contains('hidden')) {
            document.getElementById('downloadBtn').click();
        }
    }
    
    if (e.key === 'n' || e.key === 'N') {
        if (!results.classList.contains('hidden')) {
            document.getElementById('processAnotherBtn').click();
        }
    }
    
    if (e.key === '?') {
        tooltip.classList.toggle('hidden');
    }
});

const tooltip = document.createElement('div');
tooltip.className = 'fixed bottom-6 left-6 bg-slate-800/90 border border-slate-700 rounded-lg p-4 text-xs text-slate-400 hidden z-tooltip';
tooltip.innerHTML = `
    <div class="font-bold text-white mb-2">Keyboard Shortcuts</div>
    <div>U - Upload image</div>
    <div>D - Download results</div>
    <div>N - Process another</div>
    <div>? - Toggle shortcuts</div>
`;
document.body.appendChild(tooltip);

// ============================================
// PARALLAX EFFECT
// ============================================

window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.float-animation');
    parallaxElements.forEach(el => {
        const speed = 0.5;
        el.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ============================================
// CURSOR TRAIL (Desktop Only)
// ============================================

let cursorTrail = [];
const maxTrailLength = 20;

document.addEventListener('mousemove', function(e) {
    if (window.innerWidth > 768) {
        const trail = document.createElement('div');
        trail.className = 'fixed w-2 h-2 bg-blue-400 rounded-full pointer-events-none z-50';
        trail.style.left = e.clientX + 'px';
        trail.style.top = e.clientY + 'px';
        trail.style.opacity = '0.5';
        trail.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        document.body.appendChild(trail);
        
        cursorTrail.push(trail);
        
        if (cursorTrail.length > maxTrailLength) {
            const oldTrail = cursorTrail.shift();
            oldTrail.remove();
        }
        
        setTimeout(() => {
            trail.style.opacity = '0';
            trail.style.transform = 'scale(0)';
            setTimeout(() => trail.remove(), 300);
        }, 100);
    }
});

// ============================================
// INITIALIZATION
// ============================================

window.addEventListener('load', function() {
    const loadTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
    console.log(`Page loaded in ${loadTime}ms`);
    
    setTimeout(() => {
        showNotification('Welcome to OceanVision AI! Upload an image to get started.', 'info');
    }, 1000);
});

console.log('%c🌊 OceanVision AI v1.0.0', 'color: #3b82f6; font-size: 20px; font-weight: bold;');
console.log('%cMaritime Intelligence Platform', 'color: #06b6d4; font-size: 14px;');
console.log('%cPress ? for keyboard shortcuts', 'color: #94a3b8; font-size: 12px;');
