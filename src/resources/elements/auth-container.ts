import { AuthService } from 'services/auth-service'
import { autoinject } from 'aurelia-framework'

@autoinject
export class AuthContainer {
  constructor (private element: Element, private authService: AuthService) {}

  attached () {
    this.authService.renderProvidersToContainer(this.element.querySelector('.auth-container'), null)
  }
}
