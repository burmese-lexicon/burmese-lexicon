import { AuthRequestedMessage, AuthStateChanged } from './../events/auth-events'
import { EventAggregator } from 'aurelia-event-aggregator'
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
  private defEditMode: boolean = false
  private defToEdit: any
  private defToEditOriginalText: string
  private updatingDef: boolean = false

  constructor (
    private wordsApi: WordsApi,
    private usersApi: UsersApi,
    private authService: AuthService,
    private ea: EventAggregator
  ) {
    this.ea.subscribe(AuthStateChanged, this.handleAuthStateChange)
  }

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
          votes: data.votes,
          text: data.text,
          createdAt: data.createdAt,
          author: {
            name: userData.name ? userData.name : `user${data.user.substring(data.user.length - 5, data.user.length)}`,
            photoURL: userData.photoURL,
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

  handleAuthStateChange () {
    this.hasUserDefinition = this.definitions.some(def => def.author.uid === this.authService.userId)
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
    if (!this.authService.user) {
      this.ea.publish(new AuthRequestedMessage())
      return
    }
    if (!this.newDefinition) {
      return
    }
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

  enableDefEditMode = (index: number) => {
    this.defToEdit = this.definitions[index]
    this.defToEditOriginalText = this.defToEdit.text
    this.defEditMode = true
  }

  disableDefEditMode () {
    this.defEditMode = false
    this.defToEdit.text = this.defToEditOriginalText
  }

  async updateDefinition () {
    this.updatingDef = true
    try {
      await this.wordsApi.updateDefinition(this.word, this.defToEdit.text, this.authService.userId)
      this.updatingDef = false
      this.defEditMode = false
    } catch (e) {
      console.error('updating definition failed')
    }
  }
}
