import { Directive, ElementRef, Renderer2, Optional, OnInit, OnDestroy } from '@angular/core';
import { ControlContainer, Validators, AbstractControl, FormGroup } from '@angular/forms';
import { startWith, Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[appAutoWildcard]'
})
export class AutoWildcard implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private el: ElementRef<HTMLLabelElement>,
    private renderer: Renderer2,
    @Optional() private controlContainer: ControlContainer
  ) { }

  ngOnInit(): void {
    const label = this.el.nativeElement;
    const controlName = label.getAttribute('for');
    if (!controlName) return;

    const formGroup = this.controlContainer?.control as FormGroup;
    if (!formGroup) return;

    const control = formGroup.get(controlName);
    if (!control) return;

    // Listen to status changes to catch dynamic validator additions
    control.statusChanges.pipe(
      startWith(control.status),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.checkRequired(control, label);
    });
  }

  private checkRequired(control: AbstractControl, label: HTMLLabelElement) {
    if (control.hasValidator?.(Validators.required)) {
      this.renderer.addClass(label, 'required');
    } else {
      this.renderer.removeClass(label, 'required');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}