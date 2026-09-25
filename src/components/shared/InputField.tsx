import { useId, useState, type ComponentProps } from 'react'
import { Eye, EyeOff, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type InputFieldProps = Omit<ComponentProps<'input'>, 'children'> & {
  /** Libellé relié à l'input (`htmlFor`) ; astérisque rouge si `required` */
  label?: string
  /** Message d'erreur sous le champ (remplace le hint) ; bordure et libellé en rouge */
  error?: string
  /** Aide affichée sous le champ quand il n'y a pas d'erreur */
  hint?: string
  /** Icône lucide affichée à gauche dans le champ */
  icon?: LucideIcon
  /** Bouton œil pour afficher / masquer un `type="password"` */
  showPasswordToggle?: boolean
}

/**
 * Champ de saisie avec libellé, icône, aide, erreur et bouton œil (InputField.vue).
 *
 * Contrôlable comme un `<input>` natif (`value` / `onChange` / `onBlur` / `name` / `ref`) : on peut
 * donc lui passer directement le `field` d'un `Controller` de react-hook-form. Les props natives
 * (dont `required`, `disabled`, `autoComplete`, `id`) sont transmises à l'input ; `className`
 * s'applique au conteneur, comme la prop `class` du Vue.
 */
export function InputField({
  label,
  error,
  hint,
  icon: Icon,
  showPasswordToggle = false,
  type = 'text',
  id,
  required,
  disabled,
  className,
  'aria-describedby': ariaDescribedBy,
  ...props
}: InputFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const [showPassword, setShowPassword] = useState(false)

  const hasError = !!error
  const hasToggle = showPasswordToggle && type === 'password'
  const inputType = hasToggle && showPassword ? 'text' : type
  const describedBy =
    [ariaDescribedBy, hasError ? errorId : hint ? hintId : undefined].filter(Boolean).join(' ') ||
    undefined

  return (
    <Field className={cn('gap-2', className)}>
      {label && (
        <FieldLabel
          htmlFor={inputId}
          className={cn(
            'text-sm leading-none font-medium',
            hasError && 'text-destructive',
            disabled && 'text-muted-foreground',
          )}
        >
          {label}
          {required && <span className="text-destructive">*</span>}
        </FieldLabel>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2',
              hasError ? 'text-destructive' : 'text-muted-foreground',
            )}
          />
        )}

        <Input
          id={inputId}
          type={inputType}
          required={required}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cn(Icon && 'pl-9', hasToggle && 'pr-10')}
          {...props}
        />

        {hasToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            disabled={disabled}
            tabIndex={-1}
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? (
              <EyeOff className="size-4 text-muted-foreground" />
            ) : (
              <Eye className="size-4 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>

      {hint && !hasError && (
        <FieldDescription id={hintId} className="text-xs">
          {hint}
        </FieldDescription>
      )}

      {hasError && (
        <FieldError id={errorId} className="text-xs">
          {error}
        </FieldError>
      )}
    </Field>
  )
}
