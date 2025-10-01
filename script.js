// OceanVision AI - Main JavaScript

// ============================================
// NAVIGATION & UI INTERACTIONS
// ============================================

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Close mobile menu if open
            document.getElementById('mobileMenu').classList.remove('active');
        }
    });
});

// Mobile menu toggle
document.getElementById('mobileMenuBtn').addEventListener('click', function() {
    document.getElementById('mobileMenu').classList.toggle('active');
});

// Navbar scroll effect
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

// Trigger stats animation when visible
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

// Click to select file
selectFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
});

uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// Drag and drop functionality
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
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB', 'error');
        return;
    }

    // Read file
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        processImage(imageData);
    };
    reader.readAsDataURL(file);
}

// ============================================
// IMAGE PROCESSING SIMULATION
// ============================================

function processImage(imageData) {
    // Hide upload area
    uploadArea.classList.add('hidden');
    // Show processing status
    processingStatus.classList.remove('hidden');
    results.classList.add('hidden');

    // Simulate processing with progress
    let progress = 0;
    const messages = [
        'Loading image...',
        'Analyzing underwater conditions...',
        'Removing haze and scattering...',
        'Enhancing color and contrast...',
        'Detecting potential threats...',
        'Calculating quality metrics...',
        'Finalizing results...'
    ];

    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        progressBar.style.width = progress + '%';
        const messageIndex = Math.floor((progress / 100) * messages.length);
        processingText.textContent = messages[Math.min(messageIndex, messages.length - 1)];

        if (progress >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
                showResults(imageData);
            }, 500);
        }
    }, 200);
}

// ============================================
// DISPLAY RESULTS
// ============================================

