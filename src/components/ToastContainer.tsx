import { CheckCircle, XCircle, Info, Loader2, ExternalLink, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { NEURA_TESTNET } from '../config/contract'

export default function ToastContainer() {
  const { toasts, removeToast } = useStore()
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />
      case 'error':
        return <XCircle className="w-5 h-5 text-error" />
      case 'loading':
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />
      default:
        return <Info className="w-5 h-5 text-secondary" />
    }
  }
  
  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-success/30'
      case 'error':
        return 'border-error/30'
      case 'loading':
        return 'border-primary/30'
      default:
        return 'border-secondary/30'
    }
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`glass ${getBorderColor(toast.type)} rounded-xl p-4 shadow-xl animate-in slide-in-from-right duration-300`}
        >
          <div className="flex items-start gap-3">
            {getIcon(toast.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{toast.message}</p>
              {toast.txHash && (
                <a
                  href={`${NEURA_TESTNET.blockExplorerUrls[0]}/tx/${toast.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-1"
                >
                  View on Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-text-secondary hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
