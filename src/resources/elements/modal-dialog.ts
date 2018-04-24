import { autoinject } from 'aurelia-dependency-injection'

@autoinject
export class ModalDialog {
  private id: string

  constructor (private element: Element) {}

  attached () {
    this.id = `modal-dialog-${Date.now()}`
    this.element.querySelector('.ui.modal').id = this.id
  }

  detached () {
    // semantic ui moves the content to body, so it needs to be removed manually
    if (document.querySelector(this.id)) {
      document.querySelector(this.id).remove()
    }
  }

  show () {
    jQuery(`#${this.id}`).modal('show')
  }

  hide () {
    jQuery(`#${this.id}`).modal('hide')
  }

  toggle () {
    jQuery(`#${this.id}`).modal('toggle')
  }
}
