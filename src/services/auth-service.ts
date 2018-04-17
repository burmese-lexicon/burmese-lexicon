import firebase from '@firebase/app'
import '@firebase/auth'
import '@firebase/database'
import '@firebase/functions'

export class AuthService {
  configure () {
    firebase.initializeApp({
      apiKey: 'AIzaSyA_qY1nFkpjA_osvlR4bJj8q3qIIGUs1Jo',
      authDomain: 'burmese-lexicon.firebaseapp.com',
      databaseURL: 'https://burmese-lexicon.firebaseio.com',
      projectId: 'burmese-lexicon',
      storageBucket: '',
      messagingSenderId: '194765477370'
    })
  }
}
