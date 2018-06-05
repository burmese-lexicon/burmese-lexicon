import { PrerenderService } from './../../services/prerender-service'
import { SocialService } from './../../services/social-service'
import { autoinject } from 'aurelia-dependency-injection'
@autoinject
export class AboutPage {
  constructor (private ss: SocialService, private ps: PrerenderService) {}

  attached () {
    this.ss.setSocialTags({
      title: 'About | Burmese Lexicon',
      description: document.querySelector('.summary').textContent
    })
    this.ps.setPrerenderReady()
  }
}
