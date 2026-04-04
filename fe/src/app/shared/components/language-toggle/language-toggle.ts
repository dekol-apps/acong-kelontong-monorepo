import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService, TLanguage } from '../../../services/language/language.service';

@Component({
  selector: 'app-language-toggle',
  imports: [CommonModule, TranslateModule],
  templateUrl: './language-toggle.html',
  styleUrl: './language-toggle.scss'
})
export class LanguageToggle {
  constructor(public languageService: LanguageService) {}

  setLanguage(language: TLanguage): void {
    this.languageService.setLanguage(language);
  }

  isActiveLanguage(language: TLanguage): boolean {
    return this.languageService.getCurrentLanguage() === language;
  }
}
