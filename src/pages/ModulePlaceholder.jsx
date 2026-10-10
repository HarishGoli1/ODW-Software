import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

function ModulePlaceholder({ title, description, category = 'Module' }) {
  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col gap-1 border-b border-odw-border pb-5">
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-odw-text-muted hover:text-odw-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <span className="text-xs text-slate-300">/</span>
          <span className="text-xs font-semibold text-odw-primary uppercase tracking-wider">
            {category}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-odw-text mt-1">
          {title}
        </h1>
        <p className="text-sm text-odw-text-muted">{description}</p>
      </div>

      {/* Module Content Placeholder Shell */}
      <div className="rounded-xl border border-odw-border bg-white p-8 text-center shadow-2xs">
        <div className="mx-auto max-w-md space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-odw-primary border border-orange-200/60">
            <span className="text-lg font-bold">ODW</span>
          </div>
          <h2 className="text-base font-semibold text-odw-text">
            {title} Workspace
          </h2>
          <p className="text-xs text-odw-text-muted leading-relaxed">
            This module foundation is connected and ready for Phase 2 data views and management operations.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-odw-primary px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModulePlaceholder
