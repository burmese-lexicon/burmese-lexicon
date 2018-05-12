export class NotiService {
  static FIRST_TIME_DIALOG_SHOWN: string = 'firstTimeDialogShown'

  get shownFirstTimeDialog () {
    return window.localStorage.getItem(NotiService.FIRST_TIME_DIALOG_SHOWN)
  }

  set shownFirstTimeDialog (shown) {
    window.localStorage.setItem(NotiService.FIRST_TIME_DIALOG_SHOWN, shown)
  }
}
