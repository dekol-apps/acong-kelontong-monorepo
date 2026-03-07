import { Directive, ElementRef, Renderer2, Optional } from '@angular/core';
import { ControlContainer, Validators } from '@angular/forms';

@Directive({
  selector: '[appAutoWildcard]'
})
export class AutoWildcard {

  constructor(
    private el: ElementRef<HTMLLabelElement>,
    private renderer: Renderer2,
    @Optional() private controlContainer: ControlContainer
  ) { }

  ngOnInit(): void {
    const label = this.el.nativeElement;

    const controlName = label.getAttribute('for');
    if (!controlName) return;

    const formGroup = this.controlContainer?.control;
    if (!formGroup) return;

    const control = formGroup.get(controlName);
    if (!control) return;

    if (control.hasValidator?.(Validators.required)) {
      this.renderer.addClass(label, 'required');
    }
  }
}