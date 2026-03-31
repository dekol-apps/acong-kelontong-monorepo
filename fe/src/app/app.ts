import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './services/language/language.service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('acong-kelontong-monorepo-fe');

  constructor(private languageService: LanguageService) {
    this.languageService.init();
  }
}
