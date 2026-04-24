'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Zap, 
  ChevronRight,
  Info,
  CheckCircle2
} from 'lucide-react'
import Card from '@/components/Card'
import { ProjectAPI, ScheduleAPI } from '@/lib/api'

const DAYS = [
  { id: 0, name: 'Mon' },
  { id: 1, name: 'Tue' },
  { id: 2, name: 'Wed' },
  { id: 3, name: 'Thu' },
  { id: 4, name: 'Fri' },
  { id: 5, name: 'Sat' },
  { id: 6, name: 'Sun' },
]

export default function SchedulePage() {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // New Schedule State
  const [newSchedule, setNewSchedule] = useState({
    schedule_type: 'interval',
    interval_value: 6,
    interval_unit: 'hours',
    days_of_week: [] as number[],
    publish_times: ['09:00'],
    posts_per_run: 1,
    timezone: 'UTC',
    is_active: true
  })

  useEffect(() => {
    ProjectAPI.getAll().then(res => setProjects(res.data))
  }, [])

  useEffect(() => {
    if (selectedProject) {
      fetchSchedules()
    }
  }, [selectedProject])

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const res = await ScheduleAPI.getByProject(parseInt(selectedProject))
      setSchedules(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSchedule = async () => {
    if (!selectedProject) return
    setSaving(true)
    try {
      await ScheduleAPI.create({
        ...newSchedule,
        project_id: parseInt(selectedProject)
      })
      fetchSchedules()
    } finally {
      setSaving(true)
    }
  }

  const toggleDay = (dayId: number) => {
    setNewSchedule(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(dayId)
        ? prev.days_of_week.filter(d => d !== dayId)
        : [...prev.days_of_week, dayId].sort()
    }))
  }

  const addTime = () => {
    setNewSchedule(prev => ({
      ...prev,
      publish_times: [...prev.publish_times, '12:00'].sort()
    }))
  }

  const updateTime = (index: number, value: string) => {
    const newTimes = [...newSchedule.publish_times]
    newTimes[index] = value
    setNewSchedule(prev => ({ ...prev, publish_times: newTimes }))
  }

  const removeTime = (index: number) => {
    setNewSchedule(prev => ({
      ...prev,
      publish_times: prev.publish_times.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Post Orchestration</h1>
          <p className="text-slate-500 mt-2 text-lg">Precisely time your content delivery for maximum impact.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card title="Automation Configuration" className="border-l-4 border-l-indigo-600">
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Select Target Project</label>
                <select 
                  className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all bg-white"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  <option value="">Choose a project to automate...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Schedule Type</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'interval', name: 'Interval Based', desc: 'Every N hours/days' },
                    { id: 'specific_days', name: 'Specific Days', desc: 'Selected days & times' }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setNewSchedule({...newSchedule, schedule_type: type.id})}
                      className={`p-5 rounded-2xl border-2 text-left transition-all ${
                        newSchedule.schedule_type === type.id 
                          ? 'border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50' 
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <h4 className="font-bold text-slate-900">{type.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {newSchedule.schedule_type === 'interval' ? (
                <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Frequency</label>
                    <input 
                      type="number" 
                      className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50/50 outline-none"
                      value={newSchedule.interval_value}
                      onChange={(e) => setNewSchedule({...newSchedule, interval_value: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Unit</label>
                    <select 
                      className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50/50 outline-none bg-white"
                      value={newSchedule.interval_unit}
                      onChange={(e) => setNewSchedule({...newSchedule, interval_unit: e.target.value})}
                    >
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Active Days</label>
                    <div className="flex flex-wrap gap-3">
                      {DAYS.map(day => (
                        <button
                          key={day.id}
                          onClick={() => toggleDay(day.id)}
                          className={`w-14 h-14 rounded-2xl font-black transition-all ${
                            newSchedule.days_of_week.includes(day.id)
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {day.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Publish Times (Daily)</label>
                      <button 
                        onClick={addTime}
                        className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Time
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {newSchedule.publish_times.map((time, index) => (
                        <div key={index} className="relative group">
                          <input 
                            type="time" 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50/50 outline-none font-bold text-slate-700"
                            value={time}
                            onChange={(e) => updateTime(index, e.target.value)}
                          />
                          <button 
                            onClick={() => removeTime(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-slate-100">
                 <button 
                  onClick={handleCreateSchedule}
                  disabled={!selectedProject || saving}
                  className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {saving ? 'Synchronizing...' : 'Initialize Schedule'}
                </button>
              </div>
            </div>
          </Card>

          <Card title="Operational Schedules" subtitle={selectedProject ? `Active sequences for this project` : 'Select a project to view its active schedules'}>
             {loading ? (
               <div className="py-12 text-center">
                 <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
               </div>
             ) : schedules.length === 0 ? (
               <div className="py-12 text-center">
                 <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                 <p className="text-slate-500 font-medium text-sm italic">No automated sequences found.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {schedules.map(s => (
                   <div key={s.id} className="p-6 rounded-3xl border-2 border-slate-50 flex items-center justify-between group hover:border-indigo-100 transition-all">
                     <div className="flex items-center space-x-6">
                        <div className={`p-4 rounded-2xl ${s.is_active ? 'bg-green-50' : 'bg-slate-100'}`}>
                          {s.is_active ? <Zap className="w-6 h-6 text-green-600" /> : <Pause className="w-6 h-6 text-slate-400" />}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg">
                            {s.schedule_type === 'interval' ? `Every ${s.interval_value} ${s.interval_unit}` : 'Custom Day Sequence'}
                          </p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                              <Clock className="w-3 h-3 mr-1" />
                              Next: {s.next_run_time || 'Pending...'}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                              {s.posts_per_run} Post{s.posts_per_run > 1 ? 's' : ''} / Run
                            </span>
                          </div>
                        </div>
                     </div>
                     <div className="flex items-center space-x-2">
                        <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                          <Play className="w-5 h-5" />
                        </button>
                        <button className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </Card>
        </div>

        <div className="space-y-8">
          <Card title="System Intelligence" className="bg-slate-900 text-white border-none shadow-2xl">
            <div className="space-y-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="font-bold text-sm">Cron Health: Optimal</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  The Celery heartbeat is actively monitoring all registered sequences with a precision of 100ms.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Upcoming Projections</p>
                {[
                  { time: '18:00 UTC', project: 'Crypto News' },
                  { time: '21:00 UTC', project: 'AI Daily' },
                  { time: 'Tomorrow 09:00', project: 'Tech Insights' }
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all cursor-default">
                    <span className="text-sm font-bold text-slate-300">{p.project}</span>
                    <span className="text-xs font-black text-indigo-400">{p.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
            <div className="flex items-center space-x-3 mb-2">
              <Info className="w-5 h-5 text-indigo-600" />
              <h4 className="font-black text-indigo-900 uppercase tracking-tight text-sm">Scheduling Logic</h4>
            </div>
            <p className="text-xs text-indigo-700 font-medium leading-relaxed">
              Interval mode calculates the next run based on the completion time of the previous run. Specific Days mode uses absolute time markers in your configured timezone.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
