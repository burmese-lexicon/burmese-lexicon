import { Router } from 'aurelia-router'
import { autoinject } from 'aurelia-dependency-injection'

@autoinject
export class WordsPage {
  constructor (private element: Element, private router: Router) {}

  attached () {
    const id = `word-list-${Date.now()}`
    this.element.querySelector('.word-list-segment').id = id
    jQuery(this.element).find('.ui.sticky').sticky({
      context: `#${id}`
    })
  }
}
