import { autoinject } from 'aurelia-framework';

@autoinject
export class WordSearch {
  constructor(private element: Element) {}

  attached() {
    const
      content = [
        {
          title: 'ကျောင်း',
          description: 'စာသင်သည့် နေရာ',
        },
        {
          title: 'ကံ',
          description: 'ကိုယ်တုိင် အားထုတ်မှု မပါဘဲ ဖြစ်နုိင်ခြေ',
        }
      ]
      ;
    jQuery(this.element).find('.ui.search')
      .search({
        source: content,
        searchFields: [
          'title'
        ]
      })
  }
}
