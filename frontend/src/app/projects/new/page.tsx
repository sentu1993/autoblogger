'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Globe, Key, Type, Sparkles, AlertCircle, CheckCircle2, Shield } from 'lucide-react'
import Card from '@/components/Card'
import Link from 'next/link'
import { ProjectAPI } from '@/lib/api'
import axios from 'axios'

export default function NewProject() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    cms_type: 'wordpress',
    cms_url: '',
    cms_username: '',
    cms_password: '', // app password for WP, token for Webflow, secret for Custom
    cms_site_id: '', // Webflow only
    cms_collection_id: '', // Webflow only
    cms_auth_method: 'none', // Custom only
    cms_header_name: 'X-API-Key', // Custom only
    niche: '',
    keywords: '',
    tone: 'professional',
    ai_provider: 'openai',
  })

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      // We'll call a dedicated test endpoint or just the publish route with a test flag if implemented
      // For now, let's assume we have an endpoint at /projects/test-connection
      // If not, we'll just simulate success for the demo or implement it in backend
      const credentials: any = {}
      if (formData.cms_type === 'wordpress') {
        credentials.url = formData.cms_url
        credentials.username = formData.cms_username
        credentials.app_password = formData.cms_password
      } else if (formData.cms_type === 'webflow') {
        credentials.api_token = formData.cms_password
        credentials.site_id = formData.cms_site_id
        credentials.collection_id = formData.cms_collection_id
      } else {
        credentials.endpoint_url = formData.cms_url
        credentials.auth_method = formData.cms_auth_method
        credentials.auth_header_name = formData.cms_header_name
        credentials.auth_secret = formData.cms_password
      }

      // Note: This endpoint should be added to projects.py
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/projects/test-connection`, {
        cms_type: formData.cms_type,
        credentials
      })
      
      setTestResult(res.data)
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.response?.data?.detail || 'Connection test failed. Check your credentials.'
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const cms_credentials: any = {}
      if (formData.cms_type === 'wordpress') {
        cms_credentials.url = formData.cms_url
        cms_credentials.username = formData.cms_username
        cms_credentials.app_password = formData.cms_password
      } else if (formData.cms_type === 'webflow') {
        cms_credentials.api_token = formData.cms_password
        cms_credentials.site_id = formData.cms_site_id
        cms_credentials.collection_id = formData.cms_collection_id
      } else {
        cms_credentials.endpoint_url = formData.cms_url
        cms_credentials.auth_method = formData.cms_auth_method
        cms_credentials.auth_header_name = formData.cms_header_name
        cms_credentials.auth_secret = formData.cms_password
      }

      const projectPayload = {
        name: formData.name,
        cms_type: formData.cms_type,
        cms_credentials,
        cta_template: ''
      }
      
      await ProjectAPI.create(projectPayload)
      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create project. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Configure Engine</h1>
            <p className="text-slate-500 mt-1 text-lg">Step into the future of automated content.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center animate-in fade-in zoom-in duration-300">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card 
            title="Core Identity" 
            subtitle="Define the purpose and voice of your blog"
            className="border-l-4 border-l-indigo-600"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Project Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all text-lg"
                  placeholder="e.g. Global Tech Insights"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Niche Vertical</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. Artificial Intelligence"
                    value={formData.niche}
                    onChange={(e) => setFormData({...formData, niche: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Tone Protocol</label>
                  <select 
                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all bg-white appearance-none"
                    value={formData.tone}
                    onChange={(e) => setFormData({...formData, tone: e.target.value})}
                  >
                    <option value="professional">Professional / Executive</option>
                    <option value="casual">Casual / Conversational</option>
                    <option value="witty">Witty / Engaging</option>
                    <option value="authoritative">Scientific / Authoritative</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Target Keywords</label>
                <textarea 
                  className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all min-h-[120px]"
                  placeholder="Enter keywords separated by commas..."
                  value={formData.keywords}
                  onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                />
              </div>
            </div>
          </Card>

          <Card 
            title="Distribution Channel" 
            subtitle="Connect your target CMS for automated delivery"
            className="border-l-4 border-l-green-500"
          >
            <div className="space-y-8">
              <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
                {['wordpress', 'webflow', 'custom'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setFormData({...formData, cms_type: type});
                      setTestResult(null);
                    }}
                    className={`px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                      formData.cms_type === type 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {formData.cms_type === 'wordpress' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">WP REST API URL</label>
                      <input 
                        type="url" 
                        required
                        className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all"
                        placeholder="https://yourblog.com"
                        value={formData.cms_url}
                        onChange={(e) => setFormData({...formData, cms_url: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">WP Username</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all"
                          value={formData.cms_username}
                          onChange={(e) => setFormData({...formData, cms_username: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">App Password</label>
                        <input 
                          type="password" 
                          required
                          className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all"
                          value={formData.cms_password}
                          onChange={(e) => setFormData({...formData, cms_password: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.cms_type === 'webflow' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">API Token</label>
                      <input 
                        type="password" 
                        required
                        className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all"
                        placeholder="Webflow V2 Token"
                        value={formData.cms_password}
                        onChange={(e) => setFormData({...formData, cms_password: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Site ID</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all"
                          placeholder="e.g. 64b..."
                          value={formData.cms_site_id}
                          onChange={(e) => setFormData({...formData, cms_site_id: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Collection ID</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all"
                          placeholder="e.g. 64b..."
                          value={formData.cms_collection_id}
                          onChange={(e) => setFormData({...formData, cms_collection_id: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.cms_type === 'custom' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Webhook Endpoint</label>
                      <input 
                        type="url" 
                        required
                        className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all"
                        placeholder="https://yourapi.com/webhook"
                        value={formData.cms_url}
                        onChange={(e) => setFormData({...formData, cms_url: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Auth Method</label>
                        <select 
                          className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all bg-white"
                          value={formData.cms_auth_method}
                          onChange={(e) => setFormData({...formData, cms_auth_method: e.target.value})}
                        >
                          <option value="none">None</option>
                          <option value="api_key">API Key Header</option>
                          <option value="bearer">Bearer Token</option>
                          <option value="hmac">HMAC Signature</option>
                        </select>
                      </div>
                      {formData.cms_auth_method !== 'none' && (
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                            {formData.cms_auth_method === 'hmac' ? 'HMAC Secret' : 'Secret / Key'}
                          </label>
                          <input 
                            type="password" 
                            required
                            className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all"
                            value={formData.cms_password}
                            onChange={(e) => setFormData({...formData, cms_password: e.target.value})}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-6 py-3 border-2 border-slate-200 rounded-xl text-sm font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center"
                >
                  {testing ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Globe className="w-4 h-4 mr-2" />
                  )}
                  Test Connection
                </button>

                {testResult && (
                  <div className={`flex items-center text-sm font-bold ${testResult.success ? 'text-green-600' : 'text-red-600'} animate-in slide-in-from-right-4`}>
                    {testResult.success ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                    {testResult.message}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card title="Intelligence Tier" className="border-t-4 border-t-amber-500">
            <div className="space-y-4">
              {[
                { id: 'openai', name: 'GPT-4 Turbo', desc: 'Superior reasoning & creativity' },
                { id: 'gemini', name: 'Gemini Pro', desc: 'High-speed multimodality' }
              ].map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => setFormData({...formData, ai_provider: provider.id})}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                    formData.ai_provider === provider.id 
                      ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50' 
                      : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-black uppercase tracking-widest text-sm ${formData.ai_provider === provider.id ? 'text-indigo-700' : 'text-slate-400'}`}>
                      {provider.id}
                    </span>
                    {formData.ai_provider === provider.id && <Sparkles className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <h4 className={`font-bold ${formData.ai_provider === provider.id ? 'text-indigo-900' : 'text-slate-600'}`}>{provider.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{provider.desc}</p>
                </button>
              ))}
            </div>
          </Card>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-indigo-600 text-white font-black text-lg uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50 active:translate-y-0 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Initialize Engine'
            )}
          </button>
          
          <div className="p-4 bg-slate-50 rounded-2xl flex items-center text-xs text-slate-500 font-medium">
            <Shield className="w-4 h-4 mr-2 text-indigo-500" />
            Your credentials are encrypted using AES-256 before storage.
          </div>
        </div>
      </form>
    </div>
  )
}
