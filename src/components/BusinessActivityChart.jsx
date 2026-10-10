import { useState } from 'react'

function BusinessActivityChart({ activityTrend = [], totalLeads = 0 }) {
  const data = activityTrend
  const [activeIdx, setActiveIdx] = useState(null)

  // Chart Geometry
  const width = 640
  const height = 200
  const padLeft = 40
  const padRight = 30
  const padTop = 20
  const padBottom = 30
  const innerW = width - padLeft - padRight
  const innerH = height - padTop - padBottom

  // Dynamic scale with safe floor
  const maxInSeries = Math.max(0, ...data.map((d) => Number(d.leads) || 0))
  const maxLeads = maxInSeries > 0 ? Math.max(10, Math.ceil(maxInSeries * 1.25)) : 10

  const points = data.map((d, i) => {
    const denom = data.length > 1 ? data.length - 1 : 1
    const x = padLeft + (i / denom) * innerW
    const yLeads = padTop + innerH - ((d.leads || 0) / maxLeads) * innerH
    return { ...d, x, yLeads }
  })

  // Smooth Bezier Curve generator for Leads
  const getCurvePath = (pts) => {
    if (!pts.length) return ''
    let p = `M ${pts[0].x} ${pts[0].yLeads}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[Math.min(i + 2, pts.length - 1)]

      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.yLeads + (p2.yLeads - p0.yLeads) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.yLeads + (p3.yLeads - p1.yLeads) / 6

      p += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.yLeads.toFixed(1)}`
    }
    return p
  }

  const leadsPath = getCurvePath(points)

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-odw-border bg-white p-5 sm:p-6 shadow-2xs">
      <div>
        {/* Card Header */}
        <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-odw-charcoal">Lead Growth</h3>
          <p className="text-xs text-odw-text-muted">
            Monthly lead generation over the last 6 months.
          </p>
        </div>

        {/* Clean Line Chart */}
        <div className="relative mt-4 w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible"
            aria-label="6-month lead growth chart"
          >
            {/* Horizontal Grid Lines & Y-Axis Labels */}
            {[0, Math.round(maxLeads / 2), maxLeads].map((val) => {
              const y = padTop + innerH - (val / maxLeads) * innerH
              return (
                <g key={val}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={padLeft + innerW}
                    y2={y}
                    stroke="#F1F5F9"
                    strokeWidth="1"
                    strokeDasharray={val === 0 ? 'none' : '3 3'}
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-mono select-none"
                  >
                    {val}
                  </text>
                </g>
              )
            })}

            {/* X-Axis Month Labels */}
            {points.map((p, i) => (
              <text
                key={p.month}
                x={p.x}
                y={height - 6}
                textAnchor="middle"
                className={`text-[11px] select-none transition-colors ${
                  activeIdx === i ? 'fill-odw-text font-bold' : 'fill-slate-400 font-medium'
                }`}
              >
                {p.month}
              </text>
            ))}

            {/* Leads Primary Line (ODW Orange) */}
            <path
              d={leadsPath}
              fill="none"
              stroke="#EF520B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Hover Points */}
            {points.map((p, i) => (
              <g
                key={p.month}
                className="cursor-pointer"
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                <rect
                  x={p.x - 24}
                  y={padTop}
                  width="48"
                  height={innerH}
                  fill="transparent"
                />
                <circle
                  cx={p.x}
                  cy={p.yLeads}
                  r={activeIdx === i ? '5.5' : '3.5'}
                  fill="#FFFFFF"
                  stroke="#EF520B"
                  strokeWidth="2.5"
                  className="transition-all duration-150"
                />
              </g>
            ))}
          </svg>

          {/* Simple Hover Tooltip */}
          {activeIdx !== null && points[activeIdx] && (
            <div
              className="absolute -top-3 pointer-events-none rounded-lg border border-odw-border bg-white px-2.5 py-1 text-xs shadow-md transition-all z-10"
              style={{
                left: `${(points[activeIdx].x / width) * 100}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <p className="font-semibold text-odw-text mb-0.5">{points[activeIdx].month}</p>
              <span className="text-odw-primary font-bold text-xs">
                {points[activeIdx].leads || 0} Leads
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Summary */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="font-bold text-odw-charcoal">{totalLeads} Total Leads</span>
        <span className="text-[11px] text-odw-text-muted font-medium">6-month lead growth</span>
      </div>
    </div>
  )
}

export default BusinessActivityChart