function showResults(originalImage) {
    // Hide processing
    processingStatus.classList.add('hidden');
    
    // Show results
    results.classList.remove('hidden');

    // Set original image
    document.getElementById('imagePreview').src = originalImage;

    // Simulate enhanced image (in production, this would come from the backend)
    const img = new Image();
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Apply enhancement filter
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            // Enhance contrast and brightness
            data[i] = Math.min(255, data[i] * 1.2);     // Red
            data[i+1] = Math.min(255, data[i+1] * 1.2); // Green
            data[i+2] = Math.min(255, data[i+2] * 1.3); // Blue (enhance blue for underwater)
        }
        
        ctx.putImageData(imageData, 0, 0);
        document.getElementById('enhancedPreview').src = canvas.toDataURL();
    };
    img.src = originalImage;

    // Generate random threats
    const threats = generateRandomThreats();
    displayThreats(threats);

    // Generate metrics
    const metrics = generateMetrics();
    displayMetrics(metrics);

    // Show success notification
    showNotification('Image processed successfully!', 'success');

    // Scroll to results
    setTimeout(() => {
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ============================================
// THREAT GENERATION AND DISPLAY
// ============================================

function generateRandomThreats() {
    const threatTypes = [
        { name: 'Submarine', priority: 'HIGH', color: 'red' },
        { name: 'Mine', priority: 'HIGH', color: 'red' },
        { name: 'Diver', priority: 'MEDIUM', color: 'yellow' },
        { name: 'Drone', priority: 'MEDIUM', color: 'yellow' }
    ];

    const numThreats = Math.floor(Math.random() * 3) + 1;
    const threats = [];

    for (let i = 0; i < numThreats; i++) {
        const threat = threatTypes[Math.floor(Math.random() * threatTypes.length)];
        threats.push({
            ...threat,
            confidence: (85 + Math.random() * 10).toFixed(1),
            x: Math.floor(Math.random() * 80) + 10,
            y: Math.floor(Math.random() * 80) + 10
        });
    }

    return threats;
}

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
                <span class="font-bold text-white">${threat.name}</span>
                <span class="text-sm font-medium text-${priorityClass}-400">${threat.confidence}% confidence</span>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-slate-400">Position: (${threat.x}, ${threat.y})</span>
                <span class="px-3 py-1 bg-${priorityClass}-500/20 text-${priorityClass}-400 rounded-full text-xs font-bold">${threat.priority} PRIORITY</span>
            </div>
        `;
        threatsList.appendChild(threatEl);
    });
}

// ============================================
// METRICS GENERATION AND DISPLAY
// ============================================

function generateMetrics() {
    return {
        psnr: (26 + Math.random() * 4).toFixed(2),
        ssim: (0.85 + Math.random() * 0.1).toFixed(3),
        uiqm: (3.0 + Math.random() * 0.5).toFixed(2),
        color: Math.floor(85 + Math.random() * 10),
        haze: Math.floor(15 + Math.random() * 15),
        visibility: Math.floor(88 + Math.random() * 8)
    };
}

function displayMetrics(metrics) {
    const metricsGrid = document.getElementById('metricsGrid');
    metricsGrid.innerHTML = `
        <div class="bg-slate-800/50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-blue-400">${metrics.psnr}</div>
            <div class="text-sm text-slate-400">PSNR</div>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-cyan-400">${metrics.ssim}</div>
            <div class="text-sm text-slate-400">SSIM</div>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-purple-400">${metrics.uiqm}</div>
            <div class="text-sm text-slate-400">UIQM</div>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-green-400">${metrics.color}%</div>
            <div class="text-sm text-slate-400">Color</div>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-yellow-400">${metrics.haze}%</div>
            <div class="text-sm text-slate-400">Haze</div>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-emerald-400">${metrics.visibility}%</div>
            <div class="text-sm text-slate-400">Visibility</div>
        </div>
    `;
}

// ============================================
// DOWNLOAD AND RESET FUNCTIONALITY
// ============================================

// Download results
document.getElementById('downloadBtn').addEventListener('click', function() {
    const enhancedImage = document.getElementById('enhancedPreview').src;
    const link = document.createElement('a');
    link.href = enhancedImage;
    link.download = 'oceanvision_enhanced_' + Date.now() + '.jpg';
    link.click();
    showNotification('Image downloaded successfully!', 'success');
});

// Process another image
document.getElementById('processAnotherBtn').addEventListener('click', function() {
    results.classList.add('hidden');
    uploadArea.classList.remove('hidden');
    progressBar.style.width = '0%';
    fileInput.value = '';
    
    // Scroll back to demo section
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
    // Press 'U' to upload
    if (e.key === 'u' || e.key === 'U') {
        if (!uploadArea.classList.contains('hidden')) {
            fileInput.click();
        }
    }
    
    // Press 'D' to download when results are visible
    if (e.key === 'd' || e.key === 'D') {
        if (!results.classList.contains('hidden')) {
            document.getElementById('downloadBtn').click();
        }
    }
    
    // Press 'N' for new/another when results are visible
    if (e.key === 'n' || e.key === 'N') {
        if (!results.classList.contains('hidden')) {
            document.getElementById('processAnotherBtn').click();
        }
    }
    
    // Press '?' to show shortcuts
    if (e.key === '?') {
        tooltip.classList.toggle('hidden');
    }
});

// ============================================
// KEYBOARD SHORTCUTS TOOLTIP
// ============================================

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
// CURSOR TRAIL EFFECT (Desktop Only)
// ============================================

let cursorTrail = [];
const maxTrailLength = 20;

document.addEventListener('mousemove', function(e) {
    if (window.innerWidth > 768) { // Only on desktop
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
// PERFORMANCE MONITORING
// ============================================

window.addEventListener('load', function() {
    const loadTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
    console.log(`Page loaded in ${loadTime}ms`);
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('Welcome to OceanVision AI! Upload an image to get started.', 'info');
    }, 1000);
});

// ============================================
// EASTER EGG: KONAMI CODE
// ============================================

let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        showNotification('🌊 Secret mode activated! Enhanced processing enabled!', 'success');
        document.body.style.animation = 'gradient-shift 3s ease';
        
        // Add special effect
        document.body.style.filter = 'hue-rotate(180deg)';
        setTimeout(() => {
            document.body.style.filter = 'none';
        }, 3000);
    }
});

// ============================================
// IMAGE LOADING ANIMATION
// ============================================

const images = document.querySelectorAll('img');
images.forEach(img => {
    img.addEventListener('load', function() {
        this.style.opacity = '1';
    });
    if (!img.complete) {
        img.style.opacity = '0';
    }
});

// ============================================
// CONSOLE BRANDING
// ============================================

console.log('%c🌊 OceanVision AI v1.0.0', 'color: #3b82f6; font-size: 20px; font-weight: bold;');
console.log('%cMaritime Intelligence Platform', 'color: #06b6d4; font-size: 14px;');
console.log('%cPress ? for keyboard shortcuts', 'color: #94a3b8; font-size: 12px;');
console.log('%c\nDeveloped for SIH 2025', 'color: #10b981; font-size: 12px; font-weight: bold;');

// ============================================
// PREVENT CONTEXT MENU ON IMAGES (Optional)
// ============================================

document.querySelectorAll('img').forEach(img => {
    img.addEventListener('contextmenu', (e) => {
        // Uncomment to prevent right-click on images
        // e.preventDefault();
        // showNotification('Image protection enabled', 'info');
    });
});

// ============================================
// AUTO-SAVE FORM DATA (if forms are added later)
// ============================================

function autoSaveFormData() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('input', (e) => {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            // Save to sessionStorage (not localStorage as per requirements)
            // sessionStorage.setItem('formData', JSON.stringify(data));
        });
    });
}

// Initialize auto-save if needed
// autoSaveFormData();

// ============================================
// RESPONSIVE IMAGE OBSERVER
// ============================================

const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
            imageObserver.unobserve(img);
        }
    });
}, {
    rootMargin: '50px'
});

// Observe images with data-src attribute for lazy loading
document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});

// ============================================
// EXPORT FOR TESTING (if needed)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        processImage,
        generateRandomThreats,
        generateMetrics,
        showNotification
    };
}