import { ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TenMegaByte } from '../../../types/constants/common.constants';
import { AlertService } from '../alert/alert-service';
export interface IFielImg { file?: File | null, src?: string };

@Component({
  selector: 'app-drag-drop-file',
  templateUrl: './drag-drop-file.component.html',
  styleUrls: ['./drag-drop-file.component.scss']
})
export class DragDropFileComponent implements OnChanges {
  private cdRef = inject(ChangeDetectorRef);

  @Output() fileChanged: EventEmitter<IFielImg> = new EventEmitter();
  @Output() deleteHandler: EventEmitter<Event> = new EventEmitter<Event>();
  @Output() previewHandler: EventEmitter<Event> = new EventEmitter<Event>();

  @ViewChild('hiddenInput') hiddenInput?: ElementRef;
  @Input() disabled?: boolean;
  @Input() elementId: string = '';
  @Input() error?: boolean;
  @Input() fileTypes: string[] = ['jpg', 'jpeg', 'png'];
  @Input() maxSize: number = TenMegaByte; // Default 10 MB
  @Input() patchFileVal?: IFielImg;
  @Input() componentName: string = '';
  @Input() haveAction?: boolean = true;
  @Input() loading?: boolean;
  @Input() message: string = 'Click to browse image';

  isDragging: boolean = false;
  dragEnter: boolean = false;
  // file: IFielImg['file'] = null;
  fileVal?: string = '';

  constructor(private alert: AlertService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.patchFileVal) {
      this.fileVal = this.patchFileVal?.src;
    }
  }

  filterFileInput() {
    const formats: string[] = [...this.fileTypes];
    formats.forEach((item, index) => {
      formats[index] = `.${item}`;
    });
    return formats;
  }

  reset() {
    // this.file = null;
    this.fileVal = '';
    this.cdRef.detectChanges();
  }

  validateFile(file: File) {
    if (this.disabled) return;
    try {
      this.loading = true;
      const fileExtension = file.name.split('.').pop()?.toLowerCase() as string;
      if (!this.fileTypes.includes(fileExtension)) {
        window.alert('Invalid file type!');
        // this.toast.error('Invalid file type!');
      } else if (file.size > this.maxSize) {
        window.alert('File size max 10MB!');
        // this.toast.error('File size max 10MB!');
      } else {
        this.loading = true;
        // this.file = file;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          const base64 = reader.result;
          const source = base64!.toString();
          // this.fileVal = source;validateFile
          this.fileChanged.emit({ file, src: source });
        };
      }
      this.loading = false;
    }
    catch (err) {
      this.alert.error('UPLOAD_FILE.SYSTEM_ERROR');
    } finally {
      this.isDragging = false;
    }
  }
  handleFileInput(event: any) {
    this.validateFile(event.target.files[0]);
    event.target.value = null; //clear cache
  }

  handleDragOver(event: any) {
    event.preventDefault();
  }

  handleDragMove(event: any) {
    if (!event.relatedTarget || !this.elementContains(event.currentTarget as HTMLElement, event.relatedTarget as HTMLElement)) {
      this.isDragging = false;
    } else {
      this.isDragging = true;
    }
  }

  private elementContains(parent: HTMLElement, child: HTMLElement): boolean {
    return parent.contains(child);
  }

  handleDrop(event: any) {
    event.preventDefault();
    this.validateFile(event.dataTransfer.files[0]);
  }

  deleteClicked(): void {
    this.reset();
    this.deleteHandler.emit();
  }

  download(url: string): void {
    const filename = url.split('/').pop();
    let link: any = document.createElement('a');
    link.id = filename;
    link.href = url;
    link.target = '_blank';
    link.download = filename;
    link.click();
    link = null;
  }

  @ViewChild('imgRef') imgRef!: ElementRef<HTMLImageElement>;

  triggerFullscreen() {
    const img = this.imgRef.nativeElement;

    if (img.requestFullscreen) {
      img.requestFullscreen();
    } else if ((img as any).webkitRequestFullscreen) {
      (img as any).webkitRequestFullscreen(); // iOS Safari / WKWebView
    }
  }

}