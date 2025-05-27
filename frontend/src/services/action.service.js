import api from './api';

const getAll = () => {
  return api.get('/actions');
};

const get = (id) => {
  return api.get(`/actions/${id}`);
};

const getByAsset = (assetId) => {
  return api.get(`/actions/asset/${assetId}`);
};

const create = (data) => {
  return api.post('/actions', data);
};

const update = (id, data) => {
  return api.put(`/actions/${id}`, data);
};

const remove = (id) => {
  return api.delete(`/actions/${id}`);
};

const ActionService = {
  getAll,
  get,
  getByAsset,
  create,
  update,
  remove
};

export default ActionService;
