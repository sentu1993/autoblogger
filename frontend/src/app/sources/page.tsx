'use client'

import { useState, useEffect } from 'react'
import { Plus, Rss, Trash2, ExternalLink, RefreshCw } from 'lucide-react'
import Card from '@/components/Card'
import { SourceAPI, ProjectAPI } from '@/lib/api'

export default function SourcesPage() {
  const [sources, setSources] = useState([])
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [newSourceUrl, setNewSourceUrl] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch projects to populate dropdown
    ProjectAPI.getAll().then(res => setProjects(res.data))
  }, [])

  useEffect(() => {
    if (selectedProject) {
      fetchSources()
    }
  }, [selectedProject])

  const fetchSources = async () => {
    const res = await SourceAPI.getByProject(parseInt(selectedProject))
    setSources(res.data)
  }

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject || !newSourceUrl) return
    
    setLoading(true)
    try {
      await SourceAPI.create({
        project_id: parseInt(selectedProject),
        type: 'rss',
        url: newSourceUrl
      })
      setNewSourceUrl('')
      fetchSources()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Content Sources</h1>
        <p className="text-slate-500 mt-1">Manage the RSS feeds and News APIs powering your automation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card title="Add New Source">
            <form onSubmit={handleAddSource} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Project</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  required
                >
                  <option value="">Choose a project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">RSS Feed URL</label>
                <div className="relative">
                  <Rss className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="url" 
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="https://techcrunch.com/feed"
                    value={newSourceUrl}
                    onChange={(e) => setNewSourceUrl(e.target.value)}
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading || !selectedProject}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Source'}
              </button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card title="Active Sources" subtitle={selectedProject ? `Sources for ${projects.find(p => p.id == selectedProject)?.name}` : 'Select a project to view sources'}>
            {!selectedProject ? (
              <div className="py-12 text-center">
                <Rss className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500">Please select a project from the left to manage sources.</p>
              </div>
            ) : sources.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-slate-500">No sources added yet. Start by adding an RSS feed.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sources.map((source) => (
                  <div key={source.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <Rss className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 truncate max-w-md">{source.url}</p>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{source.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <RefreshCw className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
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
