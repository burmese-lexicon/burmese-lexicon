import { autoinject, bindable, bindingMode } from 'aurelia-framework'
import 'trumbowyg'

@autoinject
export class TextEditor {
  @bindable({defaultBindingMode: bindingMode.twoWay}) text: string
  @bindable placeholder: string = ''
  @bindable maxlength: number

  constructor (private element: Element) {}

  attached () {
    jQuery(this.element.querySelector('textarea')).trumbowyg({
      svgPath: '/images/editor-icons.svg',
      minimalLinks: true,
      btns: [
        ['formatting'],
        ['strong', 'em'],
        ['superscript', 'subscript'],
        ['link'],
        ['insertImage'],
        ['unorderedList', 'orderedList'],
        ['horizontalRule'],
        ['removeformat'],
        ['fullscreen']
      ]
    }).on('tbwchange', () => {
      this.text = jQuery(this.element.querySelector('textarea')).trumbowyg('html')
    })
  }

  detached () {
    jQuery(this.element.querySelector('textarea')).trumbowyg('destroy')
  }
}
