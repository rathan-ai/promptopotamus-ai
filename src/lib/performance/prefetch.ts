/**
 * Prefetch critical routes when the browser is idle
 */
export function prefetchCriticalRoutes() {
  if (typeof window === 'undefined') return;

  const criticalRoutes = [
    '/tools',
    '/smart-prompts',
    '/certificates',
    '/guides'
  ];

  // Use requestIdleCallback if available, otherwise use setTimeout
  const scheduleTask = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));

  scheduleTask(() => {
    criticalRoutes.forEach(route => {
      // Prefetch the route using Next.js router prefetch
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      link.as = 'document';
      document.head.appendChild(link);
    });
  }, { timeout: 2000 });
}

/**
 * Preload images for better perceived performance
 */
export function preloadImages(imageUrls: string[]) {
  if (typeof window === 'undefined') return;

  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
}

/**
 * Setup IntersectionObserver for lazy loading components
 */
export function setupLazyLoading() {
  if (typeof window === 'undefined' || !window.IntersectionObserver) return;

  const lazyElements = document.querySelectorAll('[data-lazy]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        element.classList.add('loaded');
        observer.unobserve(element);
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.01
  });

  lazyElements.forEach(element => observer.observe(element));
}