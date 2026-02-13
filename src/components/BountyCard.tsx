import { Link } from 'react-router-dom'
import { Coins, Users, ArrowRight } from 'lucide-react'
import { Bounty } from '../store/useStore'
import StatusBadge from './StatusBadge'
import CountdownTimer from './CountdownTimer'

interface BountyCardProps {
  bounty: Bounty
}

export default function BountyCard({ bounty }: BountyCardProps) {
  return (
    <Link
      to={`/bounty/${bounty.id}`}
      className="card group hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-4">
        <StatusBadge status={bounty.status} />
        <div className="flex items-center gap-2 text-primary font-bold">
          <Coins className="w-5 h-5" />
          <span>{bounty.reward} ANKR</span>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
        {bounty.title}
      </h3>
      
      <p className="text-text-secondary text-sm mb-4 line-clamp-2">
        {bounty.description}
      </p>
      
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4">
          <CountdownTimer deadline={bounty.deadline} />
          <div className="flex items-center gap-1 text-text-secondary">
            <Users className="w-4 h-4" />
            <span className="text-sm">{bounty.submissionCount}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-sm font-medium">View</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  )
}
