import { AuthService } from './../../services/auth-service'
import { NavigationInstruction, Next, Redirect, RedirectToRoute } from 'aurelia-router'
import { autoinject } from 'aurelia-framework'

@autoinject
export class AuthorizeStep {
  constructor (private authService: AuthService) {
    this.authService = authService
  }

  run (navigationInstruction: NavigationInstruction, next: Next): Promise<any> {
    const isLoggedIn = this.authService.user
    if (navigationInstruction.getAllInstructions().some(i => i.config.settings.auth)) {
      if (!isLoggedIn) {
        this.authService.targetNavInstruction = navigationInstruction
        return next.cancel(new RedirectToRoute('login'))
      }
    }

    if (navigationInstruction.config.name === 'login' && isLoggedIn) {
      return next.cancel(new RedirectToRoute('home'))
    }

    return next()
  }
}
