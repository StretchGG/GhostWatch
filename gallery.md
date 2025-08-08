---
layout: default
title: GhostWatch
permalink: /gallery
---

<div class="gallery-grid" id="gallery">
    {%- assign gallery_items = site.photo_gallery | group_by: "date" -%}
    {%- assign sorted_groups = gallery_items | sort: "name" | reverse -%}
    {%- for date_group in sorted_groups -%}
    {%- assign items_by_name = date_group.items | sort: "name" | reverse -%}
    {%- for image in items_by_name -%}
    {%- assign aspect_ratio = image.width | times: 1.0 | divided_by: image.height -%}
    {%- assign thumb_path = image.image_path | thumbnail_path -%}
    
    {%- comment -%} Determine source icon based on URL {%- endcomment -%}
    {%- assign source_icon = "" -%}
    {%- assign source_name = "" -%}
    {%- if image.source contains "bsky.app" -%}
        {%- assign source_icon = "/images/site/bluesky-icon.png" -%}
        {%- assign source_name = "Bluesky" -%}
    {%- elsif image.source contains "x.com" or image.source contains "twitter.com" -%}
        {%- assign source_icon = "/images/site/x-icon.png" -%}
        {%- assign source_name = "X (Twitter)" -%}
    {%- elsif image.source contains "youtube.com" or image.source contains "youtu.be" -%}
        {%- assign source_icon = "/images/site/youtube-icon.png" -%}
        {%- assign source_name = "YouTube" -%}
    {%- else -%}
        {%- assign source_name = image.source -%}
    {%- endif -%}
    
    <div class="pswp-gallery__item
        {% if aspect_ratio > 1.2 %} wide
        {% elsif aspect_ratio < 0.75 %} tall
        {% endif %}">
            <a href="{{ image.image_path }}"
                data-pswp-width="{{ image.width }}"
                data-pswp-height="{{ image.height }}"
                data-full-src="{{ image.image_path }}"
                target="_blank">
                <div class="image-container">
                    <div class="image-placeholder"></div>
                    <img class="gallery-image"
                         data-src="{{ thumb_path }}"
                         data-full="{{ image.image_path }}"
                         alt="{{ image.title }}"
                         loading="lazy"
                         decoding="async" />
                </div>
            </a>
            <div class="pswp-caption-content">
                <u><b> {{image.title}}</b><br></u>
                <p> {{image.description}} </p>
                {%- if source_icon != "" -%}
                    <p> Source: </p>
                    <a href="{{ image.source }}" target="_blank" class="source-link">
                        <img src="{{ source_icon }}" alt="{{ source_name }}" class="source-icon" title="{{ source_name }}">
                    </a>
                {%- else -%}
                    <a href="{{ image.source }}" target="_blank">{{ image.source }}</a>
                {%- endif -%}
            </div>
    </div>
    {%- endfor -%}
    {%- endfor -%}
</div>

<!-- Loading indicator -->
<div id="loading-indicator" class="loading-indicator">
    <div class="spinner"></div>
    <p>Loading gallery...</p>
</div>

<style>
.source-link {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    transition: opacity 0.2s ease;
}

.source-link:hover {
    opacity: 0.7;
}

.source-icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
    border-radius: 3px;
}

.image-container {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 8px;
    background-color: #2a2a2a;
}

.image-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #2a2a2a 25%, transparent 25%), 
                linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, #2a2a2a 75%), 
                linear-gradient(-45deg, transparent 75%, #2a2a2a 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    opacity: 0.1;
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% { opacity: 0.1; }
    50% { opacity: 0.2; }
    100% { opacity: 0.1; }
}

.gallery-image {
    width: 100%;
    height: auto;
    max-height: 350px;
    object-fit: cover;
    object-position: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    will-change: opacity;
    display: block;
    border-radius: 8px;
}

.gallery-image.loaded {
    opacity: 1;
}

.gallery-image.error {
    opacity: 0.5;
    filter: grayscale(100%);
}

.loading-indicator {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.8);
    padding: 2rem;
    border-radius: 12px;
    backdrop-filter: blur(10px);
}

.loading-indicator.hidden {
    display: none;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-left: 4px solid #00bfff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.pswp-gallery__item {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.pswp-gallery__item.visible {
    opacity: 1;
    transform: translateY(0);
}

