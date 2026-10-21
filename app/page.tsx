'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  'https://dqoplrolsocpengnxocp.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb3Bscm9sc29jcGVuZ254b2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1OTIxMDAsImV4cCI6MjEwODE2ODEwMH0.QMfvTDuX-6GIjC9f-tBfLsWoWCa8Xh55Zxv4sWfpCDE'
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  'sb_publishable_hM6bsuQL3cr588yjkQV2mg_8HWENeFa'
const supabaseKey =
  /^(?:eyJ|sb_publishable_)/.test(supabaseAnonKey)
    ? supabaseAnonKey
    : supabasePublishableKey
const hasSupabaseConfig = Boolean(
  /^https?:\/\//i.test(supabaseUrl) &&
    /^(?:eyJ|sb_publishable_)/.test(supabaseKey) &&
    !/^(?:\*+|your[_ -].*|replace.*|placeholder.*|<.*>)$/i.test(
      supabaseKey,
    ),
)
const supabaseConfigMessage =
  'Supabase is not configured. Add the project URL and matching anon or publishable key to your deployment environment, then redeploy.'
const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseKey)
  : null

interface Metric {
  id: string
  title: string
  value: string
  change: string
  created_at: string
}

type PageId =
  | 'overview'
  | 'metrics'
  | 'activity'
  | 'reports'
  | 'integrations'
  | 'settings'

type IconName =
  | 'overview'
  | 'metrics'
  | 'activity'
  | 'reports'
  | 'integrations'
  | 'settings'
  | 'search'
  | 'calendar'
  | 'download'
  | 'plus'
  | 'arrow'
  | 'close'
  | 'check'
  | 'database'
  | 'clock'
  | 'refresh'
  | 'trash'
  | 'chevron'
  | 'sparkles'
  | 'server'
  | 'filter'
  | 'external'

const icons: Record<IconName, string> = {
  overview:
    'M3 3h8v8H3z M13 3h8v5h-8z M13 10h8v11h-8z M3 13h8v8H3z',
  metrics:
    'M3 3v18h18 M8 15l4-4 4 3 5-7 M17 7h4v4',
  activity:
    'M2 12h4l3-9 5 18 3-9h5',
  reports:
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h8 M8 9h2',
  integrations:
    'M10 13a5 5 0 0 0 7.54.54l3-3A5 5 0 0 0 13.46 3L11.75 4.7 M14 11a5 5 0 0 0-7.54-.54l-3 3A5 5 0 0 0 10.54 21l1.7-1.7',
  settings:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 2.94-.08-.02a1.7 1.7 0 0 0-1.7.5l-.06.06h-3.4l-.03-.08a1.7 1.7 0 0 0-1.43-1.08h-.08L9.6 16.3l.02-.08a1.7 1.7 0 0 0-.5-1.7l-.06-.06v-3.4l.08-.03a1.7 1.7 0 0 0 1.08-1.43v-.08l2.94-1.7.08.02a1.7 1.7 0 0 0 1.7-.5l.06-.06h3.4l.03.08a1.7 1.7 0 0 0 1.43 1.08h.08l1.7 2.94-.02.08a1.7 1.7 0 0 0 .5 1.7l.06.06v3.4l-.08.03',
  search: 'm21 21-4.34-4.34 M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0z',
  calendar:
    'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  plus: 'M12 5v14 M5 12h14',
  arrow: 'M7 17 17 7 M7 7h10v10',
  close: 'M18 6 6 18 M6 6l12 12',
  check: 'm5 12 4 4L19 6',
  database:
    'M12 3c4.97 0 9 1.34 9 3s-4.03 3-9 3-9-1.34-9-3 4.03-3 9-3z M3 6v6c0 1.66 4.03 3 9 3s9-1.34 9-3V6 M3 12v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6',
  clock: 'M12 8v4l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  refresh:
    'M20 7v5h-5 M4 17v-5h5 M5.64 9A7 7 0 0 1 17.3 6.7L20 12 M4 12l2.7 5.3A7 7 0 0 0 18.36 15',
  trash:
    'M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6 M10 11v5 M14 11v5',
  chevron: 'm9 18 6-6-6-6',
  sparkles:
    'm12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z M19 14l1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14z',
  server:
    'M4 4h16v6H4z M4 14h16v6H4z M8 7h.01 M8 17h.01 M12 7h4 M12 17h4',
  filter: 'M4 7h16 M7 12h10 M10 17h4',
  external: 'M14 3h7v7 M10 14 21 3 M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
}

const navigation: { id: PageId; label: string; icon: IconName }[] = [
  { id: 'overview', label: 'Overview', icon: 'overview' },
  { id: 'metrics', label: 'Metric library', icon: 'metrics' },
  { id: 'activity', label: 'Live activity', icon: 'activity' },
  { id: 'reports', label: 'Reports & exports', icon: 'reports' },
]

const pageDetails: Record<PageId, { title: string; description: string }> = {
  overview: {
    title: 'Your analytics, at a glance',
    description: 'A live view of the signals your team is tracking.',
  },
  metrics: {
    title: 'Metric library',
    description: 'Every signal in one place, connected directly to your database.',
  },
  activity: {
    title: 'Live activity',
    description: 'A clear, chronological view of your latest metric updates.',
  },
  reports: {
    title: 'Reports & exports',
    description: 'Take your metric records with you whenever you need them.',
  },
  integrations: {
    title: 'Your integrations',
    description: 'Keep an eye on the services powering your analytics.',
  },
  settings: {
    title: 'Workspace settings',
    description: 'Review the configuration for your Pulse Analytics workspace.',
  },
}

