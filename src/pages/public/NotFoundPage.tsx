import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-3xl flex-col justify-center px-6 py-16">
      <h1 className="font-display text-4xl">Page not found</h1>
      <p className="mt-4 text-public-muted">That path does not exist on this site.</p>
      <Link to="/" className="mt-8 text-public-accent hover:underline">
        Back to Home
      </Link>
    </section>
  )
}
