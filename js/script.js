class CubeGallery {
    constructor() {
        this.cube = document.getElementById('cube');
        this.rotationX = -25;
        this.rotationY = 45;
        this.isAnimating = false;
        this.isDragging = false;
        this.sensitivity = 0.8;
        this.autoRotateSpeed = 0.3;
        this.imagesLoaded = 0;
        
        this.loadImages();
        this.initMusicControl();
        this.floatingPhotos = document.querySelector('.floating-photos');
    }

    loadImages() {
        const images = document.querySelectorAll('.face img');
        images.forEach(img => {
            const actualSrc = img.getAttribute('data-src');
            if (actualSrc) {
                const tempImage = new Image();
                tempImage.onload = () => {
                    img.src = actualSrc;
                    this.imagesLoaded++;
                    if (this.imagesLoaded === images.length) {
                        this.init();
                    }
                };
                tempImage.src = actualSrc;
            }
        });
    }

    init() {
        this.updateCubeRotation();
        this.bindEvents();
        this.createHearts();
        this.startAutoRotate();
        new StrawberryRain();
    }

    bindEvents() {
        let startX, startY;
        let lastX, lastY;
        let momentumX = 0;
        let momentumY = 0;

        this.cube.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.stopAutoRotate();
            startX = lastX = e.clientX;
            startY = lastY = e.clientY;
            
            // 暂停外部照片动画
            if (this.floatingPhotos) {
                this.floatingPhotos.classList.add('paused');
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;

            momentumX = deltaX;
            momentumY = deltaY;

            this.rotationY += deltaX * this.sensitivity;
            this.rotationX -= deltaY * this.sensitivity;

            this.updateCubeRotation();

            lastX = e.clientX;
            lastY = e.clientY;
        });

        document.addEventListener('mouseup', () => {
            if (!this.isDragging) return;
            this.isDragging = false;

            // 恢复外部照片动画
            if (this.floatingPhotos) {
                this.floatingPhotos.classList.remove('paused');
            }

            const inertia = () => {
                if (Math.abs(momentumX) < 0.1 && Math.abs(momentumY) < 0.1) {
                    this.startAutoRotate();
                    return;
                }

                this.rotationY += momentumX * this.sensitivity;
                this.rotationX -= momentumY * this.sensitivity;

                momentumX *= 0.95;
                momentumY *= 0.95;

                this.updateCubeRotation();
                requestAnimationFrame(inertia);
            };

            requestAnimationFrame(inertia);
        });

        // 添加触摸事件支持
        this.cube.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            this.stopAutoRotate();
            startX = lastX = e.touches[0].clientX;
            startY = lastY = e.touches[0].clientY;
            
            // 暂停外部照片动画
            if (this.floatingPhotos) {
                this.floatingPhotos.classList.add('paused');
            }
        });

        document.addEventListener('touchend', () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            
            // 恢复外部照片动画
            if (this.floatingPhotos) {
                this.floatingPhotos.classList.remove('paused');
            }
        });

        document.addEventListener('keydown', (e) => {
            const ROTATION_ANGLE = 90;
            switch(e.key) {
                case 'ArrowLeft':
                    this.rotateBy(-ROTATION_ANGLE, 0);
                    break;
                case 'ArrowRight':
                    this.rotateBy(ROTATION_ANGLE, 0);
                    break;
                case 'ArrowUp':
                    this.rotateBy(0, -ROTATION_ANGLE);
                    break;
                case 'ArrowDown':
                    this.rotateBy(0, ROTATION_ANGLE);
                    break;
            }
        });
    }

    rotateBy(deltaY, deltaX) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.stopAutoRotate();
        
        const startX = this.rotationX;
        const startY = this.rotationY;
        const targetX = startX + deltaX;
        const targetY = startY + deltaY;
        
        const startTime = performance.now();
        const duration = 500;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.rotationX = startX + (targetX - startX) * easeProgress;
            this.rotationY = startY + (targetY - startY) * easeProgress;
            
            this.updateCubeRotation();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
                this.startAutoRotate();
            }
        };
        
        requestAnimationFrame(animate);
    }

    updateCubeRotation() {
        if (!this.cube) return;
        const transform = `rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg)`;
        this.cube.style.transform = transform;
        
        if (this.floatingPhotos) {
            this.floatingPhotos.style.transform = transform;
        }
    }

    startAutoRotate() {
        if (this.autoRotateInterval || this.isDragging) return;
        
        this.autoRotateInterval = setInterval(() => {
            if (!this.isDragging) {
                this.rotationY += this.autoRotateSpeed;
                this.updateCubeRotation();
            }
        }, 16);
    }

    stopAutoRotate() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
    }

    createHearts() {
        const container = document.querySelector('.hearts');
        if (!container) return;
        
        setInterval(() => {
            if (document.hidden) return;
            
            // 每次创建2-3个爱心
            const count = Math.floor(Math.random() * 2) + 2;
            for(let i = 0; i < count; i++) {
                const heart = document.createElement('i');
                heart.className = 'fas fa-heart';
                Object.assign(heart.style, {
                    position: 'absolute',
                    left: Math.random() * 100 + 'vw',
                    top: '100%',
                    fontSize: Math.random() * 20 + 15 + 'px', // 增大尺寸范围
                    color: `rgba(255, ${Math.random() * 30 + 160}, ${Math.random() * 30 + 160}, 0.8)`, // 增加不透明度
                    animation: `float ${Math.random() * 2 + 3}s linear`,
                    transform: `rotate(${Math.random() * 360}deg)`
                });
                
                container.appendChild(heart);
                setTimeout(() => heart.remove(), 3000);
            }
        }, 300);  // 减少间隔时间
    }

    initMusicControl() {
        const musicBtn = document.getElementById('musicToggle');
        const bgMusic = document.getElementById('bgMusic');
        let isPlaying = false;

        if (!musicBtn || !bgMusic) return;

        musicBtn.addEventListener('click', () => {
            if (isPlaying) {
                bgMusic.pause();
                musicBtn.innerHTML = '<i class="fas fa-music"></i>';
                musicBtn.classList.remove('playing');
            } else {
                // 尝试播放音乐
                const playPromise = bgMusic.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
                        musicBtn.classList.add('playing');
                    }).catch(error => {
                        console.log("播放失败:", error);
                    });
                }
            }
            isPlaying = !isPlaying;
        });

        // 监听音乐结束事件
        bgMusic.addEventListener('ended', () => {
            isPlaying = false;
            musicBtn.innerHTML = '<i class="fas fa-music"></i>';
            musicBtn.classList.remove('playing');
        });
    }
}

