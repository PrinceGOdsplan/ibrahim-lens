import { Link } from 'react-router-dom'

export type BreadcrumbItem = {
  label: string
  /** Omit `to` for the current page (non-link). */
  to?: string
}

/** Public trail: Home / … / current */
export function PublicBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const trail: BreadcrumbItem[] = [{ label: 'Home', to: '/' }, ...items]

  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-public-muted">
        {trail.map((item, i) => {
          const last = i === trail.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              {i > 0 ? <span className="text-public-fg/25" aria-hidden>/</span> : null}
              {last || !item.to ? (
                <span className={last ? 'text-public-fg' : undefined} aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="transition-colors hover:text-public-fg">
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
