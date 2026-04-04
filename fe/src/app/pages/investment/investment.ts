import { Component } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { Deposit } from './deposit/deposit';
import { Withdrawal } from './withdrawal/withdrawal';

@Component({
  selector: 'app-investment',
  imports: [NgbNavModule, Deposit, Withdrawal],
  standalone: true,
  templateUrl: './investment.html',
  styleUrl: './investment.scss'
})
export class Investment {
  tab = 1;
}
