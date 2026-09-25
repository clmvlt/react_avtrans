import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentProps,
  type PointerEvent,
  type Ref,
} from 'react'
import { PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Méthodes exposées par `ref`. */
export type SignaturePadHandle = {
  /** Efface le tracé. */
  clear: () => void
  /** Signature en PNG base64 (data-URL) sur fond blanc, ou `null` si rien n'est dessiné. */
  toDataURL: () => string | null
  /** `true` tant que rien n'est dessiné. */
  isEmpty: () => boolean
}

type SignaturePadProps = Omit<ComponentProps<'div'>, 'ref' | 'children'> & {
  ref?: Ref<SignaturePadHandle>
  disabled?: boolean
  /** Couleur du trait (`#111827` par défaut). */
  strokeColor?: string
  /** Épaisseur du trait en px CSS (2,5 par défaut). */
  lineWidth?: number
  /** Appelé quand la zone passe de vide à signée et inversement (ex. activer « Signer »). */
  onEmptyChange?: (isEmpty: boolean) => void
}

/**
 * Zone de signature au doigt ou à la souris (port de `SignaturePad.vue`) : pointer events avec
 * capture, prise en compte du `devicePixelRatio`, tracé conservé quand la zone change de taille.
 * La taille est mesurée sur le canvas lui-même (le Vue mesurait le conteneur, bordure comprise,
 * d'où un tracé légèrement déformé).
 *
 * @example
 * const padRef = useRef<SignaturePadHandle>(null)
 * <SignaturePad ref={padRef} disabled={isPending} />
 * const signature = padRef.current?.toDataURL() ?? null
 */
export function SignaturePad({
  ref,
  disabled = false,
  strokeColor = '#111827',
  lineWidth = 2.5,
  onEmptyChange,
  className,
  ...props
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPoint = useRef({ x: 0, y: 0 })
  const emptyRef = useRef(true)
  const [isEmpty, setIsEmpty] = useState(true)

  const updateEmpty = (next: boolean) => {
    if (emptyRef.current === next) return
    emptyRef.current = next
    setIsEmpty(next)
    onEmptyChange?.(next)
  }

  const getContext = () => canvasRef.current?.getContext('2d') ?? null

  // Adapte la résolution interne du canvas à sa taille affichée, en conservant le tracé.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      // Taille de mise en page (insensible au zoom-in-95 d'ouverture des Dialogs)
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (width === 0 || height === 0) return
      const dpr = window.devicePixelRatio || 1
      const previous = emptyRef.current ? null : canvas.toDataURL('image/png')

      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      const context = canvas.getContext('2d')
      if (!context) return
      context.scale(dpr, dpr)
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.strokeStyle = strokeColor
      context.lineWidth = lineWidth

      if (previous) {
        const image = new Image()
        image.onload = () => context.drawImage(image, 0, 0, width, height)
        image.src = previous
      }
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [strokeColor, lineWidth])

  const clear = () => {
    const canvas = canvasRef.current
    const context = getContext()
    if (!canvas || !context) return
    context.save()
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.restore()
    updateEmpty(true)
  }

  const toDataURL = () => {
    const canvas = canvasRef.current
    if (!canvas || emptyRef.current) return null
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = canvas.width
    exportCanvas.height = canvas.height
    const exportContext = exportCanvas.getContext('2d')
    if (!exportContext) return canvas.toDataURL('image/png')
    exportContext.fillStyle = '#ffffff'
    exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
    exportContext.drawImage(canvas, 0, 0)
    return exportCanvas.toDataURL('image/png')
  }

  useImperativeHandle(ref, () => ({ clear, toDataURL, isEmpty: () => emptyRef.current }))

  const getPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget
    const rect = canvas.getBoundingClientRect()
    // Ramène le point à la taille de mise en page si le canvas est transformé (animation)
    const scaleX = rect.width ? canvas.clientWidth / rect.width : 1
    const scaleY = rect.height ? canvas.clientHeight / rect.height : 1
    return { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY }
  }

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const context = getContext()
    if (disabled || !context) return
    drawing.current = true
    const { x, y } = getPoint(event)
    lastPoint.current = { x, y }
    // Point initial : un simple appui laisse une trace.
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + 0.01, y + 0.01)
    context.stroke()
    updateEmpty(false)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const context = getContext()
    if (!drawing.current || disabled || !context) return
    const { x, y } = getPoint(event)
    context.beginPath()
    context.moveTo(lastPoint.current.x, lastPoint.current.y)
    context.lineTo(x, y)
    context.stroke()
    lastPoint.current = { x, y }
  }

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    drawing.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)} {...props}>
      <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-border bg-white">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Zone de signature"
          className="block h-44 w-full touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        {isEmpty && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
            <PenLine className="size-6 opacity-50" />
            <span className="text-sm">Signez ici avec votre doigt ou la souris</span>
          </div>
        )}
      </div>

      <button
        type="button"
        className="self-end text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        disabled={isEmpty || disabled}
        onClick={clear}
      >
        Effacer
      </button>
    </div>
  )
}
