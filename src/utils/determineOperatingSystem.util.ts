export function determineOperatingSystem() {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf('Win') !== -1) {
    return 'Windows';
  }
  if (userAgent.indexOf('Linux') !== -1) {
    return 'Linux';
  }
  if (userAgent.indexOf('Mac') !== -1) {
    return 'macOS';
  }
  return 'Unknown';
}
