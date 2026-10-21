'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dqoplrolsocpengnxocp.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb3Bscm9sc29jcGVuZ254b2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1OTIxMDAsImV4cCI6MjEwODE2ODEwMH0.QMfvTDuX-6GIjC9f-tBfLsWoWCa8Xh55Zxv4sWfpCDE'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Metric {
  id: string
  title: string
  value: string
  change: string
  created_at: string
}

export default function PulseAnalyticsPro() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  
  // Navigation & Modal States
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'settings'>('overview')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [value, setValue] = useState('')
  const [change, setChange] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchMetrics()

    const channel = supabase
      .channel('realtime_pulse_metrics')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pulse_metrics' },
        () => { fetchMetrics() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchMetrics() {
    const { data, error } = await supabase
      .from('pulse_metrics')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setMetrics(data)
    setLoading(false)
  }

  async function handleAddMetric(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !value || !change) return
    setSubmitting(true)
    
    await supabase.from('pulse_metrics').insert([{ title, value, change }])
    
    setTitle(''); setValue(''); setChange('')
    setSubmitting(false)
    setIsModalOpen(false) // Close popup modal on success
  }

  async function handleDelete(id: string) {
    await supabase.from('pulse_metrics').delete().eq('id', id)
    setSelectedMetric(null)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* Sidebar Navigation (Multi-Page Switcher) */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
              P
            </div>
            <span className="font-bold text-lg tracking-tight text-white">PulseAnalytics</span>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'overview'
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              📊 Overview Dashboard
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'logs'
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              📜 Live Database Logs
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'settings'
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              ⚙️ Project Settings
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500">
          PostgreSQL Connected <br />
          <span className="text-emerald-400 font-semibold">● Real-time Active</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        
        {/* Top Bar */}
        <header className="flex justify-between items-center border-b border-slate-800 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white capitalize">{activeTab} View</h1>
            <p className="text-slate-400 text-sm">Manage and monitor live server metrics in real-time.</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            <span>+</span> Add New Metric
          </button>
        </header>

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-20 text-slate-500 animate-pulse">Loading live data from PostgreSQL...</div>
            ) : metrics.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-slate-400">No metrics found. Click "+ Add New Metric" above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((metric) => (
                  <div
                    key={metric.id}
                    onClick={() => setSelectedMetric(metric)}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-indigo-500/50 transition duration-300 shadow-xl group relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {metric.title}
                        </span>
                        <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition">
                          View details ↗
                        </span>
                      </div>
                      <div className="text-3xl font-black text-white mt-3">
                        {metric.value}
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-semibold text-emerald-400">
                      {metric.change}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE DATABASE LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-sm text-slate-300">
              Raw Database Records (`pulse_metrics`)
            </div>
            <div className="divide-y divide-slate-800">
              {metrics.map((m) => (
                <div key={m.id} className="p-4 flex justify-between items-center text-sm">
                  <div>
                    <span className="font-bold text-white">{m.title}</span> — <span className="text-indigo-400">{m.value}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(m.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-xl">
            <h2 className="font-bold text-lg text-white">Database Configuration</h2>
            <p className="text-sm text-slate-400">Connected securely to Supabase PostgreSQL cluster.</p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400">
              URL: {supabaseUrl}
            </div>
          </div>
        )}

      </main>

      {/* POPUP MODAL 1: ADD NEW METRIC */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Add New Metric</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddMetric} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Server CPU Load"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold">Value</label>
                <input
                  type="text"
                  placeholder="e.g. 74.2%"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold">Change / Status</label>
                <input
                  type="text"
                  placeholder="e.g. +2.4% from peak"
                  value={change}
                  onChange={(e) => setChange(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20"
              >
                {submitting ? 'Saving to DB...' : 'Save Metric'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: METRIC DETAIL VIEW & DELETE */}
      {selectedMetric && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Metric Details</h2>
              <button onClick={() => setSelectedMetric(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase">Title</span>
                <p className="text-white font-semibold text-lg">{selectedMetric.title}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase">Value</span>
                <p className="text-indigo-400 font-mono text-xl">{selectedMetric.value}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase">Change Status</span>
                <p className="text-emerald-400 text-sm">{selectedMetric.change}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase">Created At</span>
                <p className="text-slate-400 text-xs">{new Date(selectedMetric.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => handleDelete(selectedMetric.id)}
                className="flex-1 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 font-semibold py-2.5 rounded-xl transition text-sm"
              >
                Delete from DB
              </button>
              <button
                onClick={() => setSelectedMetric(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl transition text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}