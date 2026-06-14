/**
 * Maps Angular route segment → CMS pages[].key (when they differ).
 * MG Travel — compare app.routes.ts paths with GET /pages keys.
 */
export const PAGE_SEO_ROUTE_KEYS: Record<string, string> = {
  about: 'about-us',
  blog: 'blog',
  contact: 'contact-us',
  faq: 'faqs',
  makeTrip: 'make-trip',
  forgetPassword: 'forget-password',
  tour: 'tours',
  destination: 'destinations',
};

export function resolveCmsKeyFromRoute(routePath: string): string {
  return PAGE_SEO_ROUTE_KEYS[routePath] ?? routePath;
}
