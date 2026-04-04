import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type TLanguage = 'en' | 'id';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly translateService = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly languageStorageKey = 'app.language';
  private readonly supportedLanguages: TLanguage[] = ['en', 'id'];
  private readonly fallbackLanguage: TLanguage = 'en';

  init(): void {
    this.translateService.addLangs(this.supportedLanguages);
    this.translateService.setDefaultLang(this.fallbackLanguage);

    const initialLanguage = this.getInitialLanguage();
    this.setLanguage(initialLanguage);
  }

  getCurrentLanguage(): TLanguage {
    const activeLanguage = this.translateService.currentLang as TLanguage | undefined;
    if (activeLanguage && this.supportedLanguages.includes(activeLanguage)) {
      return activeLanguage;
    }

    return this.fallbackLanguage;
  }

  setLanguage(language: TLanguage): void {
    this.translateService.use(language);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.languageStorageKey, language);
    }
  }

  toggleLanguage(): void {
    const nextLanguage: TLanguage = this.getCurrentLanguage() === 'en' ? 'id' : 'en';
    this.setLanguage(nextLanguage);
  }

  private getInitialLanguage(): TLanguage {
    if (isPlatformBrowser(this.platformId)) {
      const persistedLanguage = localStorage.getItem(this.languageStorageKey) as TLanguage | null;
      if (persistedLanguage && this.supportedLanguages.includes(persistedLanguage)) {
        return persistedLanguage;
      }

      const browserLanguage = (navigator.language || '').slice(0, 2) as TLanguage;
      if (this.supportedLanguages.includes(browserLanguage)) {
        return browserLanguage;
      }
    }

    return this.fallbackLanguage;
  }
}
