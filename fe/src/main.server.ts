import { provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeId from '@angular/common/locales/id';
import { App } from './app/app';
import { config } from './app/app.config.server';

registerLocaleData(localeId);

const bootstrap = (context: BootstrapContext) => bootstrapApplication(App, {...config, providers: [provideZoneChangeDetection(), ...config.providers]}, context);

export default bootstrap;
