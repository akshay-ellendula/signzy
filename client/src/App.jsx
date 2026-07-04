import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Vendors from './pages/Vendors'
import VendorDetails from './pages/VendorDetails'
import RouteTester from './pages/RouteTester'
import Metrics from './pages/Metrics'
import Logs from './pages/Logs'
import LogDetails from './pages/LogDetails'
import Health from './pages/Health'
import AIRuleGenerator from './pages/AIRuleGenerator'
import Settings from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/vendors/new" element={<VendorDetails />} />
        <Route path="/vendors/:id" element={<VendorDetails />} />
        <Route path="/route-tester" element={<RouteTester />} />
        <Route path="/metrics" element={<Metrics />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/logs/:id" element={<LogDetails />} />
        <Route path="/health" element={<Health />} />
        <Route path="/ai-rule-generator" element={<AIRuleGenerator />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
