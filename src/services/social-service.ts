import environment from '../environment'

declare const FB: any;

export class SocialService {
  configure () {
    this.injectFacebookSdk()
    this.setMetaTag('fb:app_id', environment.facebook.appId)
  }

  setSocialTags (config: object) {
    this.setOgTags(config)
  }

  setOgTags (config: object) {
    for (let name in config) {
      this.setMetaTag(`og:${name}`, config[name])
    }
  }

  setMetaTag (name: string, content: string) {
    const matches = document.querySelectorAll(`meta[property="${name}"]`)
    let tag
    if (matches.length) {
      tag = (<HTMLElement>matches[0])
      tag.content = content
    } else {
      tag = (<HTMLElement>document.createElement('meta'))
      tag.setAttribute('property', name)
      tag.content = content
      document.querySelector('head').appendChild(tag)
    }
  }

  shareOnFacebook () {
    FB.ui({
      method: 'share',
      mobile_iframe: true,
      href: window.location.href,
    }, function (response) { })
  }

  injectFacebookSdk () {
    (<any>window).fbAsyncInit = function () {
      FB.init({
        appId: environment.facebook.appId,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v3.0'
      })
    }
    const d = document
    const s = 'script'
    const id = 'facebook-jssdk'
    const js = d.createElement(s)
    const fjs = d.getElementsByTagName(s)[0]
    if (d.getElementById(id)) {
      return
    }
    js.id = id
    js.src = "https://connect.facebook.net/en_US/sdk.js"
    fjs.parentNode.insertBefore(js, fjs)
  }
}
