import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, PlusCircle, Loader2, Inbox } from 'lucide-react'
import { useStore, BountyStatus } from '../store/useStore'
import BountyCard from '../components/BountyCard'

export default function BountyList() {
  const { bounties, isLoading, fetchBounties, address, contract } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<BountyStatus | 'all'>('all')
  
  useEffect(() => {
    if (contract) {
      fetchBounties()
    }
  }, [contract, fetchBounties])
  
  const filteredBounties = bounties.filter((bounty) => {
    const matchesSearch = bounty.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bounty.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || bounty.status === statusFilter
    return matchesSearch && matchesStatus
  })
  
  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: BountyStatus.Open, label: 'Open' },
    { value: BountyStatus.Review, label: 'In Review' },
    { value: BountyStatus.Awarded, label: 'Awarded' },
    { value: BountyStatus.Refundable, label: 'Refundable' },
  ]
  
  if (!address) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-6">
            <Inbox className="w-10 h-10 text-text-secondary" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h2>
          <p className="text-text-secondary mb-6">Connect your wallet to view and interact with bounties</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bounty Board</h1>
          <p className="text-text-secondary">Discover and complete bounties to earn ANKR rewards</p>
        </div>
        <Link to="/create" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          Create Bounty
        </Link>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search bounties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value === 'all' ? 'all' : Number(e.target.value) as BountyStatus)}
            className="input pl-12 pr-10 appearance-none cursor-pointer min-w-[160px]"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Bounty Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredBounties.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-6">
            <Inbox className="w-10 h-10 text-text-secondary" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No bounties found</h3>
          <p className="text-text-secondary mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Be the first to create a bounty!'}
          </p>
          <Link to="/create" className="btn-primary inline-flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Create Bounty
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBounties.map((bounty) => (
            <BountyCard key={bounty.id} bounty={bounty} />
          ))}
        </div>
      )}
    </div>
  )
}
