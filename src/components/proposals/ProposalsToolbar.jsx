import { Search } from 'lucide-react'
import { PROPOSAL_STATUS_OPTIONS } from '../../data/proposals'

function ProposalsToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  serviceFilter,
  onServiceChange,
  serviceOptions = [],
  totalCount = 0,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 border-b border-odw-border">
      {/* Left Title / Counter */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-odw-text">All Proposals</h2>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          {totalCount}
        </span>
      </div>

      {/* Right Filters & Search */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative min-w-[200px] sm:min-w-[240px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search proposals..."
            className="w-full rounded-lg border border-odw-border bg-white pl-8 pr-3 py-1.5 text-xs text-odw-text placeholder:text-slate-400 focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-lg border border-odw-border bg-white px-2.5 py-1.5 text-xs text-odw-text focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors cursor-pointer"
        >
          {PROPOSAL_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {/* Service Filter */}
        <select
          value={serviceFilter}
          onChange={(e) => onServiceChange(e.target.value)}
          className="rounded-lg border border-odw-border bg-white px-2.5 py-1.5 text-xs text-odw-text focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors cursor-pointer"
        >
          {serviceOptions.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default ProposalsToolbar
