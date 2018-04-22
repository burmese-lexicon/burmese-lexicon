export class DateFormatValueConverter {
  toView (value) {
    return (new Date(value)).toLocaleDateString('en-gb')
  }
}
