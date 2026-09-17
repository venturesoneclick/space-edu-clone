import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './FoldText.css'

gsap.registerPlugin(ScrollTrigger)

type Hinge   = 'top' | 'bottom' | 'left' | 'right'
type SplitBy = 'char' | 'word' | 'line'
type Trigger = 'mount' | 'scroll' | 'hover' | 'loop'

const HINGE_CONFIG: Record<Hinge, { origin: string; rotateX: number; rotateY: number }> = {
  top:    { origin: '50% 0%',   rotateX: -92, rotateY: 0  },
  bottom: { origin: '50% 100%', rotateX:  92, rotateY: 0  },
  left:   { origin: '0% 50%',   rotateX:   0, rotateY: 92 },
  right:  { origin: '100% 50%', rotateX:   0, rotateY: -92},
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

const renderWhitespace = (value: string, key: string): ReactNode[] =>
  value.split(/(\n)/).flatMap((part, index) => {
    if (part === '\n') return [<br key={`${key}-br-${index}`} />]
    if (!part) return []
    return [
      <span className="fold-text-whitespace" key={`${key}-space-${index}`}>
        {part.replace(/ /g, '\u00A0')}
      </span>,
    ]
  })

interface FoldTextProps {
  text?: string
  splitBy?: SplitBy
  hinge?: Hinge
  duration?: number
  stagger?: number
  ease?: string
  perspective?: number
  creaseShading?: number
  trigger?: Trigger
  fontSize?: string | number
  fontWeight?: number
  color?: string
  className?: string
  style?: CSSProperties
}

const FoldText = ({
  text = 'Design unfolds',
  splitBy = 'char',
  hinge = 'top',
  duration = 0.65,
  stagger = 0.045,
  ease = 'power3.out',
  perspective = 700,
  creaseShading = 0.55,
  trigger = 'mount',
  fontSize = 80,
  fontWeight = 800,
  color = '#f7f2e8',
  className = '',
  style = {},
}: FoldTextProps) => {
  const rootRef      = useRef<HTMLSpanElement>(null)
  const timelineRef  = useRef<gsap.core.Timeline | null>(null)
  const hingeConfig  = HINGE_CONFIG[hinge] ?? HINGE_CONFIG.top
  const safeCrease   = clamp(creaseShading, 0, 1)
  const safePerspective = Math.max(120, perspective)

  const segments = useMemo(() => {
    let idx = 0
    const seg = (content: ReactNode, key: string, split: SplitBy = splitBy) => {
      idx++
      return (
        <span
          className="fold-text-segment"
          data-fold-split={split}
          key={key}
          style={{ '--fold-perspective': `${safePerspective}px` } as CSSProperties}
        >
          <span
            className="fold-text-piece"
            data-fold-hinge={hinge}
            style={{ transformOrigin: hingeConfig.origin, '--fold-crease': 0 } as CSSProperties}
          >
            {content || '\u00A0'}
          </span>
        </span>
      )
    }

    if (splitBy === 'line') {
      return text.split('\n').map((line, i) => (
        <span className="fold-text-line" key={`line-${i}`}>
          {seg(line || '\u00A0', `seg-line-${i}`, 'line')}
        </span>
      ))
    }

    if (splitBy === 'word') {
      return text.split(/(\s+)/).flatMap((part, i) => {
        if (!part) return []
        if (/^\s+$/.test(part)) return renderWhitespace(part, `ws-${i}`)
        return [seg(part, `seg-word-${idx}`)]
      })
    }

    // char
    return Array.from(text).map((char, i) => {
      if (char === '\n') return <br key={`br-${i}`} />
      return seg(char === ' ' ? '\u00A0' : char, `seg-char-${i}`)
    })
  }, [text, splitBy, hinge, hingeConfig.origin, safePerspective])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const pieces = Array.from(root.querySelectorAll<HTMLElement>('.fold-text-piece'))
    if (!pieces.length) return

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const activeDuration = reduceMotion ? Math.min(duration, 0.22) : duration
    const activeStagger  = reduceMotion ? Math.min(stagger, 0.02) : stagger

    const fromVars: gsap.TweenVars = {
      opacity: 0,
      rotateX: reduceMotion ? 0 : hingeConfig.rotateX,
      rotateY: reduceMotion ? 0 : hingeConfig.rotateY,
      '--fold-crease': reduceMotion ? 0 : safeCrease,
      transformOrigin: hingeConfig.origin,
      force3D: true,
    }
    const toVars: gsap.TweenVars = {
      opacity: 1,
      rotateX: 0,
      rotateY: 0,
      '--fold-crease': 0,
      duration: activeDuration,
      ease: reduceMotion ? 'power1.out' : ease,
      stagger: activeStagger,
      clearProps: 'willChange',
    }

    const killTL = () => {
      timelineRef.current?.kill()
      timelineRef.current = null
      gsap.killTweensOf(pieces)
    }

    const play = (repeat: boolean) => {
      killTL()
      timelineRef.current = gsap.timeline({
        repeat: repeat ? -1 : 0,
        repeatDelay: repeat ? 0.75 : 0,
      })
      timelineRef.current.fromTo(pieces, fromVars, toVars)
      return timelineRef.current
    }

    let st: ScrollTrigger | undefined
    let hoverFn: (() => void) | undefined

    if (trigger === 'hover') {
      gsap.set(pieces, { opacity: 1, rotateX: 0, rotateY: 0, '--fold-crease': 0, transformOrigin: hingeConfig.origin })
      hoverFn = () => play(false)
      root.addEventListener('mouseenter', hoverFn)
    } else if (trigger === 'scroll') {
      gsap.set(pieces, fromVars)
      st = ScrollTrigger.create({
        trigger: root,
        start: 'top 82%',
        once: true,
        onEnter: () => play(false),
      })
    } else if (trigger === 'loop') {
      play(true)
    } else {
      play(false)
    }

    return () => {
      if (hoverFn) root.removeEventListener('mouseenter', hoverFn)
      st?.kill()
      killTL()
    }
  }, [text, splitBy, hinge, duration, stagger, ease, perspective, safeCrease, trigger,
      hingeConfig.origin, hingeConfig.rotateX, hingeConfig.rotateY])

  const rootStyle: CSSProperties = {
    '--fold-text-font-size':   typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
    '--fold-text-font-weight': fontWeight,
    '--fold-text-color':       color,
    ...style,
  } as CSSProperties

  return (
    <span ref={rootRef} className={`fold-text ${className}`.trim()} style={rootStyle}>
      <span className="fold-text-sr-only">{text}</span>
      <span className="fold-text-visual" aria-hidden="true">{segments}</span>
    </span>
  )
}

export default FoldText
