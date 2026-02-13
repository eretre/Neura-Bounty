import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Coins, Users, Clock, ArrowLeft, ExternalLink, 
  Send, Trophy, RefreshCw, Loader2, AlertCircle,
  CheckCircle, User
} from 'lucide-react'
import { useStore, Bounty, Submission, BountyStatus } from '../store/useStore'
import StatusBadge from '../components/StatusBadge'
import CountdownTimer from '../components/CountdownTimer'
import { NEURA_TESTNET } from '../config/contract'

export default function BountyDetail() {
  const { id } = useParams<{ id: string }>()
  const bountyId = parseInt(id || '0')
  
  const { 
    address, 
    fetchBounty, 
    fetchSubmissions, 
    checkHasSubmitted,
    submitSolution,
    awardWinner,
    cancelBounty,
    claimRefund,
    contract 
  } = useStore()
  
  const [bounty, setBounty] = useState<Bounty | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Form states
  const [evidence, setEvidence] = useState('')
  const [note, setNote] = useState('')
  const [selectedWinner, setSelectedWinner] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  useEffect(() => {
    const loadData = async () => {
      if (!contract) return
      
      setIsLoading(true)
      const bountyData = await fetchBounty(bountyId)
      setBounty(bountyData)
      
      if (bountyData) {
        const subs = await fetchSubmissions(bountyId)
        setSubmissions(subs)
        
        if (address) {
          const submitted = await checkHasSubmitted(bountyId, address)
          setHasSubmitted(submitted)
        }
      }
      setIsLoading(false)
    }
    
    loadData()
  }, [bountyId, contract, address, fetchBounty, fetchSubmissions, checkHasSubmitted])
  
  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!evidence.trim()) return
    
    setIsSubmitting(true)
    const success = await submitSolution(bountyId, evidence, note)
    
    if (success) {
      setEvidence('')
      setNote('')
      setHasSubmitted(true)
      const subs = await fetchSubmissions(bountyId)
      setSubmissions(subs)
    }
    setIsSubmitting(false)
  }
  
  const handleAwardWinner = async () => {
    if (!selectedWinner) return
    
    setIsSubmitting(true)
    const success = await awardWinner(bountyId, selectedWinner)
    
    if (success) {
      const bountyData = await fetchBounty(bountyId)
      setBounty(bountyData)
    }
    setIsSubmitting(false)
  }
  
  const handleCancel = async () => {
    setIsSubmitting(true)
    const success = await cancelBounty(bountyId)
    
    if (success) {
      const bountyData = await fetchBounty(bountyId)
      setBounty(bountyData)
    }
    setIsSubmitting(false)
  }
  
  const handleRefund = async () => {
    setIsSubmitting(true)
    const success = await claimRefund(bountyId)
    
    if (success) {
      const bountyData = await fetchBounty(bountyId)
      setBounty(bountyData)
    }
    setIsSubmitting(false)
  }
  
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
  const formatDate = (timestamp: number) => new Date(timestamp * 1000).toLocaleDateString()
  
  const isCreator = address && bounty && address.toLowerCase() === bounty.creator.toLowerCase()
  const canSubmit = bounty?.status === BountyStatus.Open && !hasSubmitted && !isCreator
  const canAward = isCreator && bounty?.status === BountyStatus.Review && submissions.length > 0
  const canCancel = isCreator && bounty?.status === BountyStatus.Open && submissions.length === 0
  const canRefund = isCreator && bounty?.status === BountyStatus.Refundable && !bounty.paid
  
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }
  
  if (!bounty) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Bounty Not Found</h2>
          <p className="text-text-secondary mb-6">This bounty doesn't exist or has been removed</p>
          <Link to="/bounties" className="btn-primary">
            Back to Bounties
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Link */}
      <Link to="/bounties" className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Bounties
      </Link>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bounty Header */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <StatusBadge status={bounty.status} />
              <a
                href={`${NEURA_TESTNET.blockExplorerUrls[0]}/address/${bounty.creator}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-secondary hover:text-primary flex items-center gap-1"
              >
                {formatAddress(bounty.creator)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">{bounty.title}</h1>
            <p className="text-text-secondary whitespace-pre-wrap">{bounty.description}</p>
            
            <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-2 text-primary">
                <Coins className="w-5 h-5" />
                <span className="text-xl font-bold">{bounty.reward} ANKR</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Users className="w-5 h-5" />
                <span>{bounty.submissionCount} submissions</span>
              </div>
              <CountdownTimer deadline={bounty.deadline} />
            </div>
          </div>
          
          {/* Submit Solution Form */}
          {canSubmit && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Submit Your Solution
              </h2>
              
              <form onSubmit={handleSubmitSolution} className="space-y-4">
                <div>
                  <label className="label">Evidence (IPFS CID or URL)</label>
                  <input
                    type="text"
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    placeholder="e.g., QmXxx... or https://..."
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label className="label">Note (optional)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add any additional context..."
                    rows={3}
                    className="input resize-none"
                    maxLength={200}
                  />
                  <span className="text-text-secondary text-sm">{note.length}/200</span>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || !evidence.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Solution
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
          
          {hasSubmitted && bounty.status === BountyStatus.Open && (
            <div className="card bg-success/10 border-success/30">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-success" />
                <div>
                  <h3 className="font-semibold text-white">Solution Submitted!</h3>
                  <p className="text-text-secondary text-sm">Your submission is recorded on-chain</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Submissions List */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Submissions ({submissions.length})
            </h2>
            
            {submissions.length === 0 ? (
              <p className="text-text-secondary text-center py-8">No submissions yet</p>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${
                      bounty.winner.toLowerCase() === sub.submitter.toLowerCase()
                        ? 'bg-success/10 border-success/30'
                        : 'bg-surface-light border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <a
                            href={`${NEURA_TESTNET.blockExplorerUrls[0]}/address/${sub.submitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-white hover:text-primary flex items-center gap-1"
                          >
                            {formatAddress(sub.submitter)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <span className="text-xs text-text-secondary">{formatDate(sub.createdAt)}</span>
                        </div>
                      </div>
                      {bounty.winner.toLowerCase() === sub.submitter.toLowerCase() && (
                        <span className="flex items-center gap-1 text-success text-sm font-semibold">
                          <Trophy className="w-4 h-4" />
                          Winner
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-text-secondary mb-1">Evidence:</p>
                      <code className="text-sm text-primary break-all">{sub.evidence}</code>
                    </div>
                    
                    {sub.note && (
                      <div className="mt-2">
                        <p className="text-sm text-text-secondary mb-1">Note:</p>
                        <p className="text-sm text-white">{sub.note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="card">
            <h3 className="text-sm font-semibold text-text-secondary mb-4">Bounty Details</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-text-secondary">Reward</span>
                <p className="text-lg font-bold text-primary">{bounty.reward} ANKR</p>
              </div>
              <div>
                <span className="text-xs text-text-secondary">Deadline</span>
                <p className="text-white">{formatDate(bounty.deadline)}</p>
              </div>
              <div>
                <span className="text-xs text-text-secondary">Review Ends</span>
                <p className="text-white">{formatDate(bounty.reviewEnd)}</p>
              </div>
              <div>
                <span className="text-xs text-text-secondary">Creator</span>
                <a
                  href={`${NEURA_TESTNET.blockExplorerUrls[0]}/address/${bounty.creator}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-primary flex items-center gap-1"
                >
                  {formatAddress(bounty.creator)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Creator Panel */}
          {isCreator && (
            <div className="card border-primary/30">
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Creator Panel
              </h3>
              
              {canAward && (
                <div className="space-y-4">
                  <div>
                    <label className="label">Select Winner</label>
                    <select
                      value={selectedWinner}
                      onChange={(e) => setSelectedWinner(e.target.value)}
                      className="input"
                    >
                      <option value="">Choose a submitter...</option>
                      {submissions.map((sub, index) => (
                        <option key={index} value={sub.submitter}>
                          {formatAddress(sub.submitter)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={handleAwardWinner}
                    disabled={!selectedWinner || isSubmitting}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Trophy className="w-5 h-5" />
                        Award Winner
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="btn-secondary w-full flex items-center justify-center gap-2 text-error border-error/30 hover:bg-error/10"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Cancel & Refund'
                  )}
                </button>
              )}
              
              {canRefund && (
                <button
                  onClick={handleRefund}
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Claim Refund
                    </>
                  )}
                </button>
              )}
              
              {bounty.status === BountyStatus.Awarded && (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-5 h-5" />
                  <span>Winner awarded and paid!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
