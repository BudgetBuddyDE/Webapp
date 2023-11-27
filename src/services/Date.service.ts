export class DateService {
  static months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'Juli',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  static getMonthFromDate(date: Date = new Date()) {
    return this.months[date.getMonth()];
  }

  static shortMonthName(date: Date = new Date()) {
    return this.getMonthFromDate(date).substring(0, 3);
  }
}
