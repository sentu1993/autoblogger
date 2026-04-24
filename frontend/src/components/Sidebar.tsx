'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  PlusCircle, 
  Rss, 
  FileText, 
  Settings, 
  LogOut,
  Zap
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'New Project', href: '/projects/new', icon: PlusCircle },
  { name: 'Sources', href: '/sources', icon: Rss },
  { name: 'All Posts', href: '/posts', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-72 bg-white border-r border-slate-200/60 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
      <div className="flex items-center h-20 px-8 border-b border-slate-100">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse" />
          <Zap className="w-9 h-9 text-indigo-600 fill-indigo-600 relative z-10" />
        </div>
        <span className="ml-4 text-2xl font-black tracking-tight text-slate-900 uppercase">Autoblog</span>
      </div>
      
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-5 py-4 text-sm font-bold rounded-2xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="mb-6 p-4 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
          <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Current Tier</p>
          <p className="text-lg font-black mb-3">Enterprise Pro</p>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div className="w-3/4 bg-white h-full rounded-full" />
          </div>
        </div>
        <button className="flex items-center w-full px-5 py-3 text-sm font-bold text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 group">
          <LogOut className="w-5 h-5 mr-4 text-slate-400 group-hover:text-red-500" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
