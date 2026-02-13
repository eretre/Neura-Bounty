import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  deadline: number
  label?: string
}

export default function CountdownTimer({ deadline, label = 'Ends in' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)
  
  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000)
      const diff = deadline - now
      
      if (diff <= 0) {
        setIsExpired(true)
        setTimeLeft('Expired')
        return
      }
      
      const days = Math.floor(diff / 86400)
      const hours = Math.floor((diff % 86400) / 3600)
      const minutes = Math.floor((diff % 3600) / 60)
      const seconds = diff % 60
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }
    
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    
    return () => clearInterval(interval)
  }, [deadline])
  
  return (
    <div className={`flex items-center gap-2 ${isExpired ? 'text-error' : 'text-text-secondary'}`}>
      <Clock className="w-4 h-4" />
      <span className="text-sm">
        {label}: <span className={`font-mono font-semibold ${isExpired ? 'text-error' : 'text-white'}`}>{timeLeft}</span>
      </span>
    </div>
  )
}
