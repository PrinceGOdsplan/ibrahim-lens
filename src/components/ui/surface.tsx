import { createContext, useContext, type ReactNode } from 'react'

export type Surface = 'public' | 'studio'

/**
 * Which design surface a subtree belongs to.
 *
 * Tokens and fonts are scoped to a shell class on a layout element, but dialogs
 * portal to `body` and land outside it — so a public overlay silently inherits
 * the Studio faces, and vice versa. Carrying the surface in context lets a
 * portal stamp the correct shell class on its own root without needing to know
 * where in the tree it was rendered from.
 */
const SurfaceContext = createContext<Surface | null>(null)

const shellClass: Record<Surface, string> = {
  public: 'public-shell',
  studio: 'studio-shell',
}

export function SurfaceProvider({ surface, children }: { surface: Surface; children: ReactNode }) {
  return <SurfaceContext.Provider value={surface}>{children}</SurfaceContext.Provider>
}

let warned = false

/** The shell class a portal root should carry to inherit the right tokens. */
export function useSurfaceShellClass() {
  const surface = useContext(SurfaceContext)
  if (surface) return shellClass[surface]

  // Falling back silently is how the original bug looked: a font that is nearly
  // right. Say so once, rather than per render.
  if (import.meta.env.DEV && !warned) {
    warned = true
    console.warn(
      '[ibrahim-lens] A dialog rendered outside a SurfaceProvider and is falling back to the ' +
        'public shell. Wrap the route in <SurfaceProvider surface="…"> so its tokens are explicit.',
    )
  }
  return shellClass.public
}
