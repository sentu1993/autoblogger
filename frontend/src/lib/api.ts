import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const ProjectAPI = {
  getAll: () => api.get('/projects/'),
  getOne: (id: number) => api.get(`/projects/${id}/`),
  create: (data: any) => api.post('/projects/', data),
  update: (id: number, data: any) => api.patch(`/projects/${id}/`, data),
  delete: (id: number) => api.delete(`/projects/${id}/`),
}

export const SourceAPI = {
  getByProject: (projectId: number) => api.get(`/sources/?project_id=${projectId}`),
  create: (data: any) => api.post('/sources/', data),
}

export const PostAPI = {
  getAll: (projectId?: number) => api.get(`/posts/${projectId ? `?project_id=${projectId}` : ''}`),
}

export const ScheduleAPI = {
  getByProject: (projectId: number) => api.get(`/schedules/?project_id=${projectId}`),
  create: (data: any) => api.post('/schedules/', data),
  update: (id: number, data: any) => api.patch(`/schedules/${id}/`, data),
  delete: (id: number) => api.delete(`/schedules/${id}/`),
  trigger: (id: number) => api.post(`/schedules/${id}/trigger`),
}

export default api
