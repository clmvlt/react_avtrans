// `cn` du paquet officiel shadcn « cn » (remplaçant de clsx + tailwind-merge, mêmes API).
// Le registre shadcn l'importe directement dans chaque composant généré ; on réexporte le même moteur
// pour que tout le projet fusionne les classes de la même façon. Parité vérifiée en phase 1
// sur les classes du projet Vue (voir MIGRATION.md, section 2).
export { cn } from 'cn'
