import { WordsApi } from 'api/words-api'
import { autoinject } from 'aurelia-framework'

@autoinject
export class WordSearch {
  constructor (private element: Element, private wordsApi: WordsApi) {}

  attached () {
    jQuery(this.element).find('.ui.search')
      .search({
        apiSettings: {
          responseAsync: async (settings, callback) => {
            let words = await this.wordsApi.searchSimilarWords(settings.urlData.query)
            words = words.map(word => ({title: word}))
            const response = {
              results: words
            }
            callback(response)
          },
          onError: error => console.error(error)
        }
      })
  }

  detached () {
    jQuery(this.element).find('.ui.search').search('destroy')
  }
}
