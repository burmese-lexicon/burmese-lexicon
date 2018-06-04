import { UsersApi } from './../api/users-api'
import { AuthStateChanged } from './../resources/events/auth-events'
import { EventAggregator } from 'aurelia-event-aggregator'
import { Router, NavigationInstruction } from 'aurelia-router'
import { autoinject } from 'aurelia-framework'
import firebase from '@firebase/app'
import '@firebase/auth'
import firebaseui from 'firebaseui'
import { User } from '@firebase/auth-types'
import { ROLES } from 'api/roles'

@autoinject
export class AuthService {
  // private recaptchaVerifier: any
  private _user: User
  private _userRoles: string[] = []
  private ui: any
  private _loginRedirectURL: string
  private authResult: any

  constructor (private router: Router, private ea: EventAggregator, private usersApi: UsersApi) {}

  configure () {
    // this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
    //   'size': 'invisible',
    //   'callback': function (response) {
    //     // reCAPTCHA solved, allow signInWithPhoneNumber.
    //     this.signIn()
    //   }
    // })
    firebase.auth().onAuthStateChanged((user: User) => {
      if (user) {
        this._user = user
        const loginRedirectURL = this.getCachedLoginRedirectURL()
        this.usersApi.getUserRoles(user.uid).then(roles => { this._userRoles = roles })
        if (this.router.currentInstruction && this.router.currentInstruction.config.name === 'login') {
          if (loginRedirectURL) {
            this.router.navigate(loginRedirectURL)
            this.clearCachedLoginRedirectURL()
          } else {
            this.router.navigateToRoute('home')
          }
        }
      } else {
        this._user = null
      }
      this.ea.publish(new AuthStateChanged())
    }, function (error) {
      console.error(error)
    })
  }

  set loginRedirectURL (value: string) {
    this._loginRedirectURL = value
    window.localStorage.setItem('loginRedirectURL', value)
  }

  getCachedLoginRedirectURL () {
    return this._loginRedirectURL || window.localStorage.getItem('loginRedirectURL')
  }

  clearCachedLoginRedirectURL () {
    this._loginRedirectURL = null
    window.localStorage.removeItem('loginRedirectURL')
  }

  get verified () {
    if (!this._user) {
      return false
    }
    // only have email verification for now
    if (this._user.providerData[0].providerId !== 'password') {
      return true
    }
    return this._user.emailVerified
  }

  sendVerificationEmail () {
    this._user.sendEmailVerification()
    window.alert('Verification email sent')
  }

  private sendVerificationEmailForNewUser (authResult) {
    if (authResult.additionalUserInfo.providerId === 'password' &&
      authResult.additionalUserInfo.isNewUser &&
      authResult.user.emailVerified === false
    ) {
      authResult.user.sendEmailVerification()
    }
  }

  async renderProvidersToContainer (container: Element, successCallback: Function) {
    if (this.ui) {
      await this.ui.delete()
    }
    const uiConfig = {
      signInOptions: [
        // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        // firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
        // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      ],
      // Terms of service url.
      tosUrl: '<your-tos-url>',
      credentialHelper: firebaseui.auth.CredentialHelper.NONE,
      callbacks: {
        signInSuccessWithAuthResult: this.sendVerificationEmailForNewUser
      }
    }

    if (successCallback) {
      uiConfig.callbacks = {
        signInSuccessWithAuthResult: (authResult) => {
          this.sendVerificationEmailForNewUser(authResult)
          successCallback()
          return false
        }
      }
    }

    // Initialize the FirebaseUI Widget using Firebase.
    const auth = firebase.auth()
    this.ui = new firebaseui.auth.AuthUI(auth)
    // The start method will wait until the DOM is loaded.
    this.ui.start(container, uiConfig)
  }

  signOut () {
    firebase.auth().signOut().then(() => {
      this._user = null
      if (this.router.currentInstruction.config.settings.auth) {
        this.router.navigateToRoute('home')
      }
    })
  }

  get user () {
    return this._user
  }

  get userId () {
    return this._user ? this.user.uid : null
  }

  get userRoles (): string[] {
    return this._userRoles
  }

  get isSigningIn () {
    return this.ui && this.ui.isPendingRedirect()
  }
}
