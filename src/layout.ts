import { autoinject } from 'aurelia-framework'
import { Router, RouterConfiguration } from 'aurelia-router'

@autoinject
export class Layout {
  private pageName: string

  constructor (private router: Router) {
    this.pageName = router.currentInstruction.config.name
  }
}
