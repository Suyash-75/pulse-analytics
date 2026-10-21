import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const revalidate = 0

export default async function PulseAnalyticsDashboard() {
  const { data: metrics, error } = await supabase.from('pulse_metrics').select('*')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-10 flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">PulseAnalytics</h1>
          <p className="text-slate-400 text-sm mt-1">Live Operational & Database Metrics</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1.5 rounded-full font-medium">
          ● System Live
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-lg mb-6 text-sm">
            Please check your .env.local file: Supabase connection failed.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {metrics && metrics.length > 0 ? (
            metrics.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.title}</p>
                <h3 className="text-2xl font-bold text-white mt-2">{item.value}</h3>
                <span className="text-xs text-emerald-400 font-medium block mt-2">{item.change}</span>
              </div>
            ))
          ) : (
            <p className="text-slate-400 col-span-4">Loading metrics from PostgreSQL database...</p>
          )}
        </div>
      </main>
    </div>
  )
}