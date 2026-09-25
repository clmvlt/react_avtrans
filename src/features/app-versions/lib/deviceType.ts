export type DeviceType = 'ios' | 'android' | 'desktop'

/** Type d'appareil d'après le user agent (même détection que la page /download du Vue). */
export function getDeviceType(): DeviceType {
  const ua = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/android/.test(ua)) return 'android'
  return 'desktop'
}
