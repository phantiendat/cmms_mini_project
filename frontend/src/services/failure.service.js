import api from './api';

const getAll = () => {
  return api.get('/failures');
};

const get = (id) => {
  return api.get(`/failures/${id}`);
};

const getByAsset = (assetId) => {
  return api.get(`/failures/asset/${assetId}`);
};

const create = (data) => {
  return api.post('/failures', data);
};

const update = (id, data) => {
  return api.put(`/failures/${id}`, data);
};

const remove = (id) => {
  return api.delete(`/failures/${id}`);
};

const FailureService = {
  getAll,
  get,
  getByAsset,
  create,
  update,
  remove
};

export default FailureService;
