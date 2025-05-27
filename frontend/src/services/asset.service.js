import api from './api';

class AssetService {
  getAll() {
    return api.get('/assets');
  }

  getAllWithCounts(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return api.get(`/assets/health?${params.toString()}`);
  }

  get(id) {
    return api.get(`/assets/${id}`);
  }

  create(data) {
    return api.post('/assets', data);
  }

  update(id, data) {
    return api.put(`/assets/${id}`, data);
  }

  delete(id) {
    return api.delete(`/assets/${id}`);
  }

  deleteAll() {
    return api.delete('/assets');
  }

  findByCode(code) {
    return api.get(`/assets?code=${code}`);
  }
}

export default new AssetService();
