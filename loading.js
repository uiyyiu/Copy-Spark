
document.addEventListener('DOMContentLoaded', async () => {
    
    // Configuration
    const RESOURCES = [
        // Background Image (High Res - ~4MB) to simulate heavy load
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3540&auto=format&fit=crop',
        // Another heavy image (~2MB)
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
        // Standard app files (assuming they exist in build)
        '/vite.svg',
        '/manifest.json'
    ];

    // DOM Elements
    const progressFill = document.getElementById('progress-fill');
    const statusText = document.getElementById('status-text');
    const percentageEl = document.getElementById('percentage');
    const speedEl = document.getElementById('speed');
    const etaEl = document.getElementById('eta');
    const container = document.querySelector('.loader-container');

    // State
    let totalLoaded = 0;
    let totalSize = 0;
    let startTime = performance.now();
    let speedHistory = []; // For smoothing speed calculation

    // Helper: Format Bytes
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // Helper: Format Time
    function formatTime(ms) {
        if (!isFinite(ms) || ms < 0) return '--';
        const seconds = Math.ceil(ms / 1000);
        return seconds + ' ثانية';
    }

    // 1. Calculate Total Size (HEAD Requests)
    statusText.innerText = "جاري فحص الملفات...";
    
    try {
        const sizePromises = RESOURCES.map(async (url) => {
            try {
                const response = await fetch(url, { method: 'HEAD' });
                const len = response.headers.get('content-length');
                return len ? parseInt(len, 10) : 500000; // Default 500KB if unknown
            } catch (e) {
                console.warn('Could not get size for', url);
                return 0;
            }
        });

        const sizes = await Promise.all(sizePromises);
        totalSize = sizes.reduce((a, b) => a + b, 0);
        
        // Safety check for totalSize
        if (totalSize === 0) totalSize = 5000000; // Fallback 5MB

    } catch (e) {
        console.error("Error estimating size", e);
        totalSize = 5000000;
    }

    statusText.innerText = "جاري تحميل المحتوى...";
    startTime = performance.now(); // Reset start time for actual download

    // 2. Download Function
    async function downloadResource(url) {
        try {
            const response = await fetch(url);
            if (!response.body) return;

            const reader = response.body.getReader();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                if (value) {
                    totalLoaded += value.length;
                    updateMetrics();
                }
            }
        } catch (error) {
            console.error("Failed to load", url, error);
        }
    }

    // 3. Update UI Logic
    let lastUpdate = 0;
    function updateMetrics() {
        const now = performance.now();
        // Throttle UI updates to 60fps (approx every 16ms)
        if (now - lastUpdate < 50 && totalLoaded < totalSize) return; 
        lastUpdate = now;

        // Percentage
        // Cap at 99% until fully done
        const rawPercent = (totalLoaded / totalSize) * 100;
        const percent = Math.min(rawPercent, 99).toFixed(0);
        
        progressFill.style.width = `${percent}%`;
        percentageEl.innerText = `${percent}%`;

        // Speed Calculation
        const elapsedSeconds = (now - startTime) / 1000;
        const speedBps = totalLoaded / elapsedSeconds; // Bytes per second
        
        // Smoothing
        speedHistory.push(speedBps);
        if (speedHistory.length > 10) speedHistory.shift();
        const avgSpeed = speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length;

        speedEl.innerText = formatBytes(avgSpeed) + '/s';

        // ETA Calculation
        const remainingBytes = totalSize - totalLoaded;
        const etaMs = (remainingBytes / avgSpeed) * 1000;
        etaEl.innerText = formatTime(etaMs);
    }

    // Start Downloads in Parallel
    await Promise.all(RESOURCES.map(downloadResource));

    // Finish
    progressFill.style.width = '100%';
    percentageEl.innerText = '100%';
    etaEl.innerText = '0 ثانية';
    statusText.innerText = "اكتمل التحميل!";
    
    setTimeout(() => {
        container.classList.add('fade-out');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500); // Wait for animation
    }, 800); // Small pause at 100%
});
