import { create } from 'zustand'
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI, NEURA_TESTNET } from '../config/contract'

export enum BountyStatus {
  Open = 0,
  Review = 1,
  Awarded = 2,
  Cancelled = 3,
  Refundable = 4,
}

export interface Bounty {
  id: number
  creator: string
  reward: string
  deadline: number
  reviewEnd: number
  status: BountyStatus
  title: string
  description: string
  winner: string
  paid: boolean
  submissionCount: number
}

export interface Submission {
  submitter: string
  evidence: string
  note: string
  createdAt: number
}

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'loading'
  message: string
  txHash?: string
}

interface StoreState {
  // Wallet
  address: string | null
  balance: string
  isConnecting: boolean
  isCorrectNetwork: boolean
  
  // Contract
  contract: Contract | null
  provider: BrowserProvider | null
  
  // Data
  bounties: Bounty[]
  userReputation: number
  isLoading: boolean
  
  // Toasts
  toasts: Toast[]
  
  // Actions
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: () => Promise<void>
  
  // Contract Actions
  createBounty: (title: string, description: string, deadline: number, reviewPeriod: number, reward: string) => Promise<number | null>
  submitSolution: (bountyId: number, evidence: string, note: string) => Promise<boolean>
  awardWinner: (bountyId: number, winner: string) => Promise<boolean>
  cancelBounty: (bountyId: number) => Promise<boolean>
  claimRefund: (bountyId: number) => Promise<boolean>
  
  // Data Fetching
  fetchBounties: () => Promise<void>
  fetchBounty: (id: number) => Promise<Bounty | null>
  fetchSubmissions: (bountyId: number) => Promise<Submission[]>
  fetchUserReputation: (address: string) => Promise<number>
  checkHasSubmitted: (bountyId: number, address: string) => Promise<boolean>
  
