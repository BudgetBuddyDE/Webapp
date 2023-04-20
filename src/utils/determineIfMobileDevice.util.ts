export function determineIfMobileDevice(): boolean {
  return /Mobi|Android/i.test(navigator.userAgent);
}
