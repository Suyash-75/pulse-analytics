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

export default function PulseAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)

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
  }

  async function handleDelete(id: string) {
    await supabase.from('pulse_metrics').delete().eq('id', id)
  }

  // 🔥 Feature: Simulate Live Traffic Spike
  async function simulateTrafficSpike() {
    setSimulating(true)
    const randomHits = Math.floor(Math.random() * 900) + 100
    const latencies = ['12ms', '24ms', '48ms', '85ms']
    const randomLatency = latencies[Math.floor(Math.random() * latencies.length)]

    await supabase.from('pulse_metrics').insert([
      { title: 'Live Requests', value: `${randomHits} req/s`, change: '+45% spike detected' },
      { title: 'API Latency', value: randomLatency, change: 'Optimal performance' }
    ])
    setSimulating(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">PulseAnalytics</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v2.0 Pro
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Real-time serverless PostgreSQL tracking dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={simulateTrafficSpike}
              disabled={simulating}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-lg shadow-emerald-900/20 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              {simulating ? 'Simulating...' : 'Simulate Traffic Spike'}
            </button>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 text-emerald-400 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              DB Live
            </span>
          </div>
        </header>

        {/* Action Panel: Add Custom Metric */}
        <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
            ➕ Inject Custom Metric to DB
          </h2>
          <form onSubmit={handleAddMetric} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Metric Name (e.g. CPU Usage)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Value (e.g. 98.4%)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Status/Change (e.g. +5% load)"
              value={change}
              onChange={(e) => setChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition shadow-lg shadow-indigo-600/20"
            >
              {submitting ? 'Saving...' : 'Commit to DB'}
            </button>
          </form>
        </section>

        {/* Metrics Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 animate-pulse">Syncing with PostgreSQL...</div>
        ) : metrics.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-400">No active metrics found. Click "Simulate Traffic Spike" above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between relative group hover:border-indigo-500/50 transition duration-300 shadow-lg"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {metric.title}
                    </span>
                    <button
                      onClick={() => handleDelete(metric.id)}
                      className="text-slate-600 hover:text-rose-400 text-xs transition p-1 opacity-0 group-hover:opacity-100"
                      title="Delete metric"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-3xl font-black text-white mt-3 tracking-tight">
                    {metric.value}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-between items-center text-xs">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    🟢 {metric.change}
                  </span>
                  <span className="text-slate-600">
                    {new Date(metric.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}