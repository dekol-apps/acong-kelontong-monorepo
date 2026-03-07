import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DragDropFileComponent, IFielImg } from '../drag-drop-file/drag-drop-file.component';
import { TenMegaByte } from '../../../types/constants/common.constants';

@Component({
  selector: 'app-drag-drop-file-multi',
  imports: [DragDropFileComponent],
  templateUrl: './drag-drop-file-multi.html',
  styleUrl: './drag-drop-file-multi.scss'
})
export class DragDropFileMulti {

  @Output() fileChanged: EventEmitter<IFielImg[]> = new EventEmitter();
  @Output() previewHandler: EventEmitter<Event> = new EventEmitter<Event>();

  @ViewChild('hiddenInput') hiddenInput?: ElementRef;
  @Input() disabled?: boolean;
  @Input() elementId: string = '';
  @Input() error?: boolean;
  @Input() fileTypes: string[] = ['jpg', 'jpeg', 'png'];
  @Input() maxSize: number = TenMegaByte; // Default 10 MB
  @Input() componentName: string = '';
  @Input() haveAction?: boolean = true;
  @Input() loading?: boolean;
  @Input() message: string = 'Click to browse image';

  private _patchFileVal: IFielImg[] = [];
  @Input()
  set patchFileVal(value: IFielImg[]) {
    this._patchFileVal = value?.length ? value : this._patchFileVal;
  }
  get patchFileVal(): IFielImg[] {
    return this._patchFileVal;
  }

  addFile(evt: IFielImg) {
    this.patchFileVal.push(evt);
    this.fileChanged.emit(this.patchFileVal);
    console.log('patchFileVal', this.patchFileVal);
  }

  deleteFile(idx: number) {
    this.patchFileVal.splice(idx, 1);
    this.fileChanged.emit(this.patchFileVal);
    console.log('deleteFile',idx, this.patchFileVal);
  }
}