.gallery-grid.loading .pswp-gallery__item {
    pointer-events: none;
}
</style>

<script type="module">
import PhotoSwipeLightbox from 'https://cdn.jsdelivr.net/npm/photoswipe@5.3.0/dist/photoswipe-lightbox.esm.js';
import PhotoSwipeDynamicCaption from '/js/photoswipe-dynamic-caption-plugin.esm.js';

class GalleryOptimizer {
    constructor() {
        this.loadedCount = 0;
        this.totalImages = 0;
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.galleryGrid = document.getElementById('gallery');
        this.imageQueue = [];
        this.maxConcurrentLoads = 6;
        this.currentLoads = 0;
        
        this.init();
    }
    
    init() {
        this.setupIntersectionObserver();
        this.setupImageLoading();
        this.initPhotoSwipe();
        this.preloadCriticalImages();
    }
    
    setupIntersectionObserver() {
        const itemObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    itemObserver.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        document.querySelectorAll('.pswp-gallery__item').forEach(item => {
            itemObserver.observe(item);
        });
    }
    
    setupImageLoading() {
        const images = document.querySelectorAll('.gallery-image');
        this.totalImages = images.length;
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.queueImageLoad(entry.target);
                    imageObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '200px'
        });
        
        images.forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    queueImageLoad(img) {
        this.imageQueue.push(img);
        this.processQueue();
    }
    
    processQueue() {
        while (this.imageQueue.length > 0 && this.currentLoads < this.maxConcurrentLoads) {
            const img = this.imageQueue.shift();
            this.loadImage(img);
        }
    }
    
    loadImage(img) {
        this.currentLoads++;
        const tempImg = new Image();
        
        tempImg.onload = () => {
            img.src = tempImg.src;
            img.classList.add('loaded');
            this.currentLoads--;
            this.loadedCount++;
            this.updateProgress();
            this.processQueue();
        };
        
        tempImg.onerror = () => {
            img.classList.add('error');
            img.alt = 'Failed to load image';
            this.currentLoads--;
            this.loadedCount++;
            this.updateProgress();
            this.processQueue();
        };
        
        tempImg.src = img.dataset.src || img.dataset.full;
    }
    
    preloadCriticalImages() {
        const criticalImages = document.querySelectorAll('.gallery-image');
        for (let i = 0; i < Math.min(6, criticalImages.length); i++) {
            this.queueImageLoad(criticalImages[i]);
        }
    }
    
    updateProgress() {
        const progress = (this.loadedCount / this.totalImages) * 100;
        
        if (progress >= 20) {
            this.loadingIndicator.classList.add('hidden');
            this.galleryGrid.classList.remove('loading');
        }
    }
    
    initPhotoSwipe() {
        const smallScreenPadding = { top: 0, bottom: 0, left: 0, right: 0 };
        const largeScreenPadding = { top: 30, bottom: 30, left: 0, right: 0 };
        
        const lightbox = new PhotoSwipeLightbox({
            gallerySelector: '#gallery',
            childSelector: '.pswp-gallery__item',
            paddingFn: (viewportSize) => {
                return viewportSize.x < 700 ? smallScreenPadding : largeScreenPadding;
            },
            pswpModule: () => import('https://cdn.jsdelivr.net/npm/photoswipe@5.3.0/dist/photoswipe.esm.js')
        });
        
        lightbox.on('beforeOpen', () => {
            const currentItem = lightbox.pswp.currItem;
            if (currentItem && currentItem.element) {
                const img = currentItem.element.querySelector('.gallery-image');
                if (img && img.dataset.full && img.src !== img.dataset.full) {
                    const fullImg = new Image();
                    fullImg.onload = () => {
                        img.src = fullImg.src;
                    };
                    fullImg.src = img.dataset.full;
                }
            }
        });
        
        const captionPlugin = new PhotoSwipeDynamicCaption(lightbox, {
            mobileLayoutBreakpoint: 700,
            type: 'auto',
            mobileCaptionOverlapRatio: 1
        });
        
        lightbox.init();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new GalleryOptimizer());
} else {
    new GalleryOptimizer();
}
</script>

<script>
document.querySelectorAll('.faq details').forEach(detail => {
    const icon = detail.querySelector('.toggle-icon');
    detail.addEventListener('toggle', () => {
        icon.textContent = detail.open ? '–' : '+';
    });
});
</script>