/**
 * Performance monitoring utilities for tracking optimization effectiveness
 */

interface PerformanceMetrics {
  timeToFirstByte: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  bundleSize: number;
  routeChangeTime: number;
}

/**
 * Track Core Web Vitals and custom metrics
 */
export function initializePerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Track FCP (First Contentful Paint)
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        switch (entry.name) {
          case 'first-contentful-paint':
            recordMetric('FCP', entry.startTime);
            break;
        }
      });
    });

    observer.observe({ entryTypes: ['paint'] });

    // Track LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      recordMetric('LCP', lastEntry.startTime);
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Track FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        recordMetric('FID', entry.processingStart - entry.startTime);
      });
    });

    fidObserver.observe({ entryTypes: ['first-input'] });

    // Track CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      recordMetric('CLS', clsValue);
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }

  // Track route change performance
  trackRouteChanges();
}

/**
 * Record performance metric
 */
function recordMetric(name: string, value: number): void {
  // TODO: Consider structured logging for performance metrics in production
  // Performance metrics are intentionally logged in development for optimization

  // Send to analytics in production
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', 'performance_metric', {
      metric_name: name,
      metric_value: Math.round(value),
      custom_parameter: 'promptopotamus_performance'
    });
  }
}

/**
 * Track route change performance
 */
function trackRouteChanges(): void {
  let routeChangeStart: number;

  // Listen for Next.js route changes
  if (typeof window !== 'undefined') {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      routeChangeStart = performance.now();
      originalPushState.apply(this, args);
      measureRouteChange();
    };

    history.replaceState = function(...args) {
      routeChangeStart = performance.now();
      originalReplaceState.apply(this, args);
      measureRouteChange();
    };

    window.addEventListener('popstate', () => {
      routeChangeStart = performance.now();
      measureRouteChange();
    });
  }

  function measureRouteChange() {
    // Wait for route to settle
    setTimeout(() => {
      const routeChangeEnd = performance.now();
      const duration = routeChangeEnd - routeChangeStart;
      recordMetric('Route Change', duration);
    }, 100);
  }
}

/**
 * Track bundle size impact
 */
export function trackBundleMetrics(): void {
  if (typeof window === 'undefined') return;

  // Track initial bundle size from performance entries
  window.addEventListener('load', () => {
    const navigationEntries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigationEntries) {
      recordMetric('DOM Content Loaded', navigationEntries.domContentLoadedEventEnd - navigationEntries.fetchStart);
      recordMetric('Load Complete', navigationEntries.loadEventEnd - navigationEntries.fetchStart);
    }

    // Track resource sizes
    const resourceEntries = performance.getEntriesByType('resource');
    let totalJSSize = 0;
    let totalCSSSize = 0;

    resourceEntries.forEach((entry: any) => {
      if (entry.name.includes('.js')) {
        totalJSSize += entry.transferSize || 0;
      } else if (entry.name.includes('.css')) {
        totalCSSSize += entry.transferSize || 0;
      }
    });

    recordMetric('Total JS Size (KB)', totalJSSize / 1024);
    recordMetric('Total CSS Size (KB)', totalCSSSize / 1024);
  });
}

/**
 * Performance budget monitoring
 */
export const PERFORMANCE_BUDGETS = {
  FCP: 1500,      // First Contentful Paint < 1.5s
  LCP: 2500,      // Largest Contentful Paint < 2.5s  
  FID: 100,       // First Input Delay < 100ms
  CLS: 0.1,       // Cumulative Layout Shift < 0.1
  RouteChange: 500, // Route changes < 500ms
  JSBundle: 250,  // JavaScript bundle < 250KB
} as const;

/**
 * Check if metric exceeds budget
 */
export function checkPerformanceBudget(metric: string, value: number): boolean {
  const budget = PERFORMANCE_BUDGETS[metric as keyof typeof PERFORMANCE_BUDGETS];
  
  if (budget && value > budget) {
    // TODO: Consider structured logging for performance budget violations
    return false;
  }
  
  return true;
}

/**
 * Generate performance report
 */
export function generatePerformanceReport(): void {
  if (typeof window === 'undefined') return;

  // TODO: Consider implementing structured performance reporting for production monitoring
  // This development-only performance report helps with optimization
  
  if (process.env.NODE_ENV === 'development') {
    // Performance reporting retained for development optimization
    const report: any = { timestamp: Date.now(), metrics: {} };
    
    // Get Core Web Vitals
    if ('PerformanceObserver' in window) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        const value = Math.round(entry.startTime);
        const budgetOk = checkPerformanceBudget(entry.name.toUpperCase().replace('-', '_'), value);
        report.metrics[entry.name] = { value, budgetOk };
      });
    }

    // Get resource timing
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationTiming) {
      const ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
      const domLoad = navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart;
      
      report.metrics.ttfb = Math.round(ttfb);
      report.metrics.domLoad = Math.round(domLoad);
    }

    // Log structured report in development



  }
}