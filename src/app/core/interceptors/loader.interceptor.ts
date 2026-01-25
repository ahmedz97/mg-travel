import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '../services/loader.service';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  // const spinner = inject(NgxSpinnerService);
  // const router = inject(Router);

  // 🧭 current route path
  // const currentRoute = router.url;

  // 🛑 routes you want to ignore loader for
  // const ignoredRoutes = ['/faq'];

  // const shouldIgnore = ignoredRoutes.some((r) => currentRoute.startsWith(r));

  // if (shouldIgnore) {
  //   return next(req); // no loader for this page
  // }

  loaderService.show();
  return next(req).pipe(finalize(() => loaderService.hide()));
};
