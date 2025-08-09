let currentPage = '';
let galleryPreloaded = false;
let preloadedImages = new Set();

document.addEventListener('DOMContentLoaded', function () {
  const mainContent = document.querySelector('main');
  const navLinks = document.querySelectorAll('.nav-link');

  function cleanupCurrentPage() {
    if (window.currentLightbox) {
      window.currentLightbox.destroy();
      window.currentLightbox = null;
    }
    if (window.currentGalleryInstance) {
      window.currentGalleryInstance = null;
    }
    const existingScripts = mainContent.querySelectorAll('script');
    existingScripts.forEach(script => script.remove());
  }

  function preloadGalleryImages() {
    if (galleryPreloaded) return;
    
    console.log('Starting gallery image preload...');
    fetch('/fragment/gallery')
      .then(response => response.text())
      .then(html => {
        // Create a temporary container to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Find all image sources in the gallery
        const images = tempDiv.querySelectorAll('img[data-pswp-src], .gallery-item img, .gallery-grid img');
        const imageUrls = new Set();
        
        images.forEach(img => {
          // Get thumbnail src
          if (img.src && !img.src.includes('ghostwatch-icon') && !img.src.includes('site/')) {
            imageUrls.add(img.src);
          }
          const fullSrc = img.getAttribute('data-pswp-src') || img.getAttribute('data-src');
          if (fullSrc) {
            imageUrls.add(fullSrc);
          }
        });
        
        // Also check for any data attributes or script-generated URLs
        const scriptTags = tempDiv.querySelectorAll('script');
        scriptTags.forEach(script => {
          const scriptContent = script.textContent;
          // Look for image paths in the script content
          const imageMatches = scriptContent.match(/['"]\/images\/[^'"]+\.(jpg|jpeg|png|gif|webp)['"]/gi);
          if (imageMatches) {
            imageMatches.forEach(match => {
              const cleanUrl = match.replace(/['"]/g, '');
              if (!cleanUrl.includes('site/')) {
                imageUrls.add(cleanUrl);
              }
            });
          }
        });
        
        // Preload images with priority on thumbnails first
        const imageArray = Array.from(imageUrls);
        let loadedCount = 0;
        
        imageArray.forEach((src, index) => {
          if (preloadedImages.has(src)) return;
          const img = new Image();
    
          img.onload = () => {
            preloadedImages.add(src);
            loadedCount++;
            if (loadedCount % 5 === 0) { // Log progress every 5 images
              console.log(`Preloaded ${loadedCount}/${imageArray.length} gallery images`);
            }
          };
          
          img.onerror = () => {
            console.warn(`Failed to preload image: ${src}`);
            loadedCount++;
          };
          img.src = src; 
        });
        galleryPreloaded = true;
      })
      .catch(error => {
        console.error('Failed to preload gallery images:', error);
      });
  }

  function executeScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(script => {
      const newScript = document.createElement('script');
      Array.from(script.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      if (script.src) {
        newScript.src = script.src;
      } else {
        newScript.textContent = script.textContent;
      }
      
      // For module scripts, we need to ensure they're executed properly
      if (script.type === 'module') {
        newScript.type = 'module';
      }
      script.parentNode.replaceChild(newScript, script);
    });
  }

  function updateActiveNavigation(activePage) {
    // Remove active class from all nav links
    navLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to current page nav link
    const activeLink = document.querySelector(`.nav-link[data-link="${activePage}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  function loadContent(path, pushState = true) {
    const fragmentUrl = `/fragment/${path}`;
    
    mainContent.innerHTML = '<div class="loading-content"><div class="spinner"></div><p>Loading...</p></div>';
    cleanupCurrentPage();
    updateActiveNavigation(path);
    
    fetch(fragmentUrl)
      .then(response => {
        if (!response.ok) throw new Error('Page not found');
        return response.text();
      })
      .then(html => {
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;
        mainContent.innerHTML = html;
        if (pushState) {
          history.pushState({ path }, '', path === 'home' ? '/' : `/${path}`);
        }
        
        currentPage = path;
        executeScripts(mainContent);
        initializePage(path);
      })
      .catch(error => {
        mainContent.innerHTML = '<div class="error-content"><p>Failed to load content.</p></div>';
        console.error('Failed to load content:', error);
      });
  }

  function initializePage(path) {
    if (path === 'home') {
      initializeFAQ();
      
      // Start preloading gallery images after home page is loaded
      // Add a small delay to ensure home page is fully rendered first
      setTimeout(() => {
        preloadGalleryImages();
      }, 1000);
      
    } else if (path === 'gallery') {
      // For gallery, the module script will handle its own initialization
      // We just need to ensure the GalleryOptimizer class is available
      setTimeout(() => {
        if (window.GalleryOptimizer && !window.currentGalleryInstance) {
          window.currentGalleryInstance = new window.GalleryOptimizer();
        }
      }, 100);
    }
  }

  function initializeFAQ() {
    // FAQ tab functionality
    const tabs = document.querySelectorAll('.faq-tab');
    const groups = document.querySelectorAll('.faq-category-group');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const selectedCategory = tab.dataset.category;
        groups.forEach(group => {
          const groupCategory = group.dataset.category;
          if (selectedCategory === 'All' || groupCategory === selectedCategory) {
            group.style.display = '';
          } else {
            group.style.display = 'none';
          }
        });
      });
    });

    // FAQ accordion functionality
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      const inner = item.querySelector('.faq-answer-inner');
      let isAnimating = false;

      question.addEventListener('click', () => {
        if (isAnimating) return;
        const isOpen = item.classList.contains('active');
        isAnimating = true;

        if (isOpen) {
          answer.style.height = inner.offsetHeight + 'px';
          answer.offsetHeight;
          answer.style.height = '0px';

          const handleCollapse = (e) => {
            if (e.target === answer && e.propertyName === 'height') {
              item.classList.remove('active');
              answer.style.height = '';
              answer.removeEventListener('transitionend', handleCollapse);
              isAnimating = false;
            }
          };
          answer.addEventListener('transitionend', handleCollapse);
        } else {
          item.classList.add('active');
          const targetHeight = inner.offsetHeight;
          answer.style.height = targetHeight + 'px';

          const handleExpand = (e) => {
            if (e.target === answer && e.propertyName === 'height') {
              answer.style.height = 'auto';
              answer.removeEventListener('transitionend', handleExpand);
              isAnimating = false;
            }
          };
          answer.addEventListener('transitionend', handleExpand);
        }
      });
    });
  }

  // Navigation event listeners
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const target = this.dataset.link;
      loadContent(target);
    });
  });

  // Handle back/forward browser navigation
  window.addEventListener('popstate', (e) => {
    const path = window.location.pathname === '/' ? 'home' : window.location.pathname.replace('/', '');
    loadContent(path, false);
  });

  // Load correct page on first load
  const initialPath = window.location.pathname === '/' ? 'home' : window.location.pathname.replace('/', '');
  loadContent(initialPath, false);
});