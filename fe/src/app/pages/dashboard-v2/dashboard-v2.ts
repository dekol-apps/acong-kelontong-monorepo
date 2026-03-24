import { Component, inject, OnInit } from '@angular/core';
import { GeneralService } from '../../services/general/general.service';
import { CurrencyPipe } from '@angular/common';

export interface IPortofolio {
  balance?: number,
  investment?: number,
  capValue?: number,
  totalAsset?: number,
  totalAssets?: number,
  inventoryValue?: number,
  revenue?: number,
  profit?: number,
  cogs?: number,
  equity?: number,
}

@Component({
  selector: 'app-dashboard-v2',
  imports: [CurrencyPipe],
  templateUrl: './dashboard-v2.html',
  styleUrl: './dashboard-v2.scss'
})
export class DashboardV2 implements OnInit {
  portofolio?: IPortofolio = {};
  service = inject(GeneralService)

  ngOnInit(): void {
    this.service.getPortofolio().subscribe({
      next: (res) => {
        this.portofolio = res;
      }
    })
  }
}
