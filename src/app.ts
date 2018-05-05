import { DbService } from './services/db-service'
import { AuthService } from './services/auth-service'
import { autoinject } from 'aurelia-dependency-injection'
import { PLATFORM } from 'aurelia-pal'
import {Router, RouterConfiguration} from 'aurelia-router'
import { viewResources } from 'aurelia-framework'
import { AuthorizeStep } from './resources/steps/authorize-step'
import firebase from '@firebase/app'

@autoinject
@viewResources(PLATFORM.moduleName('semantic-ui-css/semantic.min'))
export class App {
  private router: Router

  constructor (private authService: AuthService, private dbService: DbService) {}

  created () {
    this.authService.configure()
    this.dbService.configure()
  }

  configureRouter (config: RouterConfiguration, router: Router): void {
    this.router = router
    config.title = 'Burmese Lexicon'
    config.addAuthorizeStep(AuthorizeStep)
    config.map([
      {
        route: [
          '',
          'home'
        ],
        name: 'home',
        moduleId: PLATFORM.moduleName('./resources/elements/home-page', 'home'),
        nav: true,
        title: 'Burmese Lexicon',
        settings: {
          icon: 'book',
          iconColor: 'red'
        }
      },
      {
        route: 'words',
        name: 'words',
        moduleId: PLATFORM.moduleName('./resources/elements/words-page', 'words'),
        nav: true,
        title: 'Words',
        settings: {
          icon: 'list',
          iconColor: 'green'
        }
      },
      {
        route: 'words/new',
        name: 'new-word',
        moduleId: PLATFORM.moduleName('./resources/elements/new-word-page', 'words-new'),
        title: 'Add new word',
        settings: {
          auth: true
        }
      },
      {
        route: 'contributors',
        name: 'contributors',
        moduleId: PLATFORM.moduleName('./resources/elements/contributors-page', 'contributors'),
        nav: true,
        title: 'Top Contributors',
        settings: {
          icon: 'trophy',
          iconColor: 'gold'
        }
      },
      {
        route: 'words/:id',
        name: 'word',
        moduleId: PLATFORM.moduleName('./resources/elements/word-page')
      },
      {
        route: 'profile',
        name: 'profile',
        title: 'Profile',
        moduleId: PLATFORM.moduleName('./resources/elements/profile-page', 'profile'),
        settings: {
          auth: true
        }
      },
      {
        route: 'login',
        name: 'login',
        moduleId: PLATFORM.moduleName('./resources/elements/auth-container'),
        title: 'Login'
      }
    ])
  }
}
