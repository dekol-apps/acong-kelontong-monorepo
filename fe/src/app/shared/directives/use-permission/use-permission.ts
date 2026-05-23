import { Directive, ElementRef, Input, OnChanges, OnInit, Renderer2 } from '@angular/core';
import { AuthService } from '../../../services/auth/auth-service';
import { TModules } from '../../../types/interfaces/user.interface';

@Directive({
  selector: '[usePermission]',
  standalone: true,
})
export class UsePermission implements OnInit, OnChanges {
  @Input() usePermission = true;
  @Input() permissions: TModules[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly elementRef: ElementRef,
    private readonly renderer: Renderer2,
    private readonly auth: AuthService
  ) { }

  ngOnInit(): void {
    this.applyVisibility();
  }

  ngOnChanges(): void {
    this.applyVisibility();
  }

  private applyVisibility() {
    if (!this.usePermission) {
      this.renderer.setProperty(this.elementRef.nativeElement, 'hidden', false);
      return;
    }
    const isAllowed = this.auth.permissions(this.permissions);
    this.renderer.setProperty(this.elementRef.nativeElement, 'hidden', !isAllowed);
  }
}