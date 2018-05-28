export class SocialService {
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
}
