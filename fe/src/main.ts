import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeId from '@angular/common/locales/id';
import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(localeId);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
