import { WordsApi } from './../../api/words-api'
import { Router } from 'aurelia-router'
import { AuthService } from 'services/auth-service'
import { autoinject } from 'aurelia-framework'
import { ValidationControllerFactory, ValidationRules, ValidationController, ValidateEvent, validateTrigger, Validator, ValidateResult} from 'aurelia-validation'

@autoinject
export class NewWordPage {
  private word: string
  private definition: string
  private agreedTOS: boolean
  private serverValidateResult: ValidateResult
  private readonly MAX_DEFFINITION_LENGTH: number =3000
  private readonly MAX_WORD_LENGTH: number = 20
  private controller: ValidationController
  private isFormValid: boolean = false
  private formState: string
  private defPlaceholder: string = '[မြန်မာ][English]'

  constructor (
    private validationControllerFactory: ValidationControllerFactory,
    private validator: Validator,
    private wordApi: WordsApi,
    private authService: AuthService,
    private router: Router
  ) {
    this.controller = validationControllerFactory.createForCurrentScope(validator)
    this.controller.validateTrigger = validateTrigger.changeOrBlur
    this.controller.subscribe(this.updateIsFormValid.bind(this))
    ValidationRules
      .ensure((page: NewWordPage) => page.word)
      .matches(/^[\u1000-\u109F]*$/).withMessage(`\${$displayName} can only have Burmese letters and no spaces.`)
      .maxLength(this.MAX_WORD_LENGTH)
      .required()
      .ensure((page: NewWordPage) => page.definition)
      .maxLength(this.MAX_DEFFINITION_LENGTH)
      .required()
      .ensure((page: NewWordPage) => page.agreedTOS)
      .equals(true).withMessage(`\${$displayName} is required.`)
      .required()
      .on(this)
  }

  activate (params) {
    this.word = params.word
  }

  private updateIsFormValid (event: ValidateEvent) {
    this.validator.validateObject(this)
      .then(results => {
        this.isFormValid = results.every(result => result.valid)
      })
    this.formState = ''
  }

  async submit () {
    this.formState = 'loading'
    if (this.serverValidateResult) {
      this.controller.removeError(this.serverValidateResult)
    }
    try {
      const wordSnap = await this.wordApi.getWord(this.word)
      if (wordSnap.exists) {
        this.serverValidateResult = this.controller.addError('This word already exists', this)
        this.formState = ''
        return
      }
      await this.wordApi.addWord(this.word, this.definition, this.authService.user.uid)
      this.formState = 'success'
      window.setTimeout(() => this.router.navigate(`/words/${this.word}`), 3000)
    } catch (e) {
      console.error(e)
      this.formState = 'error'
    }
  }
}
