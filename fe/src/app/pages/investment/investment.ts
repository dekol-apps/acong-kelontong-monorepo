import { Component } from '@angular/core';
import { NgbNavContent, NgbNav, NgbNavItem, NgbNavItemRole, NgbNavLinkButton, NgbNavLinkBase, NgbNavOutlet } from '@ng-bootstrap/ng-bootstrap';
import { Deposit } from './deposit/deposit';
import { Withdrawal } from './withdrawal/withdrawal';

@Component({
  selector: 'app-investment',
	imports: [NgbNavContent, NgbNav, NgbNavItem, NgbNavItemRole, NgbNavLinkButton, NgbNavLinkBase, NgbNavOutlet, Deposit, Withdrawal],
  standalone: true,
  templateUrl: './investment.html',
  styleUrl: './investment.scss'
})
export class Investment {
	tab = 1;
}
