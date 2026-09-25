import { cn } from '@/lib/utils'
import { FormSectionSeparator } from './FormSectionSeparator'
import { VehicleCarburantField } from './VehicleCarburantField'
import { VehicleTextField } from './VehicleTextField'

type VehicleExtraFieldsProps = {
  /**
   * `dialog` : création (grilles fixes à 2 et 3 colonnes, même sur mobile, comme Vehicules.vue:386) ;
   * `card` : édition dans la fiche (grilles à partir de sm, fond de carte).
   */
  variant: 'dialog' | 'card'
  disabled?: boolean
}

/** Sections « Informations techniques » et « Assurance & Contrôle technique » du formulaire véhicule. */
export function VehicleExtraFields({ variant, disabled }: VehicleExtraFieldsProps) {
  const isCard = variant === 'card'
  const cols2 = cn('grid gap-4', isCard ? 'sm:grid-cols-2' : 'grid-cols-2')
  const cols3 = cn('grid gap-4', isCard ? 'sm:grid-cols-3' : 'grid-cols-3')
  const separatorLabel = isCard ? 'bg-card' : 'bg-background'

  return (
    <>
      <FormSectionSeparator labelClassName={separatorLabel}>
        Informations techniques
      </FormSectionSeparator>

      <div className={cols2}>
        <VehicleTextField
          name="vin"
          label="VIN"
          uppercase
          placeholder="WF0XXXGCDX1234567"
          maxLength={17}
          disabled={disabled}
          inputClassName="font-mono"
        />
        <VehicleTextField
          name="numeroCarteGrise"
          label="N° carte grise"
          placeholder="2024AB12345"
          disabled={disabled}
        />
      </div>

      <div className={cols3}>
        <VehicleTextField
          name="dateMiseEnCirculation"
          label="Mise en circulation"
          type="date"
          disabled={disabled}
        />
        <VehicleCarburantField disabled={disabled} />
        <VehicleTextField
          name="ptac"
          label="PTAC (kg)"
          type="number"
          inputMode="numeric"
          placeholder="3500"
          min={0}
          disabled={disabled}
        />
      </div>

      <FormSectionSeparator labelClassName={separatorLabel}>
        Assurance & Contrôle technique
      </FormSectionSeparator>

      <div className={cols2}>
        <VehicleTextField name="assureur" label="Assureur" placeholder="AXA" disabled={disabled} />
        <VehicleTextField
          name="numeroContratAssurance"
          label="N° contrat assurance"
          placeholder="ASS-2025-123456"
          disabled={disabled}
        />
      </div>

      <div className={cols2}>
        <VehicleTextField
          name="dateExpirationAssurance"
          label="Expiration assurance"
          type="date"
          disabled={disabled}
        />
        <VehicleTextField
          name="dateProchainControleTechnique"
          label="Prochain contrôle technique"
          type="date"
          disabled={disabled}
        />
      </div>
    </>
  )
}
