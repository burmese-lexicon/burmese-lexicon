import { SocialService } from 'services/social-service'
import { WordsApi } from 'api/words-api'
import { autoinject, bindable } from 'aurelia-framework'

@autoinject
export class SpellcheckPage {
  private words: string[] = []
  private loading: boolean = true
  private error: string
  private showWordList: boolean
  @bindable private searchRef: Element

  constructor (private wordsApi: WordsApi, private ss: SocialService) {}

  async created () {
    try {
      this.words = await this.wordsApi.getSpellcheckWordList()
      this.loading = false
    } catch (e) {
      console.error(e)
      this.error = 'There was an error fetching the words. Please contact us if this persists.'
    }
  }

  attached () {
    this.ss.setSocialTags({
      title: 'Spellchecker',
      description: 'Check word spellings and learn how to type them'
    })
  }

  searchRefChanged () {
    const searchOptions: any = {
      source: this.words.map(word => ({
        title: word,
        description: word.split('').join(' + ')
      })),
      fullTextSearch: true,
      maxResults: 10
    }
    jQuery(this.searchRef).search(searchOptions)
  }

  detached () {
    jQuery(this.searchRef).search('destroy')
  }

  toggleShowWordList () {
    this.showWordList = !this.showWordList
  }
}
