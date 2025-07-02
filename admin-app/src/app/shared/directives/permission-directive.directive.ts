import { Directive, ElementRef, input, OnInit } from '@angular/core';
import { AuthService } from '@app/shared/services/auth.service';

@Directive({
  selector: '[appPermission]',
  standalone: true
})
export class PermissionDirective implements OnInit {
  appFunction = input.required<string>();
  appAction = input.required<string>();

  constructor(
    private el: ElementRef,
    private authService: AuthService
  ) {}
  ngOnInit() {
    const loggedInUser = this.authService.isAuthenticated();
    if (loggedInUser) {
      if (
        this.authService?.permissions()?.filter((x) => x === this.appFunction() + '_' + this.appAction()).length > 0
      ) {
        this.el.nativeElement.style.display = '';
      } else {
        this.el.nativeElement.style.display = 'none';
      }
    } else {
      this.el.nativeElement.style.display = 'none';
    }
  }
}
