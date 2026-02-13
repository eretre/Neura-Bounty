import { Link } from 'react-router-dom'
import { Zap, Shield, Trophy, Coins, ArrowRight, Sparkles, Target, Users } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function Landing() {
  const { connectWallet, address } = useStore()
  
  const features = [
    {
      icon: Coins,
      title: 'Native ANKR Rewards',
      description: 'Bounties funded directly with native ANKR tokens. No ERC20 complexity.',
    },
    {
      icon: Shield,
      title: 'Secure & Trustless',
      description: 'Smart contract escrow ensures fair payouts. No intermediaries needed.',
    },
    {
      icon: Trophy,
      title: 'Onchain Reputation',
      description: 'Build your reputation with every bounty won. Fully verifiable on-chain.',
    },
    {
      icon: Target,
      title: 'Review Period',
      description: 'Creators have dedicated time to review submissions before awarding.',
    },
  ]
  
  const stats = [
    { value: '100%', label: 'Onchain' },
    { value: '0%', label: 'Platform Fee' },
    { value: '∞', label: 'Possibilities' },
  ]
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-text-secondary">Powered by Neura Testnet</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Decentralized</span>
              <br />
              <span className="text-gradient">Bounty Platform</span>
            </h1>
            
            <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
              Create bounties, submit solutions, and earn native ANKR rewards. 
              Build your onchain reputation in the Neura ecosystem.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {address ? (
                <Link to="/bounties" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                  Explore Bounties
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <button onClick={connectWallet} className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                  <Zap className="w-5 h-5" />
                  Connect & Start
                </button>
              )}
              <Link to="/create" className="btn-secondary flex items-center gap-2 text-lg px-8 py-4">
                Create Bounty
              </Link>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                <div className="text-sm text-text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-[100px] -translate-y-1/2" />
      </section>
      
      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Neura Bounty Board?
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              A fully decentralized bounty platform built for the Neura ecosystem
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card group hover:border-primary/50"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create a Bounty',
                description: 'Fund your bounty with native ANKR and set a deadline. Your funds are securely held in the smart contract.',
                icon: Target,
              },
              {
                step: '02',
                title: 'Receive Submissions',
                description: 'Hunters submit their solutions before the deadline. Each submission is recorded on-chain.',
                icon: Users,
              },
              {
                step: '03',
                title: 'Award & Pay',
                description: 'Review submissions during the review period and award the winner. Payment is instant and trustless.',
                icon: Trophy,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="card h-full">
                  <div className="text-6xl font-bold text-primary/10 absolute top-4 right-4">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-text-secondary">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-primary/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="card gradient-border text-center py-16 px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Start?
            </h2>
            <p className="text-text-secondary mb-8 max-w-xl mx-auto">
              Join the decentralized bounty revolution on Neura. Create bounties, hunt for rewards, and build your reputation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/bounties" className="btn-primary flex items-center gap-2">
                Browse Bounties
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/create" className="btn-secondary">
                Post a Bounty
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
