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
    this.lightbox = null;

    if (this.galleryGrid) this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupImageLoading();
    this.initPhotoSwipe();
    this.setupTagFiltering();
    this.preloadCriticalImages();
    
    // Fallback: Hide loading indicator after 3 seconds regardless
    setTimeout(() => {
      if (this.loadingIndicator && this.loadingIndicator.style.display !== 'none') {
        this.loadingIndicator.style.display = 'none';
        if (this.galleryGrid) {
          this.galleryGrid.classList.remove('loading');
        }
      }
    }, 3000);
  }

  setupTagFiltering() {
    const tagButtons = document.querySelectorAll('.gallery-tabs .faq-tab');
    const galleryItems = document.querySelectorAll('.pswp-gallery__item');

    tagButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all buttons
        tagButtons.forEach(b => b.classList.remove('active'));
        button.classList.add('active');

        const selectedTag = button.getAttribute('data-tag');
        console.log('Selected tag:', selectedTag); // Debug log

        galleryItems.forEach(item => {
          const itemTags = item.getAttribute('data-tags') || '';
          const tags = itemTags.split(',').map(t => t.trim()).filter(t => t.length > 0);
          
          console.log('Item tags:', tags, 'Selected:', selectedTag); // Debug log
          
          if (selectedTag === 'All' || tags.includes(selectedTag)) {
            item.style.display = 'block';
            item.style.visibility = 'visible';
            item.style.opacity = '1';
          } else {
            item.style.display = 'none';
            item.style.visibility = 'hidden';
            item.style.opacity = '0';
          }
        });

        // Reinitialize PhotoSwipe after filtering
        if (this.lightbox) {
          this.lightbox.destroy();
          this.initPhotoSwipe();
        }
      });
    });
  }

  setupIntersectionObserver() {
    const itemObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          itemObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '50px' });

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
    }, { threshold: 0.1, rootMargin: '200px' });

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

    const shouldHideLoading = this.loadedCount >= 6 || progress >= 20 || progress >= 100;

    if (shouldHideLoading && this.loadingIndicator) {
      this.loadingIndicator.style.display = 'none';
      if (this.galleryGrid) {
        this.galleryGrid.classList.remove('loading');
      }
    }
  }

  initPhotoSwipe() {
    const smallScreenPadding = { top: 0, bottom: 0, left: 0, right: 0 };
    const largeScreenPadding = { top: 30, bottom: 30, left: 0, right: 0 };

    this.lightbox = new PhotoSwipeLightbox({
      gallerySelector: '#gallery',
      childSelector: '.pswp-gallery__item:not([style*="display: none"])', // Only select visible items
      paddingFn: (viewportSize) => {
        return viewportSize.x < 700 ? smallScreenPadding : largeScreenPadding;
      },
      pswpModule: () => import('https://cdn.jsdelivr.net/npm/photoswipe@5.3.0/dist/photoswipe.esm.js')
    });

    this.lightbox.on('beforeOpen', () => {
      const currentItem = this.lightbox.pswp.currItem;
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

    new PhotoSwipeDynamicCaption(this.lightbox, {
      mobileLayoutBreakpoint: 700,
      type: 'auto',
      mobileCaptionOverlapRatio: 1
    });

    this.lightbox.init();
    window.currentLightbox = this.lightbox;
  }
}

window.GalleryOptimizer = GalleryOptimizer;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new GalleryOptimizer());
} else {
  new GalleryOptimizer();
}