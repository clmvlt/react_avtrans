import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import {
  BedDouble,
  Car,
  ContactRound,
  IdCard,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Scale,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useUsersLastVehiclesQuery } from '@/features/users/api/useUsersLastVehiclesQuery'
import { AccountStatusBadges } from '@/features/users/components/AccountStatusBadges'
import { RoleBadge } from '@/features/users/components/RoleBadge'
import { formatCreatedAt, formatVehicleDate } from '@/features/users/lib/formatters'
import type { UserDTO } from '@/models'
import { HubCard } from './HubCard'

type EmployeeInfoCardProps = {
  user: UserDTO
  onEdit: () => void
}

type InfoRowProps = {
  icon: LucideIcon
  label: string
  children: ReactNode
}

const NOT_SET = <span className="text-muted-foreground italic">Non renseigné</span>

function InfoRow({ icon: Icon, label, children }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm break-words text-foreground">{children}</dd>
      </div>
    </div>
  )
}

/** « 12 rue des Lilas, 29200 Brest », `null` sans adresse. */
function formatAddress(user: UserDTO): string | null {
  const { street, postalCode, city } = user.address ?? {}
  const town = [postalCode, city].filter(Boolean).join(' ')
  const text = [street, town].filter(Boolean).join(', ')
  return text || null
}

/** Coordonnées et compte de l'employé : contact cliquable, contrat, rôle, dernier véhicule. */
export function EmployeeInfoCard({ user, onEdit }: EmployeeInfoCardProps) {
  // Échec silencieux, comme la colonne « Dernier véhicule » de la page Utilisateurs
  const lastVehicleQuery = useUsersLastVehiclesQuery()
  const lastVehicle = user.uuid ? lastVehicleQuery.data?.get(user.uuid) : undefined
  const address = formatAddress(user)
  const createdAt = formatCreatedAt(user.createdAt)

  return (
    <HubCard
      title="Coordonnées"
      icon={ContactRound}
      actions={
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="size-4" />
          Modifier
        </Button>
      }
    >
      <dl className="divide-y">
        <InfoRow icon={Mail} label="E-mail">
          {user.email ? (
            <span className="flex flex-wrap items-center gap-2">
              <a href={`mailto:${user.email}`} className="hover:text-primary hover:underline">
                {user.email}
              </a>
              {!user.isMailVerified && (
                <Badge variant="outline" className="border-warning/50 text-warning">
                  Non vérifié
                </Badge>
              )}
            </span>
          ) : (
            NOT_SET
          )}
        </InfoRow>
        <InfoRow icon={Smartphone} label="Téléphone personnel">
          {user.telPersonnel ? (
            <a href={`tel:${user.telPersonnel}`} className="hover:text-primary hover:underline">
              {user.telPersonnel}
            </a>
          ) : (
            NOT_SET
          )}
        </InfoRow>
        {user.telPro && (
          <InfoRow icon={Phone} label="Téléphone professionnel">
            <a href={`tel:${user.telPro}`} className="hover:text-primary hover:underline">
              {user.telPro}
            </a>
          </InfoRow>
        )}
        <InfoRow icon={MapPin} label="Adresse">
          {address ?? NOT_SET}
        </InfoRow>
        <InfoRow icon={IdCard} label="Permis de conduire">
          {user.driverLicenseNumber || NOT_SET}
        </InfoRow>
        <InfoRow icon={Scale} label="Contrat">
          {user.heureContrat != null ? `${user.heureContrat} h par mois` : NOT_SET}
        </InfoRow>
        <InfoRow icon={ShieldCheck} label="Compte">
          <span className="flex flex-wrap items-center gap-1.5">
            <RoleBadge role={user.role} />
            <AccountStatusBadges user={user} />
            {user.isCouchette && (
              <Badge variant="secondary" className="gap-1">
                <BedDouble className="size-3" />
                Couchette
              </Badge>
            )}
          </span>
          {createdAt && (
            <span className="mt-1 block text-xs text-muted-foreground">Inscrit le {createdAt}</span>
          )}
        </InfoRow>
        {lastVehicle && (
          <InfoRow icon={Car} label="Dernier véhicule">
            <Link
              to={`/vehicules/${lastVehicle.vehiculeId}`}
              className="font-medium hover:text-primary hover:underline"
            >
              {lastVehicle.vehiculeImmat}
            </Link>
            <span className="text-muted-foreground"> · {formatVehicleDate(lastVehicle.date)}</span>
          </InfoRow>
        )}
      </dl>
    </HubCard>
  )
}
