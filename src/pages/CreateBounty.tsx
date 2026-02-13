import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coins, Calendar, Clock, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function CreateBounty() {
  const navigate = useNavigate()
  const { createBounty, address, connectWallet } = useStore()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [reward, setReward] = useState('')
  const [deadlineDays, setDeadlineDays] = useState('7')
  const [reviewPeriodDays, setReviewPeriodDays] = useState('3')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!title.trim()) newErrors.title = 'Title is required'
    else if (title.length > 80) newErrors.title = 'Title must be 80 characters or less'
    
    if (!description.trim()) newErrors.description = 'Description is required'
    else if (description.length > 500) newErrors.description = 'Description must be 500 characters or less'
    
    if (!reward || parseFloat(reward) <= 0) newErrors.reward = 'Reward must be greater than 0'
    
    if (!deadlineDays || parseInt(deadlineDays) < 1) newErrors.deadline = 'Deadline must be at least 1 day'
    
    if (!reviewPeriodDays || parseInt(reviewPeriodDays) < 1) newErrors.reviewPeriod = 'Review period must be at least 1 day'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setIsSubmitting(true)
    
    const deadline = Math.floor(Date.now() / 1000) + parseInt(deadlineDays) * 86400
    const reviewPeriod = parseInt(reviewPeriodDays) * 86400
    
    const bountyId = await createBounty(title, description, deadline, reviewPeriod, reward)
    
    setIsSubmitting(false)
    
    if (bountyId !== null) {
      navigate(`/bounty/${bountyId}`)
    }
  }
  
  if (!address) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-6">
            <Coins className="w-10 h-10 text-text-secondary" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h2>
          <p className="text-text-secondary mb-6">Connect your wallet to create a bounty</p>
          <button onClick={connectWallet} className="btn-primary">
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Bounty</h1>
        <p className="text-text-secondary">Fund a bounty with native ANKR and find talented hunters</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="label flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Build a DeFi Dashboard"
            className={`input ${errors.title ? 'border-error' : ''}`}
            maxLength={80}
          />
          <div className="flex justify-between mt-1">
            {errors.title && (
              <span className="text-error text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </span>
            )}
            <span className="text-text-secondary text-sm ml-auto">{title.length}/80</span>
          </div>
        </div>
        
        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the bounty requirements, deliverables, and any specific criteria..."
            rows={5}
            className={`input resize-none ${errors.description ? 'border-error' : ''}`}
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            {errors.description && (
              <span className="text-error text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </span>
            )}
            <span className="text-text-secondary text-sm ml-auto">{description.length}/500</span>
          </div>
        </div>
        
        {/* Reward */}
        <div>
          <label className="label flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Reward (ANKR)
          </label>
          <div className="relative">
            <input
              type="number"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="0.0"
              step="0.01"
              min="0"
              className={`input pr-16 ${errors.reward ? 'border-error' : ''}`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium">
              ANKR
            </span>
          </div>
          {errors.reward && (
            <span className="text-error text-sm flex items-center gap-1 mt-1">
              <AlertCircle className="w-4 h-4" />
              {errors.reward}
            </span>
          )}
        </div>
        
        {/* Deadline & Review Period */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="label flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Deadline (days)
            </label>
            <input
              type="number"
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(e.target.value)}
              min="1"
              className={`input ${errors.deadline ? 'border-error' : ''}`}
            />
            {errors.deadline && (
              <span className="text-error text-sm flex items-center gap-1 mt-1">
                <AlertCircle className="w-4 h-4" />
                {errors.deadline}
              </span>
            )}
          </div>
          
          <div>
            <label className="label flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Review Period (days)
            </label>
            <input
              type="number"
              value={reviewPeriodDays}
              onChange={(e) => setReviewPeriodDays(e.target.value)}
              min="1"
              className={`input ${errors.reviewPeriod ? 'border-error' : ''}`}
            />
            {errors.reviewPeriod && (
              <span className="text-error text-sm flex items-center gap-1 mt-1">
                <AlertCircle className="w-4 h-4" />
                {errors.reviewPeriod}
              </span>
            )}
          </div>
        </div>
        
        {/* Summary Card */}
        <div className="card bg-surface-light">
          <h3 className="text-sm font-semibold text-text-secondary mb-4">Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Reward</span>
              <span className="text-white font-semibold">{reward || '0'} ANKR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Submission Deadline</span>
              <span className="text-white">{deadlineDays} days from now</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Review Period</span>
              <span className="text-white">{reviewPeriodDays} days after deadline</span>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="flex justify-between">
                <span className="text-text-secondary">Total Locked</span>
                <span className="text-primary font-bold">{reward || '0'} ANKR</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Bounty...
            </>
          ) : (
            <>
              <Coins className="w-5 h-5" />
              Create Bounty
            </>
          )}
        </button>
      </form>
    </div>
  )
}
