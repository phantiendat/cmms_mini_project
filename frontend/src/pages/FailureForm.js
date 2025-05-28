import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FailureService from '../services/failure.service';
import AssetService from '../services/asset.service';

// Component form thêm mới/chỉnh sửa hư hỏng
const FailureForm = () => {
  // Lấy tham số từ URL (nếu có)
  const { id } = useParams();
  // Hook điều hướng
  const navigate = useNavigate();
  // Hook để lấy query parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const assetIdFromQuery = queryParams.get('assetId');
  
  // State để xác định form đang ở chế độ chỉnh sửa hay thêm mới
  const isEditMode = !!id;
  
  // State lưu trữ dữ liệu form
  const [formData, setFormData] = useState({
    asset_id: assetIdFromQuery || '',
    type: '',
    description: '',
    severity: 'medium', // Giá trị mặc định
    status: 'Open',
    detected_at: new Date().toISOString().slice(0, 16), // Ngày hiện tại
    resolved_at: '',
    resolved_by: '',
    reported_by: '',
    custom_fields: {}
  });
  
  // State mới cho chi tiết giải quyết (textarea)
  const [resolutionDetails, setResolutionDetails] = useState('');
  
  // State lưu trữ danh sách tài sản để hiển thị trong dropdown
  const [assets, setAssets] = useState([]);
  // State theo dõi trạng thái loading
  const [loading, setLoading] = useState(false);
  // State lưu trữ thông báo lỗi
  const [error, setError] = useState('');
  // State lưu trữ thông báo thành công
  const [success, setSuccess] = useState('');
  // State theo dõi trạng thái loading khi tải dữ liệu
  const [fetchLoading, setFetchLoading] = useState(false);
  // State lưu trữ custom_fields dưới dạng chuỗi JSON
  const [customFields, setCustomFields] = useState('{}');
  // State lưu trữ dữ liệu hư hỏng
  const [failureData, setFailureData] = useState(null);
  // State lưu trữ mã tài sản
  const [assetCode, setAssetCode] = useState('');

  // Load danh sách assets
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await AssetService.getAll();
        setAssets(response.data.data || []);
        
        // Nếu đang edit, lấy asset code
        if (id && assetIdFromQuery) {
          const asset = (response.data.data || []).find(a => a.id === assetIdFromQuery);
          if (asset) {
            setAssetCode(asset.code);
            setFormData(prev => ({ ...prev, asset_id: asset.id }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch assets:', error);
        setError('Failed to fetch assets. ' + (error.response?.data?.message || error.message));
      }
    };
    
    fetchAssets();
  }, [id, assetIdFromQuery]);

  // useEffect để tải dữ liệu hư hỏng (nếu ở chế độ chỉnh sửa)
  useEffect(() => {
    if (isEditMode && id) {
      const fetchFailure = async () => {
        try {
          setFetchLoading(true);
          setError('');
          const failureResponse = await FailureService.get(id);
          const fetchedFailureData = failureResponse.data.data;
          setFailureData(fetchedFailureData);

          // Định dạng lại ngày tháng và set state
          setFormData({
            asset_id: fetchedFailureData.asset_id || '',
            type: fetchedFailureData.type || '',
            description: fetchedFailureData.description || '',
            severity: fetchedFailureData.severity || 'medium',
            status: fetchedFailureData.status || 'Open',
            detected_at: fetchedFailureData.detected_at ? new Date(fetchedFailureData.detected_at).toISOString().slice(0, 16) : '',
            resolved_at: fetchedFailureData.resolved_at ? new Date(fetchedFailureData.resolved_at).toISOString().slice(0, 16) : '',
            resolved_by: fetchedFailureData.resolved_by || '',
            reported_by: fetchedFailureData.reported_by || '',
            custom_fields: fetchedFailureData.custom_fields || {}
          });

          // Set state cho resolutionDetails
          setResolutionDetails(fetchedFailureData.resolution_details || '');

          // Xử lý custom_fields để hiển thị trong ô JSON
          setCustomFields(JSON.stringify(fetchedFailureData.custom_fields || {}, null, 2));

        } catch (err) {
          setError('Failed to fetch failure data. ' + (err.response?.data?.message || err.message));
        } finally {
          setFetchLoading(false);
        }
      };
      fetchFailure();
    } else {
      // Reset state khi ở chế độ thêm mới
      setFormData({
        asset_id: assetIdFromQuery || '',
        type: '',
        description: '',
        severity: 'medium',
        status: 'Open',
        detected_at: new Date().toISOString().slice(0, 16),
        resolved_at: '',
        resolved_by: '',
        reported_by: '',
        custom_fields: {}
      });
      setResolutionDetails('');
      setCustomFields('{}');
      setFailureData(null);
    }
  }, [id, isEditMode, assetIdFromQuery]);

  // Hàm xử lý khi giá trị form thay đổi
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Nếu là ô resolutionDetails
    if (name === 'resolution_details') {
      setResolutionDetails(value);
    } 
    // Nếu là ô customFields JSON
    else if (name === 'custom_fields') {
      setCustomFields(value);
    } 
    // Các ô khác trong formData
    else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Hàm xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const submitData = {
        ...formData,
        resolution_details: resolutionDetails
      };

      if (isEditMode) {
        await FailureService.update(id, submitData);
        setSuccess('Failure record updated successfully');
      } else {
        await FailureService.create(submitData);
        setSuccess('Failure record created successfully');
        setFormData({
          asset_id: assetIdFromQuery || '',
          type: '',
          description: '',
          severity: 'medium',
          status: 'Open',
          detected_at: new Date().toISOString().slice(0, 16),
          resolved_at: '',
          resolved_by: '',
          reported_by: '',
          custom_fields: {}
        });
        setResolutionDetails('');
      }
      
      setTimeout(() => {
        navigate('/failures');
      }, 2000);
    } catch (err) {
      setError('Failed to save failure record. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi nhấn nút Cancel
  const handleCancel = () => {
    // So sánh state hiện tại với dữ liệu gốc (nếu có)
    const isDirty = isEditMode ? 
      (JSON.stringify(formData) !== JSON.stringify({
          asset_id: failureData?.asset_id || '',
          type: failureData?.type || '',
          description: failureData?.description || '',
          severity: failureData?.severity || 'medium',
          status: failureData?.status || 'Open',
          detected_at: failureData?.detected_at ? new Date(failureData.detected_at).toISOString().slice(0, 16) : '',
          resolved_at: failureData?.resolved_at ? new Date(failureData.resolved_at).toISOString().slice(0, 16) : '',
          resolved_by: failureData?.resolved_by || '',
          reported_by: failureData?.reported_by || '',
          custom_fields: failureData?.custom_fields || {}
      }) || 
      resolutionDetails !== (failureData?.resolution_details || '') ||
      customFields !== (failureData?.custom_fields ? JSON.stringify(failureData.custom_fields, null, 2) : '{}'))
      :
      (formData.type !== '' || formData.description !== '' || resolutionDetails !== '' || customFields !== '{}');

    if (isDirty && !window.confirm('Bạn có chắc chắn muốn hủy các thay đổi và quay lại?')) {
      return;
    }
    
    navigate('/failures');
  };

  // Hiển thị spinner khi đang tải dữ liệu
  if (fetchLoading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col>
          <h2>{isEditMode ? 'Edit Failure Record' : 'Add New Failure Record'}</h2>
        </Col>
      </Row>

      {/* Hiển thị thông báo lỗi nếu có */}
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Hiển thị thông báo thành công nếu có */}
      {success && <Alert variant="success">{success}</Alert>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Asset</Form.Label>
                  <Form.Select
                    name="asset_id"
                    value={formData.asset_id}
                    onChange={handleChange}
                    required
                    disabled={isEditMode} // Không cho phép thay đổi tài sản khi chỉnh sửa
                  >
                    <option value="">Select Asset</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.code} - {asset.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Failure Type</Form.Label>
                  <Form.Control
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    placeholder="Enter failure type (e.g., mechanical, electrical)"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Severity</Form.Label>
                  <Form.Select
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Detected At</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="detected_at"
                    value={formData.detected_at}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Resolved At</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="resolved_at"
                    value={formData.resolved_at || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Resolved By</Form.Label>
                  <Form.Control
                    type="text"
                    name="resolved_by"
                    value={formData.resolved_by}
                    onChange={handleChange}
                    placeholder="Enter name of person who resolved"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Reported By</Form.Label>
                  <Form.Control
                    type="text"
                    name="reported_by"
                    value={formData.reported_by}
                    onChange={handleChange}
                    placeholder="Enter name of person who reported"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Resolution Details</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="resolution_details"
                    value={resolutionDetails}
                    onChange={handleChange}
                    placeholder="Describe the actions taken to resolve the failure..."
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Custom Fields (JSON format)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="custom_fields"
                    placeholder={`Example: {"impact": "production stopped", "estimated_cost": "5000 USD"}`}
                    value={customFields}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Enter additional information in JSON format.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={handleCancel} className="me-2" disabled={loading}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                ) : (isEditMode ? 'Update Failure Record' : 'Save Failure Record')}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FailureForm;
