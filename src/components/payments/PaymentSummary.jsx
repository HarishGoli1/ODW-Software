import { CheckCircle2, Clock, CreditCard, RotateCcw } from 'lucide-react'

const formatINR = (val) => {
  if (typeof val !== 'number') return val
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val)
}

function PaymentSummary({ payments = [] }) {
  // Sum dynamically calculated only for matching status
  const receivedPayments = payments.filter((p) => p.status === 'Received')
  const pendingPayments = payments.filter((p) => p.status === 'Pending')
  const partialPayments = payments.filter((p) => p.status === 'Partial')
  const refundedPayments = payments.filter((p) => p.status === 'Refunded')

  const receivedTotal = receivedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const pendingTotal = pendingPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const partialTotal = partialPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const refundedTotal = refundedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const cards = [
    {
      label: 'Total Received',
      value: formatINR(receivedTotal),
      context: `${receivedPayments.length} received ${receivedPayments.length === 1 ? 'payment' : 'payments'}`,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      badgeBorder: 'border-emerald-200/70',
    },
    {
      label: 'Pending',
      value: formatINR(pendingTotal),
      context: `${pendingPayments.length} awaiting clearance`,
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      badgeBorder: 'border-amber-200/70',
    },
    {
      label: 'Partial',
      value: formatINR(partialTotal),
      context: `${partialPayments.length} installment ${partialPayments.length === 1 ? 'payment' : 'payments'}`,
      icon: CreditCard,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      badgeBorder: 'border-blue-200/70',
    },
    {
      label: 'Refunded',
      value: formatINR(refundedTotal),
      context: `${refundedPayments.length} reversed ${refundedPayments.length === 1 ? 'transaction' : 'transactions'}`,
      icon: RotateCcw,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      badgeBorder: 'border-rose-200/70',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon

        return (
          <div
            key={card.label}
            className="flex flex-col justify-between rounded-xl border border-odw-border bg-white p-3.5 sm:p-4 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-medium text-odw-text-muted">
                {card.label}
              </span>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg border ${card.iconBg} ${card.iconColor} ${card.badgeBorder}`}
              >
                <IconComponent className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-2.5">
              <p className="text-lg sm:text-xl font-bold tracking-tight text-odw-text">
                {card.value}
              </p>
              <p className="mt-0.5 text-[11px] text-odw-text-muted truncate">
                {card.context}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PaymentSummary
