import { autoinject } from 'aurelia-dependency-injection'

@autoinject
export class ModalDialog {
  constructor (private element: Element) {}

  show () {
    jQuery(this.element).find('.ui.modal').modal('show')
  }

  hide () {
    jQuery(this.element).find('.ui.modal').modal('hide')
  }

  toggle () {
    jQuery(this.element).find('.ui.modal').modal('toggle')
  }
}
