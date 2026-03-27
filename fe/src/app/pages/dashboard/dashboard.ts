import { Component, OnInit, inject } from '@angular/core';
import { GeneralService } from '../../services/general/general.service';
import { IPortofolio } from '../../types/interfaces/finance.interface';
import { CommonModule } from '@angular/common';
import { RupiahPipe } from '../../shared/pipes/rupiah.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RupiahPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  portofolio?: IPortofolio = {};
  service = inject(GeneralService);

  ngOnInit(): void {
    this.service.getPortofolio().subscribe({
      next: (res) => {
        this.portofolio = res;
      }
    })
  }
}
