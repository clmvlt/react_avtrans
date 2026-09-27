import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { VehiculeKilometrageDTO } from '@/models'
import { formatUserName } from '../../../lib/formatters'

const chartConfig = {
  km: { label: 'Kilométrage', color: 'var(--chart-1)' },
} satisfies ChartConfig

type KmPoint = {
  label: string
  km: number
  userName: string
  dateLong: string
}

/** Points du graphique, du plus ancien au plus récent (VehiculeKilometragesTab.vue:163). */
function toChartData(kilometrages: VehiculeKilometrageDTO[]): KmPoint[] {
  return [...kilometrages]
    .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
    .map((kilometrage) => {
      const date = new Date(kilometrage.createdAt || 0)
      return {
        label: date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        km: kilometrage.km ?? 0,
        userName: kilometrage.user ? formatUserName(kilometrage.user) : 'Utilisateur inconnu',
        dateLong: date.toLocaleString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
    })
}

const formatKm = (value: number) => `${value.toLocaleString('fr-FR')} km`

type KmChartProps = {
  /** Relevés chargés (la page affichée, ou tout l'historique après « Voir tout »). */
  kilometrages: VehiculeKilometrageDTO[]
}

/**
 * Courbe remplie de l'historique km (remplace le graphique Chart.js du Vue) : ratio 2:1, axe Y non
 * ancré à zéro, légende masquée, infobulle « utilisateur / x km / date ». Couleur du thème
 * (`--chart-1`) au lieu du bleu codé en dur, grille lisible en sombre.
 */
export function KmChart({ kilometrages }: KmChartProps) {
  const data = toChartData(kilometrages)

  return (
    <div className="rounded-xl border bg-card p-4">
      <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            domain={['auto', 'auto']}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width="auto"
            tickFormatter={formatKm}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideIndicator
                labelFormatter={(_, payload) =>
                  (payload?.[0]?.payload as KmPoint | undefined)?.userName
                }
                formatter={(value, _name, item) => (
                  <div className="grid gap-1">
                    <span className="font-mono font-medium text-foreground tabular-nums">
                      {formatKm(Number(value))}
                    </span>
                    <span className="text-muted-foreground">
                      {(item.payload as KmPoint).dateLong}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="km"
            stroke="var(--color-km)"
            strokeWidth={3}
            fill="var(--color-km)"
            fillOpacity={0.1}
            dot={{ r: 6, strokeWidth: 2, stroke: 'white', fill: 'var(--color-km)' }}
            activeDot={{ r: 8, strokeWidth: 3, stroke: 'white', fill: 'var(--color-km)' }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
