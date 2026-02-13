import { BountyStatus } from '../store/useStore'

interface StatusBadgeProps {
  status: BountyStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case BountyStatus.Open:
        return { label: 'Open', color: 'bg-success/20 text-success border-success/30' }
      case BountyStatus.Review:
        return { label: 'In Review', color: 'bg-warning/20 text-warning border-warning/30' }
      case BountyStatus.Awarded:
        return { label: 'Awarded', color: 'bg-primary/20 text-primary border-primary/30' }
      case BountyStatus.Cancelled:
        return { label: 'Cancelled', color: 'bg-error/20 text-error border-error/30' }
      case BountyStatus.Refundable:
        return { label: 'Refundable', color: 'bg-secondary/20 text-secondary border-secondary/30' }
      default:
        return { label: 'Unknown', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
    }
  }
  
  const { label, color } = getStatusConfig()
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
      {label}
    </span>
  )
}
