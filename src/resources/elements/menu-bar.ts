import { AuthService } from 'services/auth-service'
import { bindable, autoinject } from 'aurelia-framework'
import { Router } from 'aurelia-router'

@autoinject
export class MenuBar {
  @bindable router: Router

  constructor (private element: Element, private authService: AuthService) {}

  toggleSidebar () {
    // just reach out to outer element ~_~
    jQuery('.sidebar').sidebar('toggle')
  }
}
