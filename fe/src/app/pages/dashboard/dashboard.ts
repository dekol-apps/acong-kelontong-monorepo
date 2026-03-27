import { Component, OnInit, inject } from '@angular/core';
import { GeneralService } from '../../services/general/general.service';
import { IPortofolio } from '../../types/interfaces/finance.interface';
import { CommonModule } from '@angular/common';
import { CURRENCY_FORMAT } from '../../types/constants/common.constants';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  portofolio?: IPortofolio = {};
  service = inject(GeneralService);

  CURRENCY_FORMAT = CURRENCY_FORMAT

  ngOnInit(): void {
    this.service.getPortofolio().subscribe({
      next: (res) => {
        this.portofolio = res;
      }
    })
  }
}
