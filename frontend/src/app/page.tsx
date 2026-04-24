'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  ArrowRight,
  MoreVertical,
  Zap
} from 'lucide-react'
import Card from '@/components/Card'
import Link from 'next/link'
import { ProjectAPI, PostAPI } from '@/lib/api'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, postRes] = await Promise.all([
          ProjectAPI.getAll(),
          PostAPI.getAll()
        ])
        setProjects(projRes.data)
        setPosts(postRes.data)
      } catch (err) {
        console.error('Failed to fetch data:', err)
        // If backend is down, show empty state instead of infinite loading
        setProjects([])
        setPosts([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const stats = [
    { name: 'Total Posts', value: posts.length.toString(), icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Published', value: posts.filter(p => p.status === 'published').length.toString(), icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Pending', value: posts.filter(p => p.status === 'pending').length.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Failed', value: posts.filter(p => p.status === 'failed').length.toString(), icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  const recentPosts = posts.slice(0, 5)

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-2xl mx-4 my-8">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse rounded-full" />
            <Zap className="w-16 h-16 text-indigo-600 animate-bounce relative z-10 mx-auto" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Synchronizing Engine...</h2>
          <p className="text-slate-400 mt-2 font-medium">Accessing decentralized blog nodes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Executive Summary</h1>
          <p className="text-slate-500 mt-2 text-lg">System status: <span className="text-green-600 font-bold">Operational</span></p>
        </div>
        <Link 
          href="/projects/new"
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-1"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Project
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="flex items-center space-x-5 border-b-4 border-b-transparent hover:border-b-indigo-500 transition-all">
            <div className={`p-4 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.name}</p>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Live Feed" subtitle="Real-time article generation stream">
            {recentPosts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-slate-400 font-medium">No activity detected yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentPosts.map((post) => (
                  <div key={post.id} className="py-5 first:pt-0 last:pb-0 flex items-center justify-between group">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${post.status === 'published' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{post.generated_title || 'Analyzing Source...'}</h4>
                        <p className="text-sm text-slate-500 font-medium">{new Date(post.created_at).toLocaleTimeString()} • ID: {post.id}</p>
                      </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Link href="/posts" className="mt-8 inline-flex items-center text-sm font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
              Full Audit Log
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Card>
        </div>

        <div className="space-y-8">
          <Card title="Operational Projects">
            {projects.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-400 text-sm font-medium">No projects configured.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map(project => (
                  <div key={project.id} className="p-4 rounded-2xl border-2 border-slate-50 hover:border-indigo-100 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{project.name}</span>
                      <span className="px-2 py-1 text-[10px] font-black uppercase tracking-tighter bg-indigo-50 text-indigo-700 rounded-md">{project.cms_type}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                      <Clock className="w-3 h-3 mr-1" />
                      Active
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
