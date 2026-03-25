import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CashflowIn } from './cashflow-in/cashflow-in';
import { CashflowOut } from './cashflow-out/cashflow-out';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cashflow',
  imports: [NgbNavModule, CommonModule, RouterModule, CashflowIn, CashflowOut],
  standalone: true,
  templateUrl: './cashflow.html',
  styleUrl: './cashflow.scss'
})
export class Cashflow {
  tab = 1;
}
