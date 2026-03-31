import { Component } from '@angular/core';
import { Alert } from '../../../shared/components/alert/alert';
import { PageSpinner } from '../../../shared/components/page-spinner/page-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageToggle } from '../../../shared/components/language-toggle/language-toggle';

@Component({
  selector: 'app-page-not-found',
  imports: [Alert, PageSpinner, TranslateModule, LanguageToggle],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.scss'
})
export class PageNotFound {

}
