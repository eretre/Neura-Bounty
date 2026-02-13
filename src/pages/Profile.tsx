import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Star, Target, Wallet, ExternalLink, Loader2, Copy, Check } from 'lucide-react'
import { useStore, Bounty, BountyStatus } from '../store/useStore'
import { NEURA_TESTNET } from '../config/contract'
import StatusBadge from '../components/StatusBadge'

export default function Profile() {
  const { address, balance, userReputation, bounties, fetchBounties, connectWallet, contract } = useStore()
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    const loadData = async () => {
      if (contract && address) {
        setIsLoading(true)
        await fetchBounties()
        setIsLoading(false)
      }
    }
    loadData()
  }, [contract, address, fetchBounties])
  
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  const userBounties = bounties.filter(
    (b) => b.creator.toLowerCase() === address?.toLowerCase()
  )
  
  const userWins = bounties.filter(
    (b) => b.winner.toLowerCase() === address?.toLowerCase()
  )
  
  const userSubmissions = bounties.filter((b) => {
    // This is a simplified check - in production you'd track submissions per user
    return b.status !== BountyStatus.Cancelled
  })
  
  const formatAddress = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-6)}`
  
  const getReputationLevel = (rep: number) => {
    if (rep >= 100) return { level: 'Legend', color: 'text-yellow-400' }
    if (rep >= 50) return { level: 'Expert', color: 'text-purple-400' }
    if (rep >= 20) return { level: 'Pro', color: 'text-blue-400' }
    if (rep >= 5) return { level: 'Rising', color: 'text-green-400' }
    return { level: 'Newcomer', color: 'text-text-secondary' }
  }
  
  if (!address) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-text-secondary" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h2>
          <p className="text-text-secondary mb-6">Connect your wallet to view your profile</p>
          <button onClick={connectWallet} className="btn-primary">
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }
  
  const { level, color } = getReputationLevel(userReputation)
  
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <div className="card gradient-border mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {address.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-surface border-2 border-primary flex items-center justify-center">
              <Star className="w-4 h-4 text-primary" />
            </div>
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{formatAddress(address)}</h1>
              <button
                onClick={copyAddress}
                className="p-2 rounded-lg hover:bg-surface-light transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4 text-text-secondary" />
                )}
              </button>
              <a
                href={`${NEURA_TESTNET.blockExplorerUrls[0]}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-surface-light transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-text-secondary" />
              </a>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-sm font-semibold ${color}`}>{level}</span>
              <span className="text-text-secondary">•</span>
              <span className="text-text-secondary text-sm">{userReputation} reputation points</span>
            </div>
            
            <div className="flex items-center gap-2 text-lg">
              <span className="text-text-secondary">Balance:</span>
              <span className="font-bold text-primary">{parseFloat(balance).toFixed(4)} ANKR</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{userReputation}</div>
          <div className="text-text-secondary text-sm">Reputation</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-success" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{userWins.length}</div>
          <div className="text-text-secondary text-sm">Bounties Won</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-secondary" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{userBounties.length}</div>
          <div className="text-text-secondary text-sm">Bounties Created</div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Created Bounties */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Your Bounties
            </h2>
            
            {userBounties.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary mb-4">You haven't created any bounties yet</p>
                <Link to="/create" className="btn-primary inline-flex">
                  Create Bounty
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {userBounties.slice(0, 5).map((bounty: Bounty) => (
                  <Link
                    key={bounty.id}
                    to={`/bounty/${bounty.id}`}
                    className="block p-4 rounded-xl bg-surface-light hover:bg-surface border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-white line-clamp-1">{bounty.title}</h3>
                      <StatusBadge status={bounty.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <span className="text-primary font-semibold">{bounty.reward} ANKR</span>
                      <span>{bounty.submissionCount} submissions</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Won Bounties */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-success" />
              Bounties Won
            </h2>
            
            {userWins.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary mb-4">You haven't won any bounties yet</p>
                <Link to="/bounties" className="btn-secondary inline-flex">
                  Browse Bounties
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {userWins.slice(0, 5).map((bounty: Bounty) => (
                  <Link
                    key={bounty.id}
                    to={`/bounty/${bounty.id}`}
                    className="block p-4 rounded-xl bg-success/10 border border-success/30 hover:bg-success/20 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-white line-clamp-1">{bounty.title}</h3>
                      <Trophy className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-success font-semibold">+{bounty.reward} ANKR</span>
                      <span className="text-text-secondary">+10 reputation</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
