import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import BountyList from './pages/BountyList'
import CreateBounty from './pages/CreateBounty'
import BountyDetail from './pages/BountyDetail'
import Profile from './pages/Profile'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/bounties" element={<BountyList />} />
        <Route path="/create" element={<CreateBounty />} />
        <Route path="/bounty/:id" element={<BountyDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  )
}

export default App
