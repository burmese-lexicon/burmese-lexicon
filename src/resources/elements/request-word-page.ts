import { AuthRequestedMessage } from './../events/auth-events'
import { EventAggregator } from 'aurelia-event-aggregator'
import { Router } from 'aurelia-router'
import { AuthService } from './../../services/auth-service'
import { WordsApi } from './../../api/words-api'
import { autoinject } from 'aurelia-framework'
import { ValidationControllerFactory, ValidationRules, ValidationController, ValidateEvent, validateTrigger, Validator, ValidateResult } from 'aurelia-validation'

@autoinject
export class RequestWordPage {
  private word: string
  private formState: string = ''
  private readonly MAX_WORD_LENGTH: number = 20
  private controller: ValidationController
  private serverValidateResult: ValidateResult
  private isFormValid: boolean = false

  constructor (
    private validationControllerFactory: ValidationControllerFactory,
    private validator: Validator,
    private wordsApi: WordsApi,
    private authService: AuthService,
    private router: Router,
    private ea: EventAggregator
  ) {
    this.controller = validationControllerFactory.createForCurrentScope(validator)
    this.controller.validateTrigger = validateTrigger.changeOrBlur
    this.controller.subscribe(this.updateIsFormValid.bind(this))
    ValidationRules
      .ensure((page: RequestWordPage) => page.word)
      .matches(/^[\u1000-\u109F]*$/).withMessage(`\${$displayName} can only have Burmese letters and no spaces.`)
      .maxLength(this.MAX_WORD_LENGTH)
      .required()
      .on(this)
  }

  private updateIsFormValid (event: ValidateEvent) {
    this.validator.validateObject(this)
      .then(results => {
        this.isFormValid = results.every(result => result.valid)
      })
    this.formState = ''
  }

  async submit () {
    if (!this.authService.user) {
      this.ea.publish(new AuthRequestedMessage())
      return
    }
    this.formState = 'loading'
    if (this.serverValidateResult) {
      this.controller.removeError(this.serverValidateResult)
    }
    try {
      const wordSnap = await this.wordsApi.getWord(this.word)
      if (wordSnap.exists) {
        this.serverValidateResult = this.controller.addError('This word already exists.', this)
        this.formState = ''
        return
      }
      const isRequestedWord = await this.wordsApi.isRequestedWord(this.word)
      if (isRequestedWord) {
        this.serverValidateResult = this.controller.addError('This word is already requested.', this)
        this.formState = ''
        return
      }
      await this.wordsApi.requestWord(this.word, this.authService.userId)
      this.formState = 'success'
      window.setTimeout(() => this.router.navigateToRoute('requested-words'), 3000)
    } catch (e) {
      console.error(e)
      this.formState = 'error'
    }
  }
}