  // Toast Actions
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  updateToast: (id: string, updates: Partial<Toast>) => void
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, callback: (...args: unknown[]) => void) => void
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void
    }
  }
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial State
  address: null,
  balance: '0',
  isConnecting: false,
  isCorrectNetwork: false,
  contract: null,
  provider: null,
  bounties: [],
  userReputation: 0,
  isLoading: false,
  toasts: [],
  
  // Wallet Actions
  connectWallet: async () => {
    if (!window.ethereum) {
      get().addToast({ type: 'error', message: 'Please install MetaMask!' })
      return
    }
    
    set({ isConnecting: true })
    
    try {
      const provider = new BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      const address = accounts[0]
      
      const network = await provider.getNetwork()
      const isCorrectNetwork = Number(network.chainId) === 2040
      
      if (!isCorrectNetwork) {
        await get().switchNetwork()
      }
      
      const signer = await provider.getSigner()
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      
      const balance = await provider.getBalance(address)
      
      set({
        address,
        balance: formatEther(balance),
        isCorrectNetwork: true,
        provider,
        contract,
      })
      
      get().addToast({ type: 'success', message: 'Wallet connected!' })
      
      // Fetch user reputation
      const rep = await get().fetchUserReputation(address)
      set({ userReputation: rep })
      
    } catch (error) {
      console.error('Connection error:', error)
      get().addToast({ type: 'error', message: 'Failed to connect wallet' })
    } finally {
      set({ isConnecting: false })
    }
  },
  
  disconnectWallet: () => {
    set({
      address: null,
      balance: '0',
      isCorrectNetwork: false,
      contract: null,
      provider: null,
      userReputation: 0,
    })
    get().addToast({ type: 'info', message: 'Wallet disconnected' })
  },
  
  switchNetwork: async () => {
    if (!window.ethereum) return
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NEURA_TESTNET.chainId }],
      })
      set({ isCorrectNetwork: true })
    } catch (switchError: unknown) {
      const error = switchError as { code?: number }
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NEURA_TESTNET],
          })
          set({ isCorrectNetwork: true })
        } catch {
          get().addToast({ type: 'error', message: 'Failed to add Neura network' })
        }
      }
    }
  },
  
  // Contract Actions
  createBounty: async (title, description, deadline, reviewPeriod, reward) => {
    const { contract, addToast, updateToast } = get()
    if (!contract) {
      addToast({ type: 'error', message: 'Please connect wallet first' })
      return null
    }
    
    const toastId = addToast({ type: 'loading', message: 'Creating bounty...' })
    
    try {
      const tx = await contract.createBounty(
        title,
        description,
        deadline,
        reviewPeriod,
        { value: parseEther(reward) }
      )
      
      updateToast(toastId, { message: 'Confirming transaction...' })
      const receipt = await tx.wait()
      
      // Parse event to get bounty ID
      const event = receipt.logs.find((log: { fragment?: { name: string } }) => 
        log.fragment?.name === 'BountyCreated'
      )
      const bountyId = event ? Number(event.args[0]) : null
      
      updateToast(toastId, { 
        type: 'success', 
        message: 'Bounty created successfully!',
        txHash: receipt.hash 
      })
      
      await get().fetchBounties()
      return bountyId
      
    } catch (error) {
      console.error('Create bounty error:', error)
      updateToast(toastId, { type: 'error', message: 'Failed to create bounty' })
      return null
    }
  },
  
  submitSolution: async (bountyId, evidence, note) => {
    const { contract, addToast, updateToast } = get()
    if (!contract) {
      addToast({ type: 'error', message: 'Please connect wallet first' })
      return false
    }
    
    const toastId = addToast({ type: 'loading', message: 'Submitting solution...' })
    
    try {
      const tx = await contract.submitSolution(bountyId, evidence, note)
      updateToast(toastId, { message: 'Confirming transaction...' })
      const receipt = await tx.wait()
      
      updateToast(toastId, { 
        type: 'success', 
        message: 'Solution submitted!',
        txHash: receipt.hash 
      })
      
      return true
    } catch (error) {
      console.error('Submit solution error:', error)
      updateToast(toastId, { type: 'error', message: 'Failed to submit solution' })
      return false
    }
  },
  
  awardWinner: async (bountyId, winner) => {
    const { contract, addToast, updateToast } = get()
    if (!contract) {
      addToast({ type: 'error', message: 'Please connect wallet first' })
      return false
    }
    
    const toastId = addToast({ type: 'loading', message: 'Awarding winner...' })
    
    try {
      const tx = await contract.awardWinner(bountyId, winner)
      updateToast(toastId, { message: 'Confirming transaction...' })
      const receipt = await tx.wait()
      
      updateToast(toastId, { 
        type: 'success', 
        message: 'Winner awarded and paid!',
        txHash: receipt.hash 
      })
      
      await get().fetchBounties()
      return true
    } catch (error) {
      console.error('Award winner error:', error)
      updateToast(toastId, { type: 'error', message: 'Failed to award winner' })
      return false
    }
  },
  
  cancelBounty: async (bountyId) => {
    const { contract, addToast, updateToast } = get()
    if (!contract) {
      addToast({ type: 'error', message: 'Please connect wallet first' })
      return false
    }
    
    const toastId = addToast({ type: 'loading', message: 'Cancelling bounty...' })
    
    try {
      const tx = await contract.cancelBounty(bountyId)
      updateToast(toastId, { message: 'Confirming transaction...' })
      const receipt = await tx.wait()
      
      updateToast(toastId, { 
        type: 'success', 
        message: 'Bounty cancelled and refunded!',
        txHash: receipt.hash 
      })
      
      await get().fetchBounties()
      return true
    } catch (error) {
      console.error('Cancel bounty error:', error)
      updateToast(toastId, { type: 'error', message: 'Failed to cancel bounty' })
      return false
    }
  },
  
  claimRefund: async (bountyId) => {
    const { contract, addToast, updateToast } = get()
    if (!contract) {
      addToast({ type: 'error', message: 'Please connect wallet first' })
      return false
    }
    
    const toastId = addToast({ type: 'loading', message: 'Claiming refund...' })
    
    try {
      const tx = await contract.claimRefund(bountyId)
      updateToast(toastId, { message: 'Confirming transaction...' })
      const receipt = await tx.wait()
      
      updateToast(toastId, { 
        type: 'success', 
        message: 'Refund claimed!',
        txHash: receipt.hash 
      })
      
      await get().fetchBounties()
      return true
    } catch (error) {
      console.error('Claim refund error:', error)
      updateToast(toastId, { type: 'error', message: 'Failed to claim refund' })
      return false
    }
  },
  
  // Data Fetching
  fetchBounties: async () => {
    const { contract } = get()
    if (!contract) return
    
    set({ isLoading: true })
    
    try {
      const totalBounties = await contract.getTotalBounties()
      const count = Number(totalBounties)
      
      const bounties: Bounty[] = []
      
      for (let i = 0; i < count; i++) {
        const bounty = await get().fetchBounty(i)
        if (bounty) bounties.push(bounty)
      }
      
      set({ bounties })
    } catch (error) {
      console.error('Fetch bounties error:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  fetchBounty: async (id) => {
    const { contract } = get()
    if (!contract) return null
    
    try {
      const [core, text, winnerData, counts] = await Promise.all([
        contract.getBountyCore(id),
        contract.getBountyText(id),
        contract.getBountyWinner(id),
        contract.getCounts(id),
      ])
      
      return {
        id: Number(core.id),
        creator: core.creator,
        reward: formatEther(core.reward),
        deadline: Number(core.deadline),
        reviewEnd: Number(core.reviewEnd),
        status: Number(core.status) as BountyStatus,
        title: text.title,
        description: text.description,
        winner: winnerData.winner,
        paid: winnerData.paid,
        submissionCount: Number(counts),
      }
    } catch (error) {
      console.error('Fetch bounty error:', error)
      return null
    }
  },
  
  fetchSubmissions: async (bountyId) => {
    const { contract } = get()
    if (!contract) return []
    
    try {
      const counts = await contract.getCounts(bountyId)
      const count = Number(counts)
      
      const submissions: Submission[] = []
      
      for (let i = 0; i < count; i++) {
        const sub = await contract.getSubmissionCore(bountyId, i)
        const [evidence, note] = sub.evidence.split('|')
        submissions.push({
          submitter: sub.submitter,
          evidence: evidence || '',
          note: note || '',
          createdAt: Number(sub.createdAt),
        })
      }
      
      return submissions
    } catch (error) {
      console.error('Fetch submissions error:', error)
      return []
    }
  },
  
  fetchUserReputation: async (address) => {
    const { contract } = get()
    if (!contract) return 0
    
    try {
      const rep = await contract.getUserReputation(address)
      return Number(rep)
    } catch {
      return 0
    }
  },
  
  checkHasSubmitted: async (bountyId, address) => {
    const { contract } = get()
    if (!contract) return false
    
    try {
      return await contract.hasSubmitted(bountyId, address)
    } catch {
      return false
    }
  },
  
  // Toast Actions
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7)
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))
    
    if (toast.type !== 'loading') {
      setTimeout(() => get().removeToast(id), 5000)
    }
    
    return id
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
  
  updateToast: (id, updates) => {
    set((state) => ({
      toasts: state.toasts.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }))
    
    if (updates.type && updates.type !== 'loading') {
      setTimeout(() => get().removeToast(id), 5000)
    }
  },
}))
