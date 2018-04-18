import { Router, NavigationInstruction } from 'aurelia-router'
import { autoinject } from 'aurelia-framework'
import firebase from '@firebase/app'
import '@firebase/auth'
import '@firebase/database'
import '@firebase/functions'
import firebaseui from 'firebaseui'
import { User } from '@firebase/auth-types'

@autoinject
export class AuthService {
  // private recaptchaVerifier: any
  private _user: User
  private ui: any
  targetNavInstruction: NavigationInstruction

  constructor (private router: Router) {}

  activate () {
    if (this.targetNavInstruction) {
      const targetUrl = this.targetNavInstruction.router.generate(
        this.targetNavInstruction.config.name,
        Object.assign(this.targetNavInstruction.params, this.targetNavInstruction.queryParams),
        { replace: true }
      )
      this.targetNavInstruction = null
      this.router.navigate(targetUrl)
    } else {
      this.router.navigateToRoute('home')
    }
  }

  configure () {
    firebase.initializeApp({
      apiKey: 'AIzaSyA_qY1nFkpjA_osvlR4bJj8q3qIIGUs1Jo',
      authDomain: 'burmese-lexicon.firebaseapp.com',
      databaseURL: 'https://burmese-lexicon.firebaseio.com',
      projectId: 'burmese-lexicon',
      storageBucket: '',
      messagingSenderId: '194765477370'
    })
    // this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
    //   'size': 'invisible',
    //   'callback': function (response) {
    //     // reCAPTCHA solved, allow signInWithPhoneNumber.
    //     this.signIn()
    //   }
    // })
    firebase.auth().onAuthStateChanged((user: User) => {
      if (user) {
        // User is signed in.
        var displayName = user.displayName
        var email = user.email
        var emailVerified = user.emailVerified
        var photoURL = user.photoURL
        var uid = user.uid
        var phoneNumber = user.phoneNumber
        var providerData = user.providerData
        this._user = user
      } else {
        this._user = null
      }
    }, function (error) {
      console.error(error)
    })
  }

  renderProvidersToContainer (container: Element) {
    if (this.ui) {
      this.ui.reset()
    } else {
      const uiConfig = {
        signInSuccessUrl: '/#/',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
          // firebase.auth.GithubAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID
          // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        ],
        // Terms of service url.
        tosUrl: '<your-tos-url>',
        credentialHelper: firebaseui.auth.CredentialHelper.NONE
      }

      // Initialize the FirebaseUI Widget using Firebase.
      const auth = firebase.auth()
      this.ui = new firebaseui.auth.AuthUI(auth)
      // The start method will wait until the DOM is loaded.
      this.ui.start(container, uiConfig)
    }
  }

  signIn () {
    // firebase.auth().signInWithPhoneNumber('95955342672', this.recaptchaVerifier)
    //   .then(function (confirmationResult) {
    //     // SMS sent. Prompt user to type the code from the message, then sign the
    //     // user in with confirmationResult.confirm(code).
    //     console.log(confirmationResult)
    //   }).catch(function (error) {
    //     // Error; SMS not sent
    //     console.log(error)
    //     this.recaptchaVerifier.render().then(function (widgetId) {
    //       // grecaptcha.reset(widgetId)
    //     })
    //   })
  }

  signOut () {
    firebase.auth().signOut()
  }

  get user () {
    return this._user
  }
}
