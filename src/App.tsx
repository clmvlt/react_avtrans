import { Moon, Plus, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Page temporaire de vérification du socle (phase 1) : thème, tokens et composants shadcn.
// Remplacée par le router en phase 3.
const swatches = [
  { name: 'primary', className: 'bg-primary text-primary-foreground' },
  { name: 'secondary', className: 'bg-secondary text-secondary-foreground' },
  { name: 'muted', className: 'bg-muted text-muted-foreground' },
  { name: 'success', className: 'bg-success text-success-foreground' },
  { name: 'warning', className: 'bg-warning text-warning-foreground' },
  { name: 'info', className: 'bg-info text-info-foreground' },
  { name: 'destructive', className: 'bg-destructive text-destructive-foreground' },
]

function toggleDark() {
  document.documentElement.classList.toggle('dark')
}

export default function App() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pointage AVTRANS</h1>
          <p className="text-sm text-muted-foreground">Vérification du socle React (phase 1).</p>
        </div>
        <Button variant="outline" size="icon" onClick={toggleDark} aria-label="Basculer le thème">
          <Sun className="dark:hidden" />
          <Moon className="hidden dark:block" />
        </Button>
      </header>

      <section className="flex flex-wrap gap-2">
        <Button>Par défaut</Button>
        <Button variant="secondary">Secondaire</Button>
        <Button variant="outline">Contour</Button>
        <Button variant="ghost">Fantôme</Button>
        <Button variant="destructive">Supprimer</Button>
        <Button variant="link">Lien</Button>
        <Button size="sm">
          <Plus /> Petit
        </Button>
        <Button size="icon-sm" aria-label="Ajouter">
          <Plus />
        </Button>
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {swatches.map((swatch) => (
          <div
            key={swatch.name}
            className={`rounded-lg border px-3 py-4 text-sm font-medium ${swatch.className}`}
          >
            {swatch.name}
          </div>
        ))}
      </section>
    </main>
  )
}
