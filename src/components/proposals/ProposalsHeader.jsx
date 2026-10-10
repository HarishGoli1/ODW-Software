import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

function ProposalsHeader({ onAddProposal = () => {}, canAdd = true }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Breadcrumb & Title */}
      <div>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-odw-text-muted">
          <Link
            to="/dashboard"
            className="hover:text-odw-primary transition-colors font-medium"
          >
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-odw-text font-semibold">Proposals</span>
        </nav>
        <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-odw-text">
          Proposals
        </h1>
        <p className="mt-0.5 text-xs sm:text-sm text-odw-text-muted">
          Create, track, and manage client proposals.
        </p>
      </div>

      {/* Primary Action Button */}
      {canAdd && (
        <div className="shrink-0">
          <button
            type="button"
            onClick={onAddProposal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-2xs hover:bg-odw-primary-hover active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-odw-primary"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add Proposal</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default ProposalsHeader
