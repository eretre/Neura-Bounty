import { ReactNode } from 'react'
import Header from './Header'
import ToastContainer from './ToastContainer'
import BackgroundEffects from './BackgroundEffects'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundEffects />
      <Header />
      <main className="relative z-10 pt-20">
        {children}
      </main>
      <ToastContainer />
    </div>
  )
}
