---
layout: partial
permalink: /fragment/gallery
---

{%- assign all_tags = site.photo_gallery | map: "tags" | join: "," | split: "," | uniq -%}
{%- assign all_tags = all_tags | reject: "" | sort -%}

{%- if all_tags.size > 0 -%}
  <div class="faq-tabs gallery-tabs">
    <button class="faq-tab active" data-tag="All">All</button>
    {% for tag in all_tags %}
      <button class="faq-tab" data-tag="{{ tag | strip }}">{{ tag | strip }}</button>
    {% endfor %}
  </div>
{%- endif -%}

<div class="gallery-grid loading" id="gallery">
  {%- assign gallery_items = site.photo_gallery | group_by: "date" -%}
  {%- assign sorted_groups = gallery_items | sort: "name" | reverse -%}
  {%- for date_group in sorted_groups -%}
    {%- assign items_by_name = date_group.items | sort: "name" | reverse -%}
    {%- for image in items_by_name -%}
      {%- assign aspect_ratio = image.width | times: 1.0 | divided_by: image.height -%}
      {%- assign thumb_path = image.image_path | thumbnail_path -%}

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
      {%- elsif image.source contains "fantasticpixelcastle.com" or image.source contains "fantasticpixelcastle.com" -%}
        {%- assign source_icon = "/images/site/fantasticpixelcastle-icon.png" -%}
        {%- assign source_name = "Fantastic Pixel Castle" -%}
      {%- else -%}
        {%- assign source_name = image.source -%}
      {%- endif -%}

      {%- assign item_classes = "pswp-gallery__item" -%}
      {%- if aspect_ratio > 1.2 -%}
        {%- assign item_classes = item_classes | append: " wide" -%}
      {%- elsif aspect_ratio < 0.75 -%}
        {%- assign item_classes = item_classes | append: " tall" -%}
      {%- endif -%}

      <div class="{{ item_classes }}" data-tags="{{ image.tags | join: ',' | escape }}">
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
          <u><b>{{ image.title }}</b><br></u>
          <p>{{ image.description }}</p>
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

<div id="loading-indicator" class="loading-indicator">
  <div class="spinner"></div>
  <p>Loading gallery...</p>
</div>

<!-- PhotoSwipe & Lazy Loader -->
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

    // Hide loading indicator when we've loaded at least 6 images OR 20% OR if all images are loaded
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
</script>