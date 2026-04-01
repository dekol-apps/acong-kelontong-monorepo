import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountingService } from '../../../services/accounting/accounting.service';
import { IPortofolio } from '../../../types/interfaces/finance.interface';
import { TranslateModule } from '@ngx-translate/core';

interface IChartBar {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

@Component({
  selector: 'app-finance-report',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './finance-report.html',
  styleUrl: './finance-report.scss'
})
export class FinanceReport implements OnInit {
  portfolio?: IPortofolio;
  isLoading = true;
  today = new Date();

  private accountingService = inject(AccountingService);

  get chartBars(): IChartBar[] {
    if (!this.portfolio) return [];
    const values = [
      { label: 'Revenue', value: this.portfolio.revenue ?? 0, color: '#198754' },
      { label: 'COGS', value: this.portfolio.cogs ?? 0, color: '#dc3545' },
      { label: 'Profit', value: this.portfolio.profit ?? 0, color: '#0dcaf0' },
      { label: 'Investment', value: this.portfolio.investment ?? 0, color: '#6f42c1' },
      { label: 'Total Assets', value: this.portfolio.totalAssets ?? 0, color: '#fd7e14' },
      { label: 'Equity', value: this.portfolio.equity ?? 0, color: '#20c997' },
    ];
    const max = Math.max(...values.map(v => Math.abs(v.value)), 1);
    return values.map(v => ({
      ...v,
      percentage: Math.round((Math.abs(v.value) / max) * 100)
    }));
  }

  get summaryCards() {
    const p = this.portfolio;
    return [
      { label: 'Balance', value: p?.balance ?? 0, icon: 'bi-wallet2', color: 'success', description: 'FINREP_DESC_BALANCE' },
      { label: 'Revenue', value: p?.revenue ?? 0, icon: 'bi-graph-up-arrow', color: 'primary', description: 'FINREP_DESC_REVENUE' },
      { label: 'Profit', value: p?.profit ?? 0, icon: 'bi-piggy-bank', color: 'info', description: 'FINREP_DESC_PROFIT' },
      { label: 'Investment', value: p?.investment ?? 0, icon: 'bi-bank', color: 'warning', description: 'FINREP_DESC_INVESTMENT' },
      { label: 'Total Assets', value: p?.totalAssets ?? 0, icon: 'bi-box-seam', color: 'secondary', description: 'FINREP_DESC_TOTAL_ASSETS' },
      { label: 'Equity', value: p?.equity ?? 0, icon: 'bi-shield-check', color: 'danger', description: 'FINREP_DESC_EQUITY' },
    ];
  }

  ngOnInit(): void {
    this.accountingService.getPortfolio().subscribe({
      next: (res) => {
        this.portfolio = res;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
