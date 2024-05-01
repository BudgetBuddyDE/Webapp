/**
 * Represents the possible operating systems.
 * @typedef {'Windows' | 'MacOS' | 'Linux' | 'Android' | 'iOS' | 'unknown'} TOS
 */
export type TOS = 'Windows' | 'MacOS' | 'Linux' | 'Android' | 'iOS' | 'unknown';

/**
 * Determines the operating system based on the user agent string.
 * @param userAgent - The user agent string. Defaults to `window.navigator.userAgent`.
 * @returns The operating system as a string.
 */
export function determineOS(userAgent = window.navigator.userAgent): TOS {
  let os: TOS = 'unknown';

  if (userAgent.indexOf('Win') !== -1) {
    os = 'Windows';
  } else if (userAgent.indexOf('Android') !== -1) {
    os = 'Android';
  } else if (
    userAgent.indexOf('iOS') !== -1 ||
    userAgent.indexOf('iPhone' || userAgent.indexOf('iPad') !== -1) !== -1
  ) {
    os = 'iOS';
  } else if (userAgent.indexOf('Mac') !== -1) {
    os = 'MacOS';
  } else if (userAgent.indexOf('Linux') !== -1) {
    os = 'Linux';
  }

  return os;
}
