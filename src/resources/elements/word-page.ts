import { AuthService } from './../../services/auth-service'
import { UsersApi } from 'api/users-api'
import { WordsApi } from 'api/words-api'
import { autoinject } from 'aurelia-dependency-injection'

@autoinject
export class WordPage {
  private word: string
  private definitions: any[] = []
  private error: string
  private loading: boolean = true
  private doesWordExist: boolean
  private deleteDialogVM: any
  private definitionIndexToDelete: number
  private newDefinition: string
  private hasUserDefinition: boolean = false
  private addingNewDef: boolean = false

  constructor (private wordsApi: WordsApi, private usersApi: UsersApi, private authService: AuthService) {}

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
        const userData = userSnapshot.data() || {}
        if (data.user === this.authService.userId) {
          this.hasUserDefinition = true
        }
        definitions.push({
          word: data.word,
          votes: data.votes ? Object.keys(data.votes).length : 0,
          text: data.text,
          createdAt: data.createdAt,
          author: {
            name: userData.name ? userData.name : `user${data.user.substring(data.user.length - 5, data.user.length)}`,
            profileURL: userData.profileURL,
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

  showDefinitionDelete = (index: number) => {
    this.deleteDialogVM.show()
    this.definitionIndexToDelete = index
  }

  async handleDefinitionDelete () {
    try {
      await this.wordsApi.deleteDefinition(`${this.authService.userId}-${this.word}`)
      this.definitions.splice(this.definitionIndexToDelete, 1)
      this.hasUserDefinition = false
    } catch (e) {
      console.error('deleting definition failed')
    }
  }

  async handleAddDefinition () {
    this.addingNewDef = true
    try {
      await this.wordsApi.addDefinition(this.word, this.newDefinition, this.authService.userId)
      this.definitions.push({
        word: this.word,
        votes: 0,
        text: this.newDefinition,
        createdAt: Date.now(),
        author: {
          name: this.authService.user.displayName,
          profileURL: this.authService.user.photoURL,
          uid: this.authService.userId
        }
      })
      this.hasUserDefinition = true
      this.addingNewDef = false
    } catch (e) {
      console.error('adding definition failed')
    }
  }
}
