import { Component } from '@angular/core';
import { NgbNavContent, NgbNav, NgbNavItem, NgbNavItemRole, NgbNavLinkButton, NgbNavLinkBase, NgbNavOutlet } from '@ng-bootstrap/ng-bootstrap';
import { ApprovalPurchasing } from './approval-purchasing/approval-purchasing';
import { ApprovalExpenses } from './approval-expenses/approval-expenses';

@Component({
  selector: 'app-approval',
	imports: [NgbNavContent, NgbNav, NgbNavItem, NgbNavItemRole, NgbNavLinkButton, NgbNavLinkBase, NgbNavOutlet, ApprovalPurchasing, ApprovalExpenses],
  standalone: true,
  templateUrl: './approval.html',
  styleUrl: './approval.scss'
})
export class Approval {
	tab = 1;
}
