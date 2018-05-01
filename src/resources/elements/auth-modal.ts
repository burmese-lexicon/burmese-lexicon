import { AuthRequestedMessage } from './../events/auth-events'
import { AuthService } from 'services/auth-service'
import { autoinject } from 'aurelia-dependency-injection'
import { EventAggregator } from 'aurelia-event-aggregator'

@autoinject
export class AuthModal {
  private modalRef: Element
  constructor (private ea: EventAggregator, private authService: AuthService) {
    ea.subscribe(AuthRequestedMessage, this.showModal.bind(this))
  }

  showModal () {
    jQuery(this.modalRef).modal('show')
    this.authService.renderProvidersToContainer(this.modalRef, () => jQuery(this.modalRef).modal('hide'))
  }
}
