/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY — OFFICIAL BRAND ASSETS REPOSITORY (MISSION BRAND-ASSETS-001)
 * 
 * SOURCE DE VÉRITÉ OFFICIELLE UNIQUE :
 * public/assets/images/public_assets_images_bird_academy
 * 
 * Cet helper centralise la résolution des chemins d'accès vers les assets de marque.
 * Il garantit un fonctionnement universel et sans image cassée dans tous les contextes :
 * 1. Serveur de développement Vite (http://localhost:3000/)
 * 2. Build de production Web (https://...)
 * 3. Application de bureau Windows Electron (file:///.../dist_user/index.html)
 * 4. Environnement de tests Node.js / Playwright
 */

/**
 * Résout le chemin relatif d'un asset officiel de marque.
 * En environnement Electron sous protocole file://, le chemin relatif ./assets/images/public_assets_images_bird_academy/...
 * se résout directement par rapport au répertoire de index.html, évitant ainsi le piège du slash absolu racine (/assets/...).
 */
export function resolveBrandAsset(filename: string): string {
  if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
    return `./assets/images/public_assets_images_bird_academy/${filename}`;
  }
  const base = (typeof import.meta !== 'undefined' && (import.meta as any).env?.BASE_URL) || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}assets/images/public_assets_images_bird_academy/${filename}`;
}

export const brandAssets = {
  /** Logo complet avec texte - Format PNG standard */
  logo: resolveBrandAsset('logo.png'),
  /** Logo complet avec texte - Format SVG vectoriel standard */
  logoSvg: resolveBrandAsset('logo.svg'),
  /** Logo complet avec texte - Variante claire PNG */
  logoFull: resolveBrandAsset('logo-full.png'),
  /** Logo complet avec texte - Variante claire SVG */
  logoFullSvg: resolveBrandAsset('logo-full.svg'),
  /** Logo complet avec texte - Variante sombre PNG (pour fond sombre) */
  logoFullDark: resolveBrandAsset('logo-full-dark.png'),
  /** Logo complet avec texte - Variante sombre SVG (pour fond sombre) */
  logoFullDarkSvg: resolveBrandAsset('logo-full-dark.svg'),

  /** Symbole / Emblème bouclier officiel - Format PNG 512x512 */
  logoIcon: resolveBrandAsset('logo-icon.png'),
  /** Symbole / Emblème bouclier officiel - Format SVG vectoriel */
  logoIconSvg: resolveBrandAsset('logo-icon.svg'),

  /** Icône d'application native - Format PNG 512x512 */
  icon: resolveBrandAsset('icon.png'),
  /** Icône multi-résolution Windows (16 à 256px) - Format ICO */
  iconIco: resolveBrandAsset('icon.ico'),

  /** Favicon navigateur multi-résolution - Format ICO */
  favicon: resolveBrandAsset('favicon.ico'),
  /** Icône tactile iOS / PWA (180x180) - Format PNG */
  appleTouchIcon: resolveBrandAsset('apple-touch-icon.png'),
} as const;

export type BrandAssetKey = keyof typeof brandAssets;

export default brandAssets;
