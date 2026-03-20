import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IPaginationOutput } from '../../../types/interfaces/common.interface';

import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pagination',
  imports: [NgbPaginationModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss'
})
export class Pagination implements OnChanges {
  @Output() paginationChanged: EventEmitter<IPaginationOutput> = new EventEmitter<IPaginationOutput>();
  @Input() size: IPaginationOutput['size'] = 10; //DEFAULT
  @Input() totalData: number = 0;
  @Input() pageRange: number = 2;
  @Input() zeroIndexed: boolean = true;
  get adjuster(): number { return this.zeroIndexed ? 1 : 0 }
  displayPage: number = 1;
  @Input()
  get page(): number { return this.displayPage - this.adjuster }
  set page(x: number) { this.displayPage = x + this.adjuster };

  get zeroIndexedActivePage(): number { return this.page - (this.zeroIndexed ? 0 : 1) }

  get totalPages(): number { return Math.max(1, Math.ceil(this.totalData / this.size)) }
  get entryFrom(): number {
    if (this.totalData > 0) return this.zeroIndexedActivePage * this.size + 1;
    return 0;
  }
  get entryTo(): number {
    return Math.min((this.zeroIndexedActivePage + 1) * this.size, this.totalData);
  }

  sizeOptions: number[] = [10, 25, 50, 100];

  constructor(private cd: ChangeDetectorRef) {
  }
  changePage(pageNumber: number) {
    if (pageNumber < 1 || pageNumber > this.totalPages) return;
    this.page = pageNumber - this.adjuster;
    this.paginationChanged.emit({ page: this.page, size: this.size });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      this.cd.detectChanges();
    }
  }
  // prevPage() {
  //   this.changePage(this.displayPage - 1);
  // }
  // nextPage() {
  //   this.changePage(this.displayPage + 1);
  // }

  changeSize(evt: any) {
    this.size = evt.target.value;
    this.page = 0;
    this.paginationChanged.emit({ page: 0, size: this.size });
  }
}
