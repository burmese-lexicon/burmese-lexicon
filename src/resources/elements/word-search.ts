import { WordsApi } from 'api/words-api'
import { autoinject } from 'aurelia-framework'

@autoinject
export class WordSearch {
  private words: object[]

  constructor (private element: Element, private wordsApi: WordsApi) {}

  async attached () {
    try {
      this.words = await this.wordsApi.getWordList()
      this.words = this.words.map(word => ({
        title: word,
        url: `/words/${word}`
      }))
      jQuery(this.element).find('.ui.search')
        .search({
          searchDelay: 500,
          source: this.words,
          onSelect: () => {
            jQuery('.sidebar').sidebar('hide')
          }
          // TODO: will need this when we do proper full text search
          // apiSettings: {
          //   responseAsync: async (settings, callback) => {
          //     let words = await this.wordsApi.searchSimilarWords(settings.urlData.query)
          //     words = words.map(word => ({
          //       title: word,
          //       url: `/words/${word}`
          //     }))
          //     const response = {
          //       results: words
          //     }
          //     callback(response)
          //   },
          //   onError: error => console.error(error)
          // }
        })
    } catch (e) {
      console.error(e)
    }
  }

  detached () {
    jQuery(this.element).find('.ui.search').search('destroy')
  }
}
