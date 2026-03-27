import { ApplicationConfig, DEFAULT_CURRENCY_CODE, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { NoPreloading, provideRouter, withPreloading } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { loaderInterceptor } from './services/interceptors/loader/loader-interceptor';
import { errorInterceptor } from './services/interceptors/error/error-interceptor';
import { tokenInterceptor } from './services/interceptors/token/token-interceptor';
import { DATE_FORMAT } from './types/constants/common.constants';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(NoPreloading)),
    provideClientHydration(withEventReplay()),
    { provide: LOCALE_ID, useValue: 'id' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'IDR' },
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { dateFormat: DATE_FORMAT } },

    provideHttpClient(
      withFetch(),
      withInterceptors([
        loaderInterceptor,
        tokenInterceptor,
        errorInterceptor, // order matters, loader runs first, error last
      ])
    )
  ]
};
