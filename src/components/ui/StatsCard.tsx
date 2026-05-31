import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  sub?: string
  accent?: string
}

export default function StatsCard({ icon: Icon, label, value, sub, accent = '#10b981' }: StatsCardProps) {
  return (
    <div className="glass-panel p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-white/40 text-xs font-medium truncate">{label}</p>
        <p className="text-white font-bold text-xl leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-white/30 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
