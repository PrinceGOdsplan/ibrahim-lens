import { useLayoutEffect, useRef, type RefObject } from 'react'
import { isStudioStandalone } from '@/lib/notice-channels'

function scrollParent(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el.parentElement
  while (node) {
    const style = window.getComputedStyle(node)
    const scrollable =
      /auto|scroll|overlay/.test(style.overflowY) || /auto|scroll|overlay/.test(style.overflow)
    if (scrollable && node.scrollHeight > node.clientHeight) return node
    node = node.parentElement
  }
  return null
}

/** Scroll a node into its nearest scrollport after it opens or grows. */
export function revealInView(el: Element | null, block: ScrollLogicalPosition = 'start') {
  if (!el || !(el instanceof HTMLElement)) return
  const run = () => {
    const parent = scrollParent(el)
    if (parent) {
      const elRect = el.getBoundingClientRect()
      const parentRect = parent.getBoundingClientRect()
      const pad = 12
      if (elRect.bottom > parentRect.bottom - pad) {
        parent.scrollTop += elRect.bottom - parentRect.bottom + pad
      } else if (elRect.top < parentRect.top + pad) {
        parent.scrollTop -= parentRect.top - elRect.top + pad
      }
      return
    }
    if (isStudioStandalone()) return
    el.scrollIntoView({ block, inline: 'nearest', behavior: 'smooth' })
  }
  requestAnimationFrame(() => requestAnimationFrame(run))
}

/** Attach to the panel that appears when `active` is true. */
export function useRevealInView<T extends HTMLElement = HTMLDivElement>(
  active: boolean,
  deps: unknown[] = [],
): RefObject<T | null> {
  const ref = useRef<T | null>(null)
  useLayoutEffect(() => {
    if (!active) return
    revealInView(ref.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller lists open identity
  }, [active, ...deps])
  return ref
}

const FOCUSABLE = 'input, textarea, select, [contenteditable="true"]'

/** Keep focused fields on screen inside overflow scrollers (lists, sheets). */
export function attachFocusReveal(root: HTMLElement | null) {
  if (!root) return () => undefined
  function onFocus(event: FocusEvent) {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    if (!target.matches(FOCUSABLE)) return
    revealInView(target, 'nearest')
  }
  root.addEventListener('focusin', onFocus)
  return () => root.removeEventListener('focusin', onFocus)
}
