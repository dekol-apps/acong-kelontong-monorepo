import { Component } from '@angular/core';
import { Alert } from '../../../shared/components/alert/alert';
import { PageSpinner } from '../../../shared/components/page-spinner/page-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageToggle } from '../../../shared/components/language-toggle/language-toggle';

@Component({
  selector: 'app-register',
  imports: [Alert, PageSpinner, TranslateModule, LanguageToggle],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

}
