import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Windows from './pages/Windows.jsx'
import WindowsServer2025 from './pages/WindowsServer2025.jsx'
import Linux from './pages/Linux.jsx'
import Unix from './pages/Unix.jsx'
import Networking from './pages/Networking.jsx'
import Python from './pages/Python.jsx'
import Cybersecurity from './pages/Cybersecurity.jsx'
import PowerShell from './pages/PowerShell.jsx'
import DevOps from './pages/DevOps.jsx'
import Troubleshooting from './pages/Troubleshooting.jsx'
import CheatSheets from './pages/CheatSheets.jsx'
import ITModels from './pages/ITModels.jsx'
import PortLookup from './pages/PortLookup.jsx'
import VmwareSetup from './pages/VmwareSetup.jsx'

// Generic placeholder for routes not yet built
const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
    <div className="text-5xl">🚧</div>
    <h1 className="text-2xl font-bold text-white">{title}</h1>
    <p className="text-slate-400 text-sm">Full lesson content coming in Phase 5+</p>
  </div>
)

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* ── Main pages ── */}
        <Route index element={<Home />} />
        <Route path="windows"             element={<Windows />} />
        <Route path="windows-server-2025" element={<WindowsServer2025 />} />
        <Route path="linux"               element={<Linux />} />
        <Route path="unix"                element={<Unix />} />
        <Route path="networking"          element={<Networking />} />
        <Route path="python"              element={<Python />} />
        <Route path="cybersecurity"       element={<Cybersecurity />} />
        <Route path="powershell"          element={<PowerShell />} />
        <Route path="devops"              element={<DevOps />} />
        <Route path="troubleshooting"     element={<Troubleshooting />} />
        <Route path="cheatsheets"         element={<CheatSheets />} />
        <Route path="it-models"           element={<ITModels />} />
        <Route path="port-lookup"         element={<PortLookup />} />
        <Route path="vmware-setup"        element={<VmwareSetup />} />

        {/* ── Lesson-level placeholders (Phase 5+) ── */}
        <Route path="windows-server-2025/:lesson"   element={<Placeholder title="Lesson — Windows Server 2025" />} />
        <Route path="windows/:lesson"               element={<Placeholder title="Lesson — Windows" />} />
        <Route path="linux/:lesson"                 element={<Placeholder title="Lesson — Linux" />} />
        <Route path="unix/:lesson"                  element={<Placeholder title="Lesson — Unix" />} />
        <Route path="networking/:lesson"            element={<Placeholder title="Lesson — Networking" />} />
        <Route path="python/:lesson"                element={<Placeholder title="Lesson — Python" />} />
        <Route path="cybersecurity/:lesson"         element={<Placeholder title="Lesson — Cybersecurity" />} />
        <Route path="powershell/:lesson"            element={<Placeholder title="Lesson — PowerShell" />} />
        <Route path="devops/:lesson"                element={<Placeholder title="Lesson — DevOps" />} />
        <Route path="troubleshooting/:lesson"       element={<Placeholder title="Lesson — Troubleshooting" />} />

        {/* 404 */}
        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Route>
    </Routes>
  )
}
