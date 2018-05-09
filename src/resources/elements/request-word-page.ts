import { AuthRequestedMessage } from './../events/auth-events'
import { EventAggregator } from 'aurelia-event-aggregator'
import { Router } from 'aurelia-router'
import { AuthService } from './../../services/auth-service'
import { WordsApi } from './../../api/words-api'
import { autoinject } from 'aurelia-framework'
import { ValidationControllerFactory, ValidationRules, ValidationController, ValidateEvent, validateTrigger, Validator } from 'aurelia-validation'

@autoinject
export class RequestWordPage {
  private word: string
  private formState: string = ''
  private readonly MAX_WORD_LENGTH: number = 20
  private controller: ValidationController

  constructor (
    private validationControllerFactory: ValidationControllerFactory,
    private wordsApi: WordsApi,
    private authService: AuthService,
    private router: Router,
    private ea: EventAggregator
  ) {
    this.controller = validationControllerFactory.createForCurrentScope()
    this.controller.validateTrigger = validateTrigger.changeOrBlur
    ValidationRules
      .ensure((page: RequestWordPage) => page.word)
      .matches(/^[\u1000-\u109F]*$/).withMessage(`\${$displayName} can only have Burmese letters and no spaces.`)
      .maxLength(this.MAX_WORD_LENGTH)
      .required()
      .on(this)
  }

  async submit () {
    if (!this.authService.user) {
      this.ea.publish(new AuthRequestedMessage())
      return
    }
    this.formState = 'loading'
    try {
      await this.wordsApi.requestWord(this.word, this.authService.userId)
      this.formState = 'success'
      window.setTimeout(() => this.router.navigateToRoute('requested-words'), 3000)
    } catch (e) {
      console.error(e)
      this.formState = 'error'
    }
  }
}