class StrawberryRain {
    constructor() {
        this.container = document.querySelector('.strawberry-rain');
        this.maxStrawberries = 40;
        this.strawberries = [];
        this.init();
    }

    init() {
        // 保持适当的创建间隔
        for (let i = 0; i < this.maxStrawberries; i++) {
            setTimeout(() => {
                this.createStrawberry();
            }, i * 400); // 稍微减少间隔时间，使草莓出现更均匀
        }
    }

    createStrawberry() {
        const strawberry = document.createElement('div');
        strawberry.className = 'strawberry';
        
        // 调整大小范围
        const size = Math.random() * 15 + 20; // 改为20-35px
        const startX = Math.random() * window.innerWidth;
        const duration = Math.random() * 5 + 5; // 保持5-10秒的下落速度
        const delay = Math.random() * 3;
        
        // 设置样式
        Object.assign(strawberry.style, {
            left: `${startX}px`,
            width: `${size}px`,
            height: `${size}px`,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
            filter: `hue-rotate(${Math.random() * 10}deg) drop-shadow(0 0 3px rgba(255, 51, 102, ${Math.random() * 0.3 + 0.5}))`,
            transform: `rotate(${Math.random() * 360}deg)`
        });

        this.container.appendChild(strawberry);
        this.strawberries.push(strawberry);

        strawberry.addEventListener('animationend', () => {
            strawberry.remove();
            this.strawberries = this.strawberries.filter(s => s !== strawberry);
            this.createStrawberry();
        });
    }
}

// 优化初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new CubeGallery());
} else {
    new CubeGallery();
}