export function isInDaylightSavings(date) {
  var jul = new Date(date.getFullYear(), 6, 1);
  return date.getTimezoneOffset() == jul.getTimezoneOffset();
}