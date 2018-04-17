import { PLATFORM } from 'aurelia-pal';
import {Router, RouterConfiguration} from 'aurelia-router';
import { viewResources } from "aurelia-framework";

@viewResources(PLATFORM.moduleName('semantic-ui-css/semantic.min'))
export class App {
  private router: Router

  configureRouter(config: RouterConfiguration, router: Router): void {
    this.router = router
    config.title = 'Aurelia';
    config.map([
      { route: ['', 'home'], name: 'home', moduleId: PLATFORM.moduleName('./resources/elements/word-search'), nav: true, title: 'Burmese Lexicon' },
      { route: 'words', name: 'words', moduleId: PLATFORM.moduleName('./resources/elements/word-search'), nav: true, title: 'Words' },
      { route: 'contributors', name: 'contributors', moduleId: PLATFORM.moduleName('./resources/elements/word-search'), nav: true, title: 'Top Contributors' },
    ]);
  }
}
