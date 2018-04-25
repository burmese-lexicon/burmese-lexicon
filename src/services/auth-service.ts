import { Router, NavigationInstruction } from 'aurelia-router'
import { autoinject } from 'aurelia-framework'
import firebase from '@firebase/app'
import '@firebase/auth'
import firebaseui from 'firebaseui'
import { User } from '@firebase/auth-types'

@autoinject
export class AuthService {
  // private recaptchaVerifier: any
  private _user: User
  private ui: any
  private _loginRedirectURL: string

  constructor (private router: Router) {}

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
        if (loginRedirectURL) {
          this.router.navigate(loginRedirectURL)
          this.clearCachedLoginRedirectURL()
        }
      } else {
        this._user = null
      }
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
        signInSuccessWithAuthResult: () => false
      }
    }

    if (successCallback) {
      uiConfig.callbacks = {
        signInSuccessWithAuthResult: () => {
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

  get isSigningIn () {
    return this.ui && this.ui.isPendingRedirect()
  }
}
