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
}

export default function PulseAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [title, setTitle] = useState('')
  const [value, setValue] = useState('')
  const [change, setChange] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 1. Fetch initial metrics & listen for real-time updates
  useEffect(() => {
    fetchMetrics()

    const channel = supabase
      .channel('realtime_pulse_metrics')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pulse_metrics' },
        () => {
          fetchMetrics()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchMetrics() {
    const { data, error } = await supabase
      .from('pulse_metrics')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setMetrics(data)
    }
    setLoading(false)
  }

  // 2. Add new metric to PostgreSQL
  async function handleAddMetric(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !value || !change) return

    setSubmitting(true)
    const { error } = await supabase
      .from('pulse_metrics')
      .insert([{ title, value, change }])

    if (!error) {
      setTitle('')
      setValue('')
      setChange('')
    }
    setSubmitting(false)
  }

  // 3. Delete metric from PostgreSQL
  async function handleDeleteMetric(id: string) {
    await supabase.from('pulse_metrics').delete().eq('id', id)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">PulseAnalytics</h1>
            <p className="text-slate-400 text-sm mt-1">
              Live PostgreSQL Metrics Dashboard
            </p>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-time Connected
          </span>
        </header>

        {/* Add New Metric Form */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Add Custom Metric</h2>
          <form onSubmit={handleAddMetric} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Title (e.g. Conversion Rate)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Value (e.g. 3.42%)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Change (e.g. +0.4% this week)"
              value={change}
              onChange={(e) => setChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition"
            >
              {submitting ? 'Adding...' : 'Insert Row'}
            </button>
          </form>
        </section>

        {/* Metrics Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading metrics...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between relative group hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {metric.title}
                    </span>
                    <button
                      onClick={() => handleDeleteMetric(metric.id)}
                      className="text-slate-600 hover:text-rose-400 text-xs transition opacity-0 group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="text-2xl font-bold text-white mt-2">
                    {metric.value}
                  </div>
                </div>
                <div className="text-xs font-medium text-emerald-400 mt-4">
                  {metric.change}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}