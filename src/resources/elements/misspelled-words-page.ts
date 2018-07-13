import { SocialService } from 'services/social-service'
import { PrerenderService } from 'services/prerender-service'
import pdfjs from 'pdfjs-dist/build/pdf'
import trimCanvas from 'trim-canvas'
import { autoinject } from 'aurelia-framework'

@autoinject
export class MisspelledWordsPage {
  private loadingPdf = true
  private pageOffset = 7
  private pages = [
    {
      section: 'အသံထွက်မှန်မှ',
      entries: {
        'အသံထွက်မှန်မှ': 1,
        'ကသတ်သံဖြင့်ဖတ်': 2,
        'ငသတ်သံဖြင့်ဖတ်': 4,
        'ဌာန်တူသော်လည်း': 6,
        'သံတူသံယောင်သတိဆောင်': 11
      }
    },
    {
      section: 'အက္ခရာနှင့်ကိန်းဂဏန်းရေးဆွဲပုံ',
      entries: {
        'အက္ခရာနှင့်ကိန်းဂဏန်းရေးဆွဲပုံ': 15,
        'ဝိုက်ချ မောက်ချ': 16,
        'ကိန်းဂဏန်းသင်္ကေတရေးဆွဲပုံ': 17,
        'ဂငယ် နှင့် ရှစ်': 18,
        'ရကောက် နှင့် ခုနစ်': 19,
        'ဌ နှင့် ဋ္ဌ': 20,
        'ဉကလေး နှင့် ညကြီး': 21,
        'ဍ နှင့် ၒ ဆင့်ပုံ': 22
      }
    },
    {
      section: 'စာလုံးပေါင်းသတ်ပုံ',
      entries: {
        'စာလုံးပေါင်းသတ်ပုံ': 23,
        'ပဲ နှင့် ဘဲ': 25,
        'ဖက် နှင့် ဘက်': 28,
        'ဖူး၊ ဘူး': 31,
        'အနက်စွဲ အသံစွဲ': 35,
        'မီ၊ မှီ': 40,
        'မင် နှင့် မြား': 43,
        'မလိုအပ်ဘဲပိုတတ်သောရေးချ': 46,
        'ဖြည်းဖြည်း': 52,
        'ရောထွေးတတ်သော ကာ နှင့် ခါ': 54,
        'မှားတတ်သော ပါဠိပါဌ်ဆင့်စာလုံးများ': 56
      }
    },
    {
      section: 'သဒ္ဒါအသုံးအနှုန်း',
      entries: {
        'သဒ္ဒါအသုံးအနှုန်း': 57,
        'ရောထွေးတတ်သော မှ နှင့် က': 58,
        'အသုံးမမှား ကို နှင့် အား': 61,
        'သတိပြုလေ တို့၊ များ၊ တွေ': 64,
        'အတိတ်ကို ရည်ညွှန်းလိုတိုင်း ခဲ့ သုံးရန်မလို': 67,
        'နှင့်ပို ဖြင့်ပို': 70,
        'တစ်မျိုးသာသုံးပါ': 72,
        'ခွဲခြားသိစရာ သည် နှင့် မှာ': 76,
        'နည်းတူ၊ ကဲ့သို့ ခွဲသိဖို့': 78,
        'ဆယ်ပြည့်ကိန်းများကို ရေတွက်သော်': 81
      }
    },
    {
      section: 'ဝါကျဖွဲ့စည်းပုံ',
      entries: {
        'ဝါကျအထားအသို': 84,
        'ဝါကျဖွဲ့စည်းပုံ မညီညွတ်ခြင်း': 95,
        'ဝါကျတွင်း ဖွဲ့စည်းပုံ ပိုခြင်း၊ လိုခြင်း': 100
      }
    }
  ]
  private accordion: Element
  private pdfLoadError: string = ''
  private pdf

  constructor (private ss: SocialService, private ps: PrerenderService) {}

  created () {
    const url = '/documents/misspelled-words-compressed.pdf'
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
    const loadingTask = pdfjs.getDocument(url)
    loadingTask.promise.then(pdf => {
      this.pdf = pdf
      this.loadingPdf = false
    }, reason => {
      console.error(reason)
      this.pdfLoadError = 'Failed to load document. Please try again later or contact us.'
      this.loadingPdf = false
    })
  }

  attached () {
    const element = this
    jQuery(this.accordion).accordion({
      onOpen: function () {
        if (element.loadingPdf) {
          return
        }
        const container: HTMLElement = jQuery(this)[0].querySelector('.pdf-container')
        if (!container) {
          return
        }
        element.renderPages(container)
        jQuery(this)[0].scrollIntoView()
      }
    })
    this.ss.setSocialTags({
      title: 'သံတူကြောင်းကွဲများ | Burmese Lexicon',
      description: this.pages.reduce((entries, page) => entries.concat(Object.keys(page.entries)), [])
        .join('၊ ')
    })
    this.ps.setPrerenderReady()
  }

  getPageEntries (page) {
    return Object.keys(page.entries)
  }

  closeAll () {
    jQuery(this.accordion).accordion('close others')
    document.querySelector('h1').scrollIntoView()
  }

  renderPages (pdfContainer: HTMLElement) {
    const startPage: number = Number(pdfContainer.dataset.page)
    const endPage: number = this.findEndPageFromStart(startPage)
    for (let i = startPage; i <= endPage; i++) {
      this.renderPage(i + this.pageOffset, pdfContainer)
    }
  }

  findEndPageFromStart (start: number): number {
    const entries: any = this.pages.map(page => page.entries)
      .reduce((acc, pageEntries) => {
        return Object.assign(acc, pageEntries)
      }, {})
    const entryKeys = Object.keys(entries)
    const index = entryKeys.findIndex(entry => entries[entry] === start)
    if (index === entryKeys.length - 1) {
      return this.pdf.numPages
    }
    return entries[entryKeys[index + 1]] - 1
  }

  async renderPage (pageNumber: number, container: HTMLElement) {
    const page = await this.pdf.getPage(pageNumber)
    const scale = 2
    const viewport = page.getViewport(scale)
    // Prepare canvas using PDF page dimensions
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width
    container.appendChild(canvas)
    // Render PDF page into canvas context
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      background: 'rgba(0,0,0,0)'
    }
    page.render(renderContext).then(() => {
      trimCanvas(canvas)
    })
  }
}
