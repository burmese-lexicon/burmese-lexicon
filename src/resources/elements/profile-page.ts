import { UsersApi } from './../../api/users-api'
import { AuthService } from './../../services/auth-service'
import { autoinject } from 'aurelia-framework'
import { ValidationControllerFactory, ValidationRules, ValidationController, validateTrigger} from 'aurelia-validation'

@autoinject
export class ProfilePage {
  private loading: boolean = true
  private loadingError: string
  private publicName: string
  private publicPhotoURL: string = null
  private controller: ValidationController
  private static readonly MAX_NAME_LENGTH: number = 20
  private formState: string
  private imageError: boolean = true

  constructor (private authService: AuthService, private usersApi: UsersApi, private validationControllerFactory: ValidationControllerFactory) {
    this.controller = validationControllerFactory.createForCurrentScope()
    this.controller.validateTrigger = validateTrigger.changeOrBlur

    // TODO: aurelia nested child object validation is still WIP
    ValidationRules
      .ensure((page: ProfilePage) => page.publicName)
      .displayName('Display Name')
      .maxLength(ProfilePage.MAX_NAME_LENGTH)
      .required()
      .ensure((page: ProfilePage) => page.publicPhotoURL)
      .displayName('Photo url')
      .matches(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/)
      .withMessage('Photo url needs to be a valid image url')
      .on(this)
  }

  async created () {
    try {
      const publicSnap = await this.usersApi.getPublicUserInfo(this.authService.userId)
      const publicData = publicSnap.data()
      this.publicName = publicData.name
      this.publicPhotoURL = publicData.photoURL
    } catch (e) {
      this.loadingError = 'There was an error loading your profile. Please try again later'
    } finally {
      this.loading = false
    }
  }

  async submit () {
    this.formState = 'loading'
    try {
      await this.usersApi.setPublicUserInfo(this.authService.userId, {
        name: this.publicName,
        photoURL: this.publicPhotoURL
      })
      this.formState = 'success'
    } catch (e) {
      this.formState = 'error'
    }
  }

  handleImageError () {
    this.imageError = true
  }

  handleImageLoad () {
    this.imageError = false
  }

  get user () {
    return this.authService.user
  }
}
