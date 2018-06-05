export class PrerenderService {
  setPrerenderReady () {
    (<any>window).prerenderReady = true
  }
}
