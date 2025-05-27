import api from './api';

const uploadDocument = (formData) => {
  return api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

const getByAsset = (assetId) => {
  return api.get(`/documents/asset/${assetId}`);
};

const remove = (id) => {
  return api.delete(`/documents/${id}`);
};

const DocumentService = {
  uploadDocument,
  getByAsset,
  remove
};

export default DocumentService;
