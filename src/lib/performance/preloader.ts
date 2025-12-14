/**
 * Route preloading utilities for better perceived performance
 */

interface PreloadConfig {
  route: string;
  priority: 'high' | 'medium' | 'low';
  condition?: () => boolean;
}

/**
 * Critical user flows that should be preloaded
 */
const CRITICAL_ROUTES: PreloadConfig[] = [
  { route: '/dashboard', priority: 'high', condition: () => !!document.cookie.includes('supabase-auth-token') },
  { route: '/smart-prompts', priority: 'high' },
  { route: '/certificates', priority: 'medium' },
  { route: '/login', priority: 'medium', condition: () => !document.cookie.includes('supabase-auth-token') },
  { route: '/resources', priority: 'low' }
];

/**
 * Preload critical routes based on user context
 */
export function preloadCriticalRoutes(): void {
  if (typeof window === 'undefined') return;

  // Use requestIdleCallback for better performance
  const preloadRoute = (route: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  };

  const schedulePreload = (callback: () => void) => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(callback, { timeout: 2000 });
    } else {
      setTimeout(callback, 100);
    }
  };

  CRITICAL_ROUTES.forEach(({ route, priority, condition }) => {
    // Check condition if provided
    if (condition && !condition()) return;

    const delay = priority === 'high' ? 0 : priority === 'medium' ? 500 : 1000;

    schedulePreload(() => {
      setTimeout(() => preloadRoute(route), delay);
    });
  });
}

/**
 * Preload component chunks for better UX
 */
export function preloadComponents(): void {
  if (typeof window === 'undefined') return;

  const componentsToPreload = [
    () => import('@/components/features/prompts/SmartPromptsBuilder'),
    () => import('@/components/features/payments/PayPalPaymentModal'),
    () => import('@/components/features/auth/LoginPageClient')
  ];

  componentsToPreload.forEach((importFn, index) => {
    setTimeout(() => {
      importFn().catch(() => {
        // Silently handle preload failures
      });
    }, index * 200);
  });
}

/**
 * Smart preloading based on user interaction
 */
export function initializeSmartPreloading(): void {
  if (typeof window === 'undefined') return;

  // Preload on mouse hover with delay
  const preloadOnHover = (selector: string, route: string) => {
    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest(selector)) {
        setTimeout(() => preloadRoute(route), 100);
      }
    });
  };

  // Set up hover preloading for common navigation
  preloadOnHover('[href="/smart-prompts"]', '/smart-prompts');
  preloadOnHover('[href="/dashboard"]', '/dashboard');
  preloadOnHover('[href="/certificates"]', '/certificates');
}

/**
 * Preload specific route
 */
function preloadRoute(route: string): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  document.head.appendChild(link);
}

/**
 * Initialize all performance optimizations
 */
export function initializePerformanceOptimizations(): void {
  // Run after initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        preloadCriticalRoutes();
        preloadComponents();
        initializeSmartPreloading();
      }, 1000);
    });
  } else {
    setTimeout(() => {
      preloadCriticalRoutes();
      preloadComponents();
      initializeSmartPreloading();
    }, 1000);
  }
}