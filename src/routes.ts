import { PLATFORM } from 'aurelia-pal'

const routes = [
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
    route: 'request-word',
    name: 'request-word',
    moduleId: PLATFORM.moduleName('./resources/elements/request-word-page', 'request-word'),
    title: 'Request word'
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
    route: 'requested-words',
    name: 'requested-words',
    moduleId: PLATFORM.moduleName('./resources/elements/requested-words-page', 'requested-words'),
    title: 'Requested words',
    nav: true,
    settings: {
      icon: 'paperclip',
      iconColor: 'darkcyan'
    }
  },
  {
    route: 'spellcheck',
    name: 'spellcheck',
    moduleId: PLATFORM.moduleName('./resources/elements/spellcheck-page', 'spellcheck'),
    title: 'Spellcheck',
    nav: true,
    settings: {
      icon: 'compass outline',
      iconColor: 'deeppink'
    }
  },
  {
    route: 'about',
    name: 'about',
    moduleId: PLATFORM.moduleName('./resources/elements/about-page', 'about'),
    title: 'About',
    nav: true,
    settings: {
      icon: 'info',
      iconColor: 'silver'
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
  },
  {
    route: 'not-found-page',
    name: 'not-found-page',
    moduleId: PLATFORM.moduleName('./resources/elements/not-found-page'),
    title: 'Page not found'
  }
]

export default routes
