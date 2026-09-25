/**
 * Défilement doux vers une section de la landing (ancres #services, #contact…).
 * Renvoie false si la section est introuvable : l'appelant ne ferme alors pas le menu mobile,
 * comme le `scrollTo` de Landing.vue.
 */
export function scrollToSection(id: string): boolean {
  const element = document.getElementById(id)
  if (!element) return false
  element.scrollIntoView({ behavior: 'smooth' })
  return true
}
