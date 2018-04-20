export class WordPage {
  private id: string

  activate (params) {
    this.id = params.id
  }

  attached () {
    document.title = `${this.id} | ${document.title}`
  }
}
