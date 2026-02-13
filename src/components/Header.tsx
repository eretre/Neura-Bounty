import { Link, useLocation } from 'react-router-dom'
import { Wallet, Menu, X, Zap, User, PlusCircle, List } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store/useStore'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { address, balance, isConnecting, connectWallet, disconnectWallet, isCorrectNetwork, switchNetwork } = useStore()
  
  const navLinks = [
    { path: '/bounties', label: 'Bounties', icon: List },
    { path: '/create', label: 'Create', icon: PlusCircle },
    { path: '/profile', label: 'Profile', icon: User },
  ]
  
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-secondary blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            </div>
            <span className="text-xl font-bold text-gradient hidden sm:block">Neura Bounty</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  location.pathname === path
                    ? 'bg-primary/20 text-primary'
                    : 'text-text-secondary hover:text-white hover:bg-surface-light'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
          
          {/* Wallet Connection */}
          <div className="flex items-center gap-3">
            {address ? (
              <div className="flex items-center gap-3">
                {!isCorrectNetwork && (
                  <button
                    onClick={switchNetwork}
                    className="px-3 py-2 bg-warning/20 text-warning rounded-lg text-sm font-medium hover:bg-warning/30 transition-colors"
                  >
                    Switch Network
                  </button>
                )}
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-surface-light rounded-lg border border-border">
                  <span className="text-sm text-text-secondary">{parseFloat(balance).toFixed(4)} ANKR</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="flex items-center gap-2 px-4 py-2 bg-surface-light rounded-lg border border-border hover:border-primary/50 transition-all duration-300"
                >
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium">{formatAddress(address)}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn-primary flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-surface-light transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-border/50">
          <nav className="px-4 py-4 space-y-2">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  location.pathname === path
                    ? 'bg-primary/20 text-primary'
                    : 'text-text-secondary hover:text-white hover:bg-surface-light'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
