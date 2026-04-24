'use client'

import { useState } from 'react'
import { Save, Shield, Cpu, Bell, Globe, Zap } from 'lucide-react'
import Card from '@/components/Card'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Control</h1>
        <p className="text-slate-500 mt-2 text-lg">Global configuration for your autoblogging empire.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card title="AI Infrastructure" subtitle="Manage global AI model settings" className="border-l-4 border-l-amber-500">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Global OpenAI Key</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-amber-50 outline-none transition-all"
                    placeholder="sk-..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Global Gemini Key</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-amber-50 outline-none transition-all"
                    placeholder="AIza..."
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm font-medium">
                <Shield className="w-4 h-4" />
                <span>Keys are encrypted using AES-256 before storage.</span>
              </div>
            </div>
          </Card>

          <Card title="Automation Protocols" subtitle="Define how the engine polls for new content" className="border-l-4 border-l-blue-500">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Global Polling Interval</label>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 outline-none bg-white">
                  <option>Every 1 hour</option>
                  <option>Every 6 hours</option>
                  <option>Every 12 hours</option>
                  <option>Once per day</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <h4 className="font-bold text-slate-900">Auto-Publish Mode</h4>
                  <p className="text-xs text-slate-500 font-medium">Immediately push to CMS after generation</p>
                </div>
                <div className="w-12 h-6 bg-indigo-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card title="System Health" className="bg-slate-900 text-white border-none shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Backend</span>
                <span className="flex items-center text-green-400 text-xs font-bold">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Worker Node</span>
                <span className="flex items-center text-green-400 text-xs font-bold">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Redis Broker</span>
                <span className="flex items-center text-green-400 text-xs font-bold">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse" />
                  Active
                </span>
              </div>
              
              <div className="pt-4 border-t border-slate-800">
                <button className="w-full py-3 bg-white text-slate-900 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-100 transition-all">
                  Restart Engine
                </button>
              </div>
            </div>
          </Card>

          <button className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center">
            <Save className="w-5 h-5 mr-2" />
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  )
}