function Icon({
  name,
  size = 18,
  className = '',
}: {
  name: IconName
  size?: number
  className?: string
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icons[name]} />
    </svg>
  )
}

function formatDate(value: string, includeTime = false) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    ...(includeTime ? { timeStyle: 'short' as const } : {}),
  }).format(date)
}

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

export default function PulseAnalyticsPro() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState<PageId>('overview')
  const [dateRange, setDateRange] = useState('30')
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null)
  const [title, setTitle] = useState('')
  const [value, setValue] = useState('')
  const [change, setChange] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >(hasSupabaseConfig ? 'connecting' : 'disconnected')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Pulse Analytics | Analytics Studio'
  }, [])

  const fetchMetrics = useCallback(async () => {
    if (!supabase) {
      setErrorMessage(supabaseConfigMessage)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('pulse_metrics')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        const invalidApiKey = /invalid api key|unauthorized/i.test(error.message)
        if (invalidApiKey) setConnectionStatus('disconnected')
        setErrorMessage(
          invalidApiKey
            ? 'Supabase rejected the API key. Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY belong to the same project, then redeploy.'
            : `Couldn't load metrics: ${error.message}`,
        )
        return
      }

      setErrorMessage(null)
      setMetrics(data ?? [])
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `Couldn't connect to the database: ${error.message}`
          : 'An unexpected error stopped metrics from loading.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void fetchMetrics()
    }, 0)

    if (!supabase) {
      return () => window.clearTimeout(initialLoad)
    }

    const channel = supabase
      .channel('realtime_pulse_metrics')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pulse_metrics' },
        () => {
          void fetchMetrics()
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnectionStatus('disconnected')
          void supabase.removeChannel(channel)
          return
        }

        setConnectionStatus(
          status === 'SUBSCRIBED'
            ? 'connected'
            : status === 'CLOSED'
              ? 'disconnected'
              : 'connecting',
        )
      })

    return () => {
      window.clearTimeout(initialLoad)
      void supabase.removeChannel(channel)
    }
  }, [fetchMetrics])

  const filteredMetrics = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - Number(dateRange))
    const query = searchQuery.trim().toLowerCase()

    return metrics.filter((metric) => {
      const inRange =
        dateRange === 'all' ||
        (Number.isFinite(new Date(metric.created_at).getTime()) &&
          new Date(metric.created_at) >= cutoff)
      const matchesSearch =
        !query ||
        metric.title.toLowerCase().includes(query) ||
        metric.value.toLowerCase().includes(query) ||
        metric.change.toLowerCase().includes(query)

      return inRange && matchesSearch
    })
  }, [dateRange, metrics, searchQuery])

  const recentCount = useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return metrics.filter(
      (metric) => new Date(metric.created_at).getTime() >= weekAgo.getTime(),
    ).length
  }, [metrics])

  const activityBuckets = useMemo(() => {
    const days = dateRange === 'all' ? 30 : Number(dateRange)
    const now = new Date()
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    return Array.from({ length: 7 }, (_, index) => {
      const bucketStart = new Date(
        start.getTime() + (days * index * 24 * 60 * 60 * 1000) / 7,
      )
      const bucketEnd = new Date(
        start.getTime() + (days * (index + 1) * 24 * 60 * 60 * 1000) / 7,
      )

      return {
        label: new Intl.DateTimeFormat('en', {
          month: 'short',
          day: 'numeric',
        }).format(bucketStart),
        count: filteredMetrics.filter((metric) => {
          const createdAt = new Date(metric.created_at).getTime()
          return (
            createdAt >= bucketStart.getTime() &&
            (index === 6
              ? createdAt <= now.getTime()
              : createdAt < bucketEnd.getTime())
          )
        }).length,
      }
    })
  }, [dateRange, filteredMetrics])

  const chartMax = Math.max(1, ...activityBuckets.map((bucket) => bucket.count))
  const chartPoints = activityBuckets
    .map((bucket, index) => {
      const x = 8 + index * 97
      const y = 132 - (bucket.count / chartMax) * 108
      return `${x},${y}`
    })
    .join(' ')
  const chartArea = `${chartPoints} 590,142 8,142`
  const page = pageDetails[activePage]

  async function handleAddMetric(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) {
      setErrorMessage(supabaseConfigMessage)
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const { error } = await supabase
        .from('pulse_metrics')
        .insert([{ title: title.trim(), value: value.trim(), change: change.trim() }])

      if (error) {
        const invalidApiKey = /invalid api key|unauthorized/i.test(error.message)
        if (invalidApiKey) setConnectionStatus('disconnected')
        setErrorMessage(
          invalidApiKey
            ? 'Supabase rejected the API key. Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY belong to the same project, then redeploy.'
            : `Couldn't save your metric: ${error.message}`,
        )
        return
      }

      setTitle('')
      setValue('')
      setChange('')
      setIsModalOpen(false)
      setToastMessage('Your new metric has been added.')
      await fetchMetrics()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `Couldn't save your metric: ${error.message}`
          : 'An unexpected error stopped your metric from being saved.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(metric: Metric) {
    if (!supabase) {
      setErrorMessage(supabaseConfigMessage)
      return
    }

    setDeletingId(metric.id)
    setErrorMessage(null)

    try {
      const { error } = await supabase
        .from('pulse_metrics')
        .delete()
        .eq('id', metric.id)

      if (error) {
        const invalidApiKey = /invalid api key|unauthorized/i.test(error.message)
        if (invalidApiKey) setConnectionStatus('disconnected')
        setErrorMessage(
          invalidApiKey
            ? 'Supabase rejected the API key. Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY belong to the same project, then redeploy.'
            : `Couldn't delete this metric: ${error.message}`,
        )
        return
      }

      setSelectedMetric(null)
      setToastMessage('The metric has been removed.')
      await fetchMetrics()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `Couldn't delete this metric: ${error.message}`
          : 'An unexpected error stopped this metric from being deleted.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  function downloadCsv() {
    const rows = [
      ['Title', 'Value', 'Change / status', 'Created at'],
      ...filteredMetrics.map((metric) => [
        metric.title,
        metric.value,
        metric.change,
        metric.created_at,
      ]),
    ]
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `pulse-metrics-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setToastMessage(
      `Exported ${filteredMetrics.length} metric${filteredMetrics.length === 1 ? '' : 's'}.`,
    )
  }

  const statusLabel =
    connectionStatus === 'connected'
      ? 'Live connection'
      : connectionStatus === 'connecting'
        ? 'Connecting'
        : 'Connection unavailable'

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 selection:bg-violet-500/30">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        <aside className="hidden w-[252px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0c0e14] px-5 py-6 lg:flex">
          <button
            onClick={() => setActivePage('overview')}
            className="mb-10 flex items-center gap-3 px-2 text-left"
            aria-label="Go to overview"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-950/40">
              <Icon name="activity" size={21} />
            </span>
            <span>
              <span className="block text-[15px] font-semibold tracking-tight text-white">
                pulse<span className="text-violet-400">.</span>
              </span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                analytics studio
              </span>
            </span>
          </button>

          <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-600">
            Workspace
          </div>
          <nav className="space-y-1" aria-label="Main navigation">
            {navigation.map((item) => {
              const active = activePage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${
                    active
                      ? 'bg-violet-500/[0.12] text-violet-300 ring-1 ring-inset ring-violet-400/[0.14]'
                      : 'text-slate-500 hover:bg-white/[0.035] hover:text-slate-200'
                  }`}
                >
                  <Icon
                    name={item.icon}
                    size={17}
                    className={active ? 'text-violet-400' : 'text-slate-600 group-hover:text-slate-400'}
                  />
                  {item.label}
                  {item.id === 'activity' && connectionStatus === 'connected' && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                  )}
                </button>
              )
            })}
          </nav>

          <div className="mb-3 mt-9 px-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-600">
            Manage
          </div>
          <nav className="space-y-1" aria-label="Workspace navigation">
            {(
              [
                { id: 'integrations', label: 'Integrations', icon: 'integrations' },
                { id: 'settings', label: 'Settings', icon: 'settings' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                aria-current={activePage === item.id ? 'page' : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${
                  activePage === item.id
                    ? 'bg-violet-500/[0.12] text-violet-300 ring-1 ring-inset ring-violet-400/[0.14]'
                    : 'text-slate-500 hover:bg-white/[0.035] hover:text-slate-200'
                }`}
              >
                <Icon name={item.icon} size={17} className="text-slate-600 group-hover:text-slate-400" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/[0.07] bg-[#11131b] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Database status</span>
              <span
                className={`h-2 w-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.7)]'
                    : connectionStatus === 'connecting'
                      ? 'animate-pulse bg-amber-400'
                      : 'bg-rose-400'
                }`}
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Icon name="database" size={15} className="text-violet-400" />
              Supabase PostgreSQL
            </div>
            <div className="mt-2 text-[10px] text-slate-600">{statusLabel}</div>
          </div>

          <div className="mt-5 flex items-center gap-3 border-t border-white/[0.06] px-1 pt-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-xs font-semibold text-violet-200">
              PA
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-slate-300">Pulse workspace</div>
              <div className="mt-0.5 text-[10px] text-slate-600">Analytics team</div>
            </div>
            <Icon name="chevron" size={15} className="ml-auto rotate-90 text-slate-600" />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#090b10]/90 backdrop-blur-xl">
            <div className="flex min-h-[70px] items-center justify-between gap-4 px-5 sm:px-8 xl:px-10">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white lg:hidden">
                  <Icon name="activity" size={18} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <span className="hidden sm:inline">Workspace</span>
                    <Icon name="chevron" size={12} className="hidden sm:inline" />
                    <span className="truncate text-slate-400">{page.title}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <label className="relative hidden sm:block">
                  <span className="sr-only">Search metrics</span>
                  <Icon
                    name="search"
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search metrics..."
                    className="h-9 w-40 rounded-xl border border-white/[0.07] bg-white/[0.025] pl-9 pr-3 text-xs text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-violet-400/40 focus:bg-white/[0.04] lg:w-52"
                  />
                </label>
                <label className="relative">
                  <span className="sr-only">Filter by date range</span>
                  <Icon
                    name="calendar"
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <select
                    value={dateRange}
                    onChange={(event) => setDateRange(event.target.value)}
                    className="h-9 appearance-none rounded-xl border border-white/[0.07] bg-[#11131a] pl-9 pr-8 text-xs text-slate-300 outline-none focus:border-violet-400/40"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="all">All time</option>
                  </select>
                  <Icon
                    name="chevron"
                    size={13}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-600"
                  />
                </label>
                <button
                  onClick={() => {
                    setLoading(true)
                    void fetchMetrics()
                  }}
                  aria-label="Refresh metrics"
                  title="Refresh metrics"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-400 transition hover:border-white/[0.14] hover:text-white"
                >
                  <Icon name="refresh" size={16} className={loading ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex h-9 items-center gap-2 rounded-xl bg-violet-500 px-3.5 text-xs font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-400 sm:px-4"
                >
                  <Icon name="plus" size={16} />
                  <span className="hidden sm:inline">New metric</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>
            <div className="flex gap-1 overflow-x-auto border-t border-white/[0.04] px-5 py-2 lg:hidden">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                    activePage === item.id
                      ? 'bg-violet-500/[0.13] text-violet-300'
                      : 'text-slate-500 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon name={item.icon} size={14} />
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => setActivePage('settings')}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                  activePage === 'settings'
                    ? 'bg-violet-500/[0.13] text-violet-300'
                    : 'text-slate-500 hover:bg-white/[0.04]'
                }`}
              >
                <Icon name="settings" size={14} />
                Settings
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1380px] px-5 py-8 sm:px-8 sm:py-10 xl:px-10">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
                  <Icon name="sparkles" size={13} />
                  Pulse analytics
                </div>
                <h1 className="text-[26px] font-semibold tracking-[-0.035em] text-white sm:text-[32px]">
                  {page.title}
                </h1>
                <p className="mt-1.5 text-[13px] text-slate-500">{page.description}</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    connectionStatus === 'connected'
                      ? 'bg-emerald-400'
                      : connectionStatus === 'connecting'
                        ? 'animate-pulse bg-amber-400'
                        : 'bg-rose-400'
                  }`}
                />
                {statusLabel}
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] px-4 py-3 text-sm text-rose-200"
              >
                <span className="mt-0.5 font-bold">!</span>
                <span className="flex-1">{errorMessage}</span>
                <button
                  onClick={() => setErrorMessage(null)}
                  aria-label="Dismiss error"
                  className="text-rose-300/70 hover:text-rose-100"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            )}

            {activePage === 'overview' && (
              <div className="space-y-5">
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      label: 'Tracked metrics',
                      value: loading ? '—' : filteredMetrics.length.toLocaleString(),
                      note: 'In selected date range',
                      icon: 'metrics' as const,
                      tint: 'violet',
                    },
                    {
                      label: 'Unique signals',
                      value: loading
                        ? '—'
                        : new Set(filteredMetrics.map((metric) => metric.title)).size.toLocaleString(),
                      note: 'Distinct metric titles',
                      icon: 'sparkles' as const,
                      tint: 'blue',
                    },
                    {
                      label: 'Added this week',
                      value: loading ? '—' : recentCount.toLocaleString(),
                      note: 'Across all time ranges',
                      icon: 'activity' as const,
                      tint: 'green',
                    },
                    {
                      label: 'Latest update',
                      value: loading
                        ? '—'
                        : filteredMetrics[0]
                          ? formatDate(filteredMetrics[0].created_at)
                          : 'No updates',
                      note: filteredMetrics[0]?.title ?? 'Add a metric to get started',
                      icon: 'clock' as const,
                      tint: 'amber',
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/[0.07] bg-[#101219] p-5 transition hover:border-white/[0.12]"
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                            stat.tint === 'violet'
                              ? 'bg-violet-500/[0.12] text-violet-300'
                              : stat.tint === 'blue'
                                ? 'bg-blue-500/[0.12] text-blue-300'
                                : stat.tint === 'green'
                                  ? 'bg-emerald-500/[0.12] text-emerald-300'
                                  : 'bg-amber-500/[0.12] text-amber-300'
                          }`}
                        >
                          <Icon name={stat.icon} size={16} />
                        </span>
                      </div>
                      <div className="truncate text-[25px] font-semibold tracking-tight text-white">
                        {stat.value}
                      </div>
                      <div className="mt-1.5 truncate text-[10px] text-slate-600">{stat.note}</div>
                    </div>
                  ))}
                </section>

                <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(290px,0.85fr)]">
                  <div className="rounded-2xl border border-white/[0.07] bg-[#101219] p-5 sm:p-6">
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-semibold text-slate-100">Metric activity</h2>
                        <p className="mt-1 text-[11px] text-slate-600">
                          Records created during the selected period
                        </p>
                      </div>
                      <span className="flex items-center gap-1.5 rounded-full border border-white/[0.07] px-2.5 py-1 text-[10px] text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                        Metric records
                      </span>
                    </div>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-8 pt-1">
                        {[0, 1, 2, 3].map((line) => (
                          <div key={line} className="border-t border-dashed border-white/[0.055]" />
                        ))}
                      </div>
                      <svg
                        role="img"
                        aria-label="Metric records created over the selected period"
                        viewBox="0 0 600 160"
                        preserveAspectRatio="none"
                        className="relative h-[190px] w-full overflow-visible"
                      >
                        <defs>
                          <linearGradient id="activity-fill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <polygon points={chartArea} fill="url(#activity-fill)" />
                        <polyline
                          points={chartPoints}
                          fill="none"
                          stroke="#a78bfa"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          vectorEffect="non-scaling-stroke"
                        />
                        {activityBuckets.map((bucket, index) => (
                          <circle
                            key={`${bucket.label}-${index}`}
                            cx={8 + index * 97}
                            cy={132 - (bucket.count / chartMax) * 108}
                            r="3.5"
                            fill="#c4b5fd"
                            stroke="#101219"
                            strokeWidth="2"
                          >
                            <title>{`${bucket.label}: ${bucket.count} metric records`}</title>
                          </circle>
                        ))}
                      </svg>
                      <div className="relative mt-1 flex justify-between text-[9px] text-slate-600">
                        {activityBuckets.map((bucket, index) => (
                          <span key={`${bucket.label}-${index}`}>{bucket.label}</span>
                        ))}
                      </div>
                      {!loading && filteredMetrics.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-600">
                          Your activity will appear here
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-[#101219] p-5 sm:p-6">
                    <div className="mb-5 flex items-start justify-between">
                      <div>
                        <h2 className="text-sm font-semibold text-slate-100">Recent metrics</h2>
                        <p className="mt-1 text-[11px] text-slate-600">The latest database records</p>
                      </div>
                      <button
                        onClick={() => setActivePage('metrics')}
                        className="text-[10px] font-medium text-violet-300 transition hover:text-violet-200"
                      >
                        View all
                      </button>
                    </div>
                    {loading ? (
                      <div className="space-y-4">
                        {[0, 1, 2, 3].map((item) => (
                          <div key={item} className="flex animate-pulse items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-white/[0.05]" />
                            <div className="flex-1 space-y-2">
                              <div className="h-2.5 w-2/3 rounded bg-white/[0.05]" />
                              <div className="h-2 w-1/3 rounded bg-white/[0.035]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredMetrics.length ? (
                      <div className="space-y-1">
                        {filteredMetrics.slice(0, 5).map((metric, index) => (
                          <button
                            key={metric.id}
                            onClick={() => setSelectedMetric(metric)}
                            className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-white/[0.035]"
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-semibold ${
                                index % 3 === 0
                                  ? 'bg-violet-500/[0.12] text-violet-300'
                                  : index % 3 === 1
                                    ? 'bg-blue-500/[0.12] text-blue-300'
                                    : 'bg-emerald-500/[0.12] text-emerald-300'
                              }`}
                            >
                              {metric.title.trim().charAt(0).toUpperCase() || 'M'}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-medium text-slate-200">
                                {metric.title}
                              </span>
                              <span className="mt-1 block truncate text-[10px] text-slate-600">
                                {formatDate(metric.created_at, true)}
                              </span>
                            </span>
                            <span className="max-w-20 truncate text-xs font-semibold text-slate-300">
                              {metric.value}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title="Nothing to show yet"
                        description="Add a metric and your latest records will show up here."
                        action={() => setIsModalOpen(true)}
                        actionLabel="Add a metric"
                      />
                    )}
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101219]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4 sm:px-6">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-100">Your metric library</h2>
                      <p className="mt-1 text-[11px] text-slate-600">
                        {filteredMetrics.length} record{filteredMetrics.length === 1 ? '' : 's'} in this view
                      </p>
                    </div>
                    <button
                      onClick={() => setActivePage('activity')}
                      className="flex items-center gap-1 text-[11px] font-medium text-violet-300 hover:text-violet-200"
                    >
                      Browse activity <Icon name="arrow" size={13} />
                    </button>
                  </div>
                  <MetricTable
                    metrics={filteredMetrics.slice(0, 6)}
                    loading={loading}
                    onSelect={setSelectedMetric}
                    onAdd={() => setIsModalOpen(true)}
                  />
                </section>
              </div>
            )}

            {activePage === 'metrics' && (
              <section className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-400/[0.13] bg-gradient-to-r from-violet-500/[0.08] via-[#11131b] to-[#11131b] px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/[0.13] text-violet-300">
                      <Icon name="database" size={18} />
                    </span>
                    <div>
                      <div className="text-sm font-medium text-slate-200">
                        {filteredMetrics.length} metric{filteredMetrics.length === 1 ? '' : 's'} in your library
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        Live data from the <span className="font-mono text-slate-400">pulse_metrics</span> table
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={downloadCsv}
                    className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.025] px-3 text-xs font-medium text-slate-300 transition hover:bg-white/[0.06]"
                  >
                    <Icon name="download" size={15} />
                    Export CSV
                  </button>
                </div>
                {loading ? (
                  <LoadingCards />
                ) : filteredMetrics.length ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredMetrics.map((metric, index) => (
                      <button
                        key={metric.id}
                        onClick={() => setSelectedMetric(metric)}
                        className="group rounded-2xl border border-white/[0.07] bg-[#101219] p-5 text-left transition hover:-translate-y-0.5 hover:border-violet-400/20 hover:bg-[#12141d]"
                      >
                        <div className="mb-6 flex items-start justify-between gap-3">
                          <span
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              index % 3 === 0
                                ? 'bg-violet-500/[0.12] text-violet-300'
                                : index % 3 === 1
                                  ? 'bg-blue-500/[0.12] text-blue-300'
                                  : 'bg-emerald-500/[0.12] text-emerald-300'
                            }`}
                          >
                            <Icon name="metrics" size={18} />
                          </span>
                          <span className="rounded-full border border-white/[0.07] px-2.5 py-1 text-[9px] text-slate-500">
                            {formatDate(metric.created_at)}
                          </span>
                        </div>
                        <div className="truncate text-xs font-medium text-slate-400">{metric.title}</div>
                        <div className="mt-2 truncate text-[28px] font-semibold tracking-tight text-white">
                          {metric.value}
                        </div>
                        <div className="mt-5 flex items-center justify-between border-t border-white/[0.055] pt-4">
                          <span className="max-w-[75%] truncate text-[10px] text-slate-500">
                            {metric.change}
                          </span>
                          <Icon
                            name="arrow"
                            size={14}
                            className="text-slate-600 transition group-hover:text-violet-300"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Your library is ready for its first metric"
                    description="Create a metric to start building a live, searchable library of your database signals."
                    action={() => setIsModalOpen(true)}
                    actionLabel="Create your first metric"
                  />
                )}
              </section>
            )}

            {activePage === 'activity' && (
              <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101219]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/[0.1] text-emerald-300">
                      <Icon name="activity" size={17} />
                      {connectionStatus === 'connected' && (
                        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      )}
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-100">Database activity</h2>
                      <p className="mt-1 text-[11px] text-slate-600">
                        {statusLabel} · {filteredMetrics.length} matching records
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setLoading(true)
                      void fetchMetrics()
                    }}
                    className="flex h-8 items-center gap-2 rounded-lg border border-white/[0.08] px-3 text-[11px] text-slate-400 transition hover:text-white"
                  >
                    <Icon name="refresh" size={14} /> Refresh
                  </button>
                </div>
                <MetricTable
                  metrics={filteredMetrics}
                  loading={loading}
                  onSelect={setSelectedMetric}
                  onAdd={() => setIsModalOpen(true)}
                />
              </section>
            )}

            {activePage === 'reports' && (
              <section className="space-y-5">
                <div className="rounded-2xl border border-white/[0.07] bg-[#101219] p-6 sm:p-8">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/[0.13] text-violet-300">
                    <Icon name="reports" size={20} />
                  </span>
                  <h2 className="mt-5 text-lg font-semibold text-white">Your data, ready to go.</h2>
                  <p className="mt-2 max-w-xl text-[13px] leading-6 text-slate-500">
                    Export the metric records in your current date range as a clean CSV. The download includes each metric&apos;s title, value, status, and creation time.
                  </p>
                  <button
                    onClick={downloadCsv}
                    disabled={loading}
                    className="mt-5 flex h-10 items-center gap-2 rounded-xl bg-violet-500 px-4 text-xs font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Icon name="download" size={16} />
                    Download {filteredMetrics.length} record{filteredMetrics.length === 1 ? '' : 's'}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { label: 'Records ready', value: loading ? '—' : filteredMetrics.length.toLocaleString(), icon: 'reports' as const },
                    { label: 'Unique metric names', value: loading ? '—' : new Set(filteredMetrics.map((metric) => metric.title)).size.toLocaleString(), icon: 'metrics' as const },
                    { label: 'Most recent record', value: loading ? '—' : filteredMetrics[0] ? formatDate(filteredMetrics[0].created_at) : '—', icon: 'clock' as const },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/[0.07] bg-[#101219] p-5">
                      <Icon name={item.icon} size={17} className="text-slate-500" />
                      <div className="mt-5 text-xl font-semibold text-white">{item.value}</div>
                      <div className="mt-1 text-[11px] text-slate-600">{item.label}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-white/[0.07] bg-[#101219]">
                  <div className="border-b border-white/[0.06] px-5 py-4">
                    <h2 className="text-sm font-semibold text-slate-100">Export preview</h2>
                    <p className="mt-1 text-[11px] text-slate-600">The first few rows included in your download</p>
                  </div>
                  <MetricTable
                    metrics={filteredMetrics.slice(0, 5)}
                    loading={loading}
                    onSelect={setSelectedMetric}
                    onAdd={() => setIsModalOpen(true)}
                  />
                </div>
              </section>
            )}

            {activePage === 'integrations' && (
              <section className="space-y-5">
                <div className="rounded-2xl border border-white/[0.07] bg-[#101219] p-5 sm:p-6">
                  <div className="mb-6">
                    <h2 className="text-sm font-semibold text-slate-100">Connected services</h2>
                    <p className="mt-1 text-[11px] text-slate-600">
                      The services currently configured for this workspace.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/[0.1] text-emerald-300">
                      <Icon name="database" size={20} />
                    </span>
                    <div className="min-w-[160px] flex-1">
                      <div className="text-sm font-medium text-slate-200">Supabase</div>
                      <div className="mt-1 text-[11px] text-slate-600">
                        PostgreSQL database · pulse_metrics
                      </div>
                    </div>
                    <span
                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] ${
                        connectionStatus === 'connected'
                          ? 'border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300'
                          : connectionStatus === 'connecting'
                            ? 'border-amber-400/15 bg-amber-400/[0.06] text-amber-300'
                            : 'border-rose-400/15 bg-rose-400/[0.06] text-rose-300'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {statusLabel}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.07] bg-[#101219] p-5">
                    <Icon name="activity" size={18} className="text-violet-300" />
                    <h3 className="mt-4 text-xs font-semibold text-slate-200">Realtime updates</h3>
                    <p className="mt-1.5 text-[11px] leading-5 text-slate-600">
                      Changes to <span className="font-mono text-slate-400">pulse_metrics</span> are reflected in the dashboard as they happen.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/[0.07] bg-[#101219] p-5">
                    <Icon name="server" size={18} className="text-blue-300" />
                    <h3 className="mt-4 text-xs font-semibold text-slate-200">Database records</h3>
                    <p className="mt-1.5 text-[11px] leading-5 text-slate-600">
                      <span className="font-mono text-slate-400">{metrics.length}</span> metric record{metrics.length === 1 ? '' : 's'} currently available in this workspace.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {activePage === 'settings' && (
              <section className="max-w-3xl space-y-5">
                <div className="rounded-2xl border border-white/[0.07] bg-[#101219]">
                  <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
                    <h2 className="text-sm font-semibold text-slate-100">Database configuration</h2>
                    <p className="mt-1 text-[11px] text-slate-600">
                      Connection details used by this analytics workspace.
                    </p>
                  </div>
                  <div className="space-y-5 p-5 sm:p-6">
                    <div>
                      <div className="mb-2 text-[11px] font-medium text-slate-400">Supabase project URL</div>
                      <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0b0d12] px-3.5 py-3">
                        <Icon name="database" size={15} className="shrink-0 text-violet-400" />
                        <span className="min-w-0 break-all font-mono text-[11px] text-slate-400">
                          {supabaseUrl || 'Not configured'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-[11px] font-medium text-slate-400">Metrics table</div>
                      <div className="rounded-xl border border-white/[0.06] bg-[#0b0d12] px-3.5 py-3 font-mono text-[11px] text-slate-400">
                        public.pulse_metrics
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-[11px] font-medium text-slate-400">Realtime status</div>
                      <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0b0d12] px-3.5 py-3 text-[11px] text-slate-400">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            connectionStatus === 'connected'
                              ? 'bg-emerald-400'
                              : connectionStatus === 'connecting'
                                ? 'animate-pulse bg-amber-400'
                                : 'bg-rose-400'
                          }`}
                        />
                        {statusLabel}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-amber-400/[0.12] bg-amber-400/[0.035] p-4 text-[11px] leading-5 text-slate-500">
                  Database credentials can be supplied using <span className="font-mono text-amber-200/80">NEXT_PUBLIC_SUPABASE_URL</span> and either the <span className="font-mono text-amber-200/80">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> or <span className="font-mono text-amber-200/80">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</span>. Keep privileged service keys on the server and never expose them in client code.
                </div>
              </section>
            )}
          </div>

          <footer className="mx-auto flex max-w-[1380px] flex-wrap items-center justify-between gap-2 border-t border-white/[0.05] px-5 py-5 text-[10px] text-slate-700 sm:px-8 xl:px-10">
            <span>Pulse Analytics · Your data, in focus.</span>
            <span className="flex items-center gap-1.5">
              <Icon name="database" size={12} />
              Powered by Supabase
            </span>
          </footer>
        </main>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) setIsModalOpen(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="metric-modal-title"
            className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#11131b] p-6 shadow-2xl shadow-black/50"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300">
                  Metric library
                </div>
                <h2 id="metric-modal-title" className="text-lg font-semibold text-white">
                  Add a new metric
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Save a new signal to your live database.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                aria-label="Close dialog"
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
              >
                <Icon name="close" size={17} />
              </button>
            </div>
            <form onSubmit={handleAddMetric} className="space-y-4">
              <label className="block">
                <span className="text-[11px] font-medium text-slate-400">Metric title</span>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Server CPU load"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={100}
                  required
                  className="mt-1.5 h-11 w-full rounded-xl border border-white/[0.08] bg-[#0b0d12] px-3.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-violet-400/50"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium text-slate-400">Current value</span>
                <input
                  type="text"
                  placeholder="e.g. 74.2%"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  maxLength={100}
                  required
                  className="mt-1.5 h-11 w-full rounded-xl border border-white/[0.08] bg-[#0b0d12] px-3.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-violet-400/50"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium text-slate-400">Change or status</span>
                <input
                  type="text"
                  placeholder="e.g. +2.4% from last week"
                  value={change}
                  onChange={(event) => setChange(event.target.value)}
                  maxLength={200}
                  required
                  className="mt-1.5 h-11 w-full rounded-xl border border-white/[0.08] bg-[#0b0d12] px-3.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-violet-400/50"
                />
              </label>
              <button
                type="submit"
                disabled={submitting || !title.trim() || !value.trim() || !change.trim()}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-500 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Icon name="refresh" size={16} className="animate-spin" />
                    Saving metric...
                  </>
                ) : (
                  <>
                    <Icon name="plus" size={16} />
                    Save metric
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-slate-600">
                Your metric will appear across the workspace right away.
              </p>
            </form>
          </div>
        </div>
      )}

      {selectedMetric && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deletingId) setSelectedMetric(null)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="metric-detail-title"
            className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#11131b] p-6 shadow-2xl shadow-black/50"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300">
                  Metric details
                </div>
                <h2 id="metric-detail-title" className="text-lg font-semibold text-white">
                  {selectedMetric.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedMetric(null)}
                disabled={Boolean(deletingId)}
                aria-label="Close metric details"
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
              >
                <Icon name="close" size={17} />
              </button>
            </div>
            <div className="space-y-4 rounded-xl border border-white/[0.06] bg-[#0b0d12] p-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Value</div>
                <div className="mt-1 break-words text-2xl font-semibold text-violet-300">
                  {selectedMetric.value}
                </div>
              </div>
              <div className="border-t border-white/[0.06] pt-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Change / status</div>
                <div className="mt-1 break-words text-sm text-slate-300">{selectedMetric.change}</div>
              </div>
              <div className="border-t border-white/[0.06] pt-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Created</div>
                <div className="mt-1 text-xs text-slate-400">{formatDate(selectedMetric.created_at, true)}</div>
              </div>
              <div className="border-t border-white/[0.06] pt-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Record ID</div>
                <div className="mt-1 break-all font-mono text-[10px] text-slate-500">
                  {selectedMetric.id}
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => void handleDelete(selectedMetric)}
                disabled={deletingId === selectedMetric.id}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-rose-400/15 bg-rose-400/[0.06] text-xs font-medium text-rose-300 transition hover:bg-rose-400/[0.12] disabled:opacity-50"
              >
                <Icon name="trash" size={15} />
                {deletingId === selectedMetric.id ? 'Deleting...' : 'Delete metric'}
              </button>
              <button
                onClick={() => setSelectedMetric(null)}
                disabled={Boolean(deletingId)}
                className="h-10 flex-1 rounded-xl border border-white/[0.08] text-xs font-medium text-slate-300 transition hover:bg-white/[0.04] disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] flex max-w-[calc(100vw-2.5rem)] items-center gap-2.5 rounded-xl border border-emerald-400/15 bg-[#111b18] px-4 py-3 text-xs font-medium text-emerald-200 shadow-xl shadow-black/30"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
            <Icon name="check" size={13} />
          </span>
          {toastMessage}
          <button
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="ml-2 text-emerald-200/50 hover:text-emerald-100"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

function MetricTable({
  metrics,
  loading,
  onSelect,
  onAdd,
}: {
  metrics: Metric[]
  loading: boolean
  onSelect: (metric: Metric) => void
  onAdd: () => void
}) {
  if (loading) {
    return (
      <div className="space-y-4 p-5">
        {[0, 1, 2].map((item) => (
          <div key={item} className="flex animate-pulse gap-4">
            <div className="h-3 w-1/4 rounded bg-white/[0.05]" />
            <div className="h-3 w-1/5 rounded bg-white/[0.04]" />
            <div className="h-3 flex-1 rounded bg-white/[0.035]" />
          </div>
        ))}
      </div>
    )
  }

  if (!metrics.length) {
    return (
      <EmptyState
        title="No metrics found"
        description="Try a different search or date range, or add a new metric to get started."
        action={onAdd}
        actionLabel="Add a metric"
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-left">
        <thead>
          <tr className="border-b border-white/[0.05] text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-600">
            <th className="px-5 py-3 font-medium sm:px-6">Metric</th>
            <th className="px-4 py-3 font-medium">Value</th>
            <th className="px-4 py-3 font-medium">Change / status</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-5 py-3 sm:px-6"><span className="sr-only">View details</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {metrics.map((metric, index) => (
            <tr
              key={metric.id}
              onClick={() => onSelect(metric)}
              className="group cursor-pointer transition hover:bg-white/[0.025]"
            >
              <td className="px-5 py-3.5 sm:px-6">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold ${
                      index % 3 === 0
                        ? 'bg-violet-500/[0.11] text-violet-300'
                        : index % 3 === 1
                          ? 'bg-blue-500/[0.11] text-blue-300'
                          : 'bg-emerald-500/[0.11] text-emerald-300'
                    }`}
                  >
                    {metric.title.trim().charAt(0).toUpperCase() || 'M'}
                  </span>
                  <span className="max-w-48 truncate text-xs font-medium text-slate-200">
                    {metric.title}
                  </span>
                </div>
              </td>
              <td className="max-w-36 truncate px-4 py-3.5 text-xs font-semibold text-slate-200">
                {metric.value}
              </td>
              <td className="max-w-44 truncate px-4 py-3.5 text-[11px] text-slate-500">
                {metric.change}
              </td>
              <td className="whitespace-nowrap px-4 py-3.5 text-[10px] text-slate-500">
                {formatDate(metric.created_at, true)}
              </td>
              <td className="px-5 py-3.5 text-right sm:px-6">
                <Icon
                  name="chevron"
                  size={14}
                  className="ml-auto text-slate-700 transition group-hover:text-violet-300"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmptyState({
  title,
  description,
  action,
  actionLabel,
}: {
  title: string
  description: string
  action: () => void
  actionLabel: string
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] text-slate-500">
        <Icon name="database" size={19} />
      </span>
      <h3 className="mt-4 text-sm font-medium text-slate-300">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[11px] leading-5 text-slate-600">{description}</p>
      <button
        onClick={action}
        className="mt-4 flex items-center gap-1.5 rounded-lg bg-violet-500/[0.11] px-3 py-2 text-[11px] font-medium text-violet-300 transition hover:bg-violet-500/[0.18]"
      >
        <Icon name="plus" size={14} />
        {actionLabel}
      </button>
    </div>
  )
}

function LoadingCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl border border-white/[0.06] bg-[#101219] p-5"
        >
          <div className="mb-6 h-10 w-10 rounded-xl bg-white/[0.05]" />
          <div className="h-2.5 w-1/2 rounded bg-white/[0.05]" />
          <div className="mt-3 h-7 w-2/3 rounded bg-white/[0.04]" />
          <div className="mt-7 h-2 w-full rounded bg-white/[0.035]" />
        </div>
      ))}
    </div>
  )
}
