import { HttpInterceptorFn, HttpContextToken } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { AuthService } from '../services/auth.service';

// Per-request opt-out: req = req.clone({ context: req.context.set(BYPASS_AUTH, true) });
export const BYPASS_AUTH = new HttpContextToken<boolean>(() => false);

// Endpoints that MUST NOT carry Authorization
const EXCLUDED: (string | RegExp)[] = [
  '/auth/login',
  '/auth/register',
  '/auth/password/forget',
  '/auth/password/otp/verify',
  '/auth/password/reset',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // Bypass (by context)
  if (req.context.get(BYPASS_AUTH) === true) {
    return next(req);
  }

  // Excluded endpoints
  const isExcluded = EXCLUDED.some((p) =>
    typeof p === 'string' ? req.url.includes(p) : p.test(req.url)
  );

  // SSR-safe language resolution
  const getLang = (): string => {
    if (isBrowser) {
      const ls = localStorage.getItem('language');
      if (ls) return ls;
      const htmlLang = document?.documentElement?.getAttribute('lang');
      if (htmlLang) return htmlLang;
    }
    return 'en';
  };

  // Base headers (always)
  let headers: Record<string, string> = {
    Accept: 'application/json',
    'X-LOCALIZE': getLang(),
  };

  // Token (browser only & not excluded)
  if (isBrowser && !isExcluded) {
    const auth = inject(AuthService);
    const token = auth.getToken();
    if (token) {
      headers = { ...headers, Authorization: `Bearer ${token}` };
    }
  }

  return next(req.clone({ setHeaders: headers }));
};
