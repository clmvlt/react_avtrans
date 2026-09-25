import { STATS_COUNT_UP_DURATION_MS, stats } from '../data/stats'
import { useCountUp } from '../hooks/useCountUp'

/** Cibles des compteurs : constante de module, donc stable pour l'effet de useCountUp */
const STAT_TARGETS = stats.map((stat) => stat.target)

/** Chiffres clés sur fond violet, avec compteurs animés à l'arrivée dans l'écran. */
export function StatsSection() {
  const { ref, values } = useCountUp<HTMLElement>(STAT_TARGETS, STATS_COUNT_UP_DURATION_MS)

  return (
    <section
      ref={ref}
      data-stats-section=""
      className="relative overflow-hidden bg-primary py-20 sm:py-24"
      aria-label="Chiffres clés"
    >
      {/* Fond décoratif */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_50%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal grid gap-8 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-extrabold text-primary-foreground sm:text-5xl">
                {`${values[index] ?? 0}${stat.suffix}`}
              </p>
              <p className="mt-2 text-sm font-medium text-primary-foreground/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
