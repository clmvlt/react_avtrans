/**
 * Mapbox Configuration
 */

/**
 * Mapbox access token
 * Can be overridden with VITE_MAPBOX_TOKEN environment variable
 */
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

/**
 * Default Mapbox style
 */
export const MAPBOX_STYLE = 'mapbox://styles/mapbox/outdoors-v12'

/**
 * Mapbox satellite style
 */
export const MAPBOX_STYLE_SATELLITE = 'mapbox://styles/mapbox/satellite-streets-v12'

/**
 * Default map center (Brittany, France)
 */
export const DEFAULT_CENTER: [number, number] = [-2.6209034250983065, 48.47736407289052]

/**
 * Default map zoom level
 */
export const DEFAULT_ZOOM = 12
