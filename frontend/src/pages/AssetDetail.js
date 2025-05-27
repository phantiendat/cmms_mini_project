import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Form, ListGroup, Modal } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaFile, FaTrash, FaUpload, FaDownload } from 'react-icons/fa';
import AssetService from '../services/asset.service';
import ActionService from '../services/action.service';
import FailureService from '../services/failure.service';
import DocumentService from '../services/document.service';
import { formatDate } from '../utils/dateFormat';

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [asset, setAsset] = useState(null);
  const [actions, setActions] = useState([]);
  const [failures, setFailures] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State cho modal upload tài liệu
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('manual');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Tải dữ liệu tài sản
  useEffect(() => {
    const fetchAssetData = async () => {
      try {
        setLoading(true);
        
        // Tải thông tin tài sản
        const assetResponse = await AssetService.get(id);
        setAsset(assetResponse.data);
        
        // Tải danh sách tác động
        const actionsResponse = await ActionService.getByAsset(id);
        setActions(actionsResponse.data);
        
        // Tải danh sách hư hỏng
        const failuresResponse = await FailureService.getByAsset(id);
        setFailures(failuresResponse.data);
        
        // Tải danh sách tài liệu
        const documentsResponse = await DocumentService.getByAsset(id);
        setDocuments(documentsResponse.data);
        
        setError('');
      } catch (err) {
        setError('Failed to fetch asset data. ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssetData();
  }, [id]);
  
  // Xử lý xóa tài sản
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await AssetService.remove(id);
        navigate('/assets');
        alert('Asset deleted successfully');
      } catch (err) {
        setError('Failed to delete asset. ' + (err.response?.data?.message || err.message));
      }
    }
  };
  
  // Xử lý upload tài liệu
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setUploadError('Please select a file');
      return;
    }
    
    try {
      setUploadLoading(true);
      setUploadError('');
      
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('asset_id', id);
      formData.append('name', documentName || selectedFile.name);
      formData.append('type', documentType);
      
      const response = await DocumentService.uploadDocument(formData);
      
      // Thêm tài liệu mới vào danh sách
      setDocuments([...documents, response.data.document]);
      
      // Reset form
      setDocumentName('');
      setDocumentType('manual');
      setSelectedFile(null);
      setShowUploadModal(false);
      
      alert('Document uploaded successfully');
    } catch (err) {
      setUploadError('Failed to upload document. ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadLoading(false);
    }
  };
  
  // Xử lý xóa tài liệu
  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await DocumentService.remove(documentId);
        
        // Cập nhật danh sách tài liệu
        setDocuments(documents.filter(doc => doc.id !== documentId));
        
        alert('Document deleted successfully');
      } catch (err) {
        setError('Failed to delete document. ' + (err.response?.data?.message || err.message));
      }
    }
  };
  
  // Hàm để lấy tên loại tài liệu
  const getDocumentTypeName = (type) => {
    const types = {
      'manual': 'Manual',
      'datasheet': 'Datasheet',
      'certificate': 'Certificate',
      'drawing': 'Drawing',
      'other': 'Other'
    };
    return types[type] || 'Other';
  };
  
  // Hàm để lấy icon dựa trên đuôi file
  const getFileIcon = (filePath) => {
    const ext = filePath.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext)) {
      return <FaFile className="text-primary" />;
    } else if (['pdf'].includes(ext)) {
      return <FaFile className="text-danger" />;
    } else if (['doc', 'docx'].includes(ext)) {
      return <FaFile className="text-primary" />;
    } else if (['xls', 'xlsx'].includes(ext)) {
      return <FaFile className="text-success" />;
    } else {
      return <FaFile className="text-secondary" />;
    }
  };

  return (
    <Container className="mt-4">
      {/* Hiển thị thông báo lỗi nếu có */}
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Hiển thị spinner khi đang tải dữ liệu */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        asset && (
          <>
            <Row className="mb-3">
              <Col>
                <h2>Asset Details</h2>
              </Col>
              <Col className="text-end">
                <Link to="/assets" className="btn btn-secondary me-2">
                  Back to List
                </Link>
                <Link to={`/assets/edit/${id}`} className="btn btn-warning me-2">
                  Edit
                </Link>
                <Button variant="danger" onClick={handleDelete}>
                  Delete
                </Button>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Header>Asset Information</Card.Header>
                  <Card.Body>
                    <Table>
                      <tbody>
                        <tr>
                          <th>Code</th>
                          <td>{asset.code}</td>
                        </tr>
                        <tr>
                          <th>Name</th>
                          <td>{asset.name}</td>
                        </tr>
                        <tr>
                          <th>Technical Specifications</th>
                          <td>
                            {asset.technical_specs ? (
                              <pre className="mb-0">{JSON.stringify(asset.technical_specs, null, 2)}</pre>
                            ) : (
                              <span className="text-muted">Not specified</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>Location</th>
                          <td>{asset.location}</td>
                        </tr>
                        <tr>
                          <th>System</th>
                          <td>{asset.system}</td>
                        </tr>
                        <tr>
                          <th>Type</th>
                          <td>{asset.type}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
                
                <Card className="mb-4">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span>Documents</span>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => setShowUploadModal(true)}
                    >
                      <FaUpload className="me-1" /> Upload
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    {documents.length === 0 ? (
                      <p className="text-muted">No documents available</p>
                    ) : (
                      <ListGroup>
                        {documents.map(doc => (
                          <ListGroup.Item 
                            key={doc.id}
                            className="d-flex justify-content-between align-items-center"
                          >
                            <div>
                              {getFileIcon(doc.file_path)} <span className="ms-2">{doc.name}</span>
                              <Badge bg="secondary" className="ms-2">{getDocumentTypeName(doc.type)}</Badge>
                            </div>
                            <div>
                              <a 
                                href={`http://localhost:8080${doc.file_path}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary me-2"
                              >
                                <FaDownload />
                              </a>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={( ) => handleDeleteDocument(doc.id)}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span>Maintenance Actions</span>
                    <Link to={`/actions/add?asset_id=${id}`}>
                      <Button variant="primary" size="sm">Add Action</Button>
                    </Link>
                  </Card.Header>
                  <Card.Body>
                    {actions.length === 0 ? (
                      <p className="text-muted">No maintenance actions recorded</p>
                    ) : (
                      <Table responsive striped hover>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {actions.map(action => (
                            <tr key={action.id}>
                              <td>{formatDate(action.performed_at)}</td>
                              <td>{action.type}</td>
                              <td>{action.description}</td>
                              <td>
                                <Link to={`/actions/${action.id}`}>
                                  <Button variant="info" size="sm">View</Button>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
                
                <Card className="mb-4">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span>Failures</span>
                    <Link to={`/failures/add?asset_id=${id}`}>
                      <Button variant="primary" size="sm">Add Failure</Button>
                    </Link>
                  </Card.Header>
                  <Card.Body>
                    {failures.length === 0 ? (
                      <p className="text-muted">No failures recorded</p>
                    ) : (
                      <Table responsive striped hover>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Severity</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {failures.map(failure => (
                            <tr key={failure.id}>
                              <td>{formatDate(failure.detected_at)}</td>
                              <td>{failure.type}</td>
                              <td>
                                <Badge bg={
                                  failure.severity === 'low' ? 'success' :
                                  failure.severity === 'medium' ? 'warning' :
                                  failure.severity === 'high' ? 'danger' : 'dark'
                                }>
                                  {failure.severity}
                                </Badge>
                              </td>
                              <td>
                                <Badge bg={failure.resolved_at ? 'success' : 'warning'}>
                                  {failure.resolved_at ? 'Resolved' : 'Unresolved'}
                                </Badge>
                              </td>
                              <td>
                                <Link to={`/failures/${failure.id}`}>
                                  <Button variant="info" size="sm">View</Button>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            {/* Modal Upload Tài liệu */}
            <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Upload Document</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {uploadError && <Alert variant="danger">{uploadError}</Alert>}
                
                <Form onSubmit={handleUploadDocument}>
                  <Form.Group className="mb-3">
                    <Form.Label>Document Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter document name"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                      If left blank, the original filename will be used.
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Document Type</Form.Label>
                    <Form.Select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                    >
                      <option value="manual">Manual</option>
                      <option value="datasheet">Datasheet</option>
                      <option value="certificate">Certificate</option>
                      <option value="drawing">Drawing</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>File</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    <Form.Text className="text-muted">
                      Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT. Max size: 10MB.
                    </Form.Text>
                  </Form.Group>
                  
                  <div className="d-flex justify-content-end">
                    <Button 
                      variant="secondary" 
                      className="me-2"
                      onClick={() => setShowUploadModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={uploadLoading}
                    >
                      {uploadLoading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                          <span className="ms-2">Uploading...</span>
                        </>
                      ) : (
                        'Upload'
                      )}
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal>
          </>
        )
      )}
    </Container>
  );
};

export default AssetDetail;
