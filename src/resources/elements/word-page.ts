import { UsersApi } from 'api/users-api'
import { WordsApi } from 'api/words-api'
import { autoinject } from 'aurelia-dependency-injection'

@autoinject
export class WordPage {
  private word: string
  private definitions: any[]
  private error: string
  private loading: boolean = true
  private doesWordExist: boolean

  constructor (private wordsApi: WordsApi, private usersApi: UsersApi) {}

  async activate (params) {
    this.word = params.id
  }

  async created () {
    try {
      const wordSnapshot = await this.wordsApi.getWord(this.word)
      this.doesWordExist = wordSnapshot.exists
      if (!this.doesWordExist) {
        this.loading = false
        return
      }
      const definitionsQuerySnapshot = await this.wordsApi.getDefinitionsForWord(this.word)
      const definitions = []
      definitionsQuerySnapshot.forEach(async def => {
        const data = def.data()
        // yea firestore beta, can't query with id array yet ~_~
        const userSnapshot = await this.usersApi.getPublicUserInfo(data.user)
        const userData = userSnapshot.data()
        definitions.push({
          word: data.word,
          votes: data.votes ? Object.keys(data.votes).length : 0,
          text: data.text,
          createdAt: data.createdAt,
          author: {
            ...userData,
            uid: data.user
          }
        })
      })
      this.definitions = definitions
      this.loading = false
    } catch (e) {
      console.error(e)
      this.error = 'There was an error fetching the defintions. Please try again later.'
    }
  }

  attached () {
    document.title = `${this.word} | ${document.title}`
  }
}
