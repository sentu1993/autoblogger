'use client'

import { useState, useEffect } from 'react'
import { FileText, ExternalLink, CheckCircle2, Clock, AlertCircle, Search, Filter } from 'lucide-react'
import Card from '@/components/Card'
import { PostAPI } from '@/lib/api'

export default function PostsPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await PostAPI.getAll()
      setPosts(res.data)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-500" />
      default: return <FileText className="w-5 h-5 text-slate-400" />
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Generated Posts</h1>
          <p className="text-slate-500 mt-1">Audit and manage all AI-generated articles.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search posts..."
              className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none w-64"
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white transition-all">
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </button>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading your posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center">
            <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No posts yet</h3>
            <p className="text-slate-500">Add a source to start generating content automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Source</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(post.status)}
                        <span className="text-sm font-semibold capitalize text-slate-700">{post.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900 max-w-md truncate">{post.generated_title || 'Generating...'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <a href={post.source_url} target="_blank" className="text-xs text-indigo-600 hover:underline flex items-center">
                        Source Link <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {post.published_url && (
                        <a 
                          href={post.published_url} 
                          target="_blank"
                          className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full hover:bg-green-100"
                        >
                          View Live <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
