import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ActionService from '../services/action.service';
import AssetService from '../services/asset.service';

// Component form thêm mới/chỉnh sửa tác động
const ActionForm = () => {
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
  const [assets, setAssets] = useState([]);
  // State theo dõi trạng thái loading
  const [loading, setLoading] = useState(false);
  // State lưu trữ thông báo lỗi
  const [error, setError] = useState('');
  // State lưu trữ thông báo thành công
  const [success, setSuccess] = useState('');
  // State theo dõi trạng thái loading khi tải dữ liệu
  const [fetchLoading, setFetchLoading] = useState(false);

  // State lưu trữ custom fields dưới dạng chuỗi JSON
  const [customFields, setCustomFields] = useState('{}');

  // Thêm state cho asset code
  const [assetCode, setAssetCode] = useState('');

  // Thêm state cho asset_id, type, description, performed_by, created_by, performed_at
  const [assetId, setAssetId] = useState(assetIdFromQuery || '');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Planned');
  const [performedBy, setPerformedBy] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [performedAt, setPerformedAt] = useState(new Date().toISOString().slice(0, 16));
  const [severity, setSeverity] = useState('medium');

  // Lấy asset_id từ query params nếu có
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const assetId = params.get('asset_id');
    if (assetId) {
      setAssetId(Number(assetId));
    }
  }, [location]);

  // Trong useEffect, thêm đoạn code để lấy danh sách assets
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await AssetService.getAll();
        setAssets(response.data);
        
        // Nếu đang edit, lấy asset code
        if (id && assetId) {
          const asset = response.data.find(a => a.id === assetId);
          if (asset) {
            setAssetCode(asset.code);
          }
        }
      } catch (error) {
        console.error('Failed to fetch assets:', error);
      }
    };
    
    fetchAssets();
  }, [id, assetId]);

  // Fetch action data if editing
  useEffect(() => {
    const fetchAction = async () => {
      if (id) {
        try {
          setFetchLoading(true);
          const response = await ActionService.get(id);
          const actionData = response.data;
          
          setAssetId(actionData.asset_id);
          setType(actionData.type);
          setDescription(actionData.description);
          setStatus(actionData.status || 'Planned');
          setPerformedBy(actionData.performed_by || '');
          setCreatedBy(actionData.created_by || '');
          setPerformedAt(actionData.performed_at ? new Date(actionData.performed_at).toISOString().slice(0, 16) : '');
          setSeverity(actionData.severity || 'medium');
          setCustomFields(JSON.stringify(actionData.custom_fields || {}, null, 2));
        } catch (err) {
          setError('Failed to fetch action details. ' + (err.response?.data?.message || err.message));
        } finally {
          setFetchLoading(false);
        }
      }
    };

    fetchAction();
  }, [id]);

  // Hàm xử lý khi giá trị form thay đổi
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'asset_id') {
      setAssetId(Number(value));
    } else if (name === 'type') {
      setType(value);
    } else if (name === 'description') {
      setDescription(value);
    } else if (name === 'status') {
      setStatus(value);
    } else if (name === 'performed_by') {
      setPerformedBy(value);
    } else if (name === 'created_by') {
      setCreatedBy(value);
    } else if (name === 'performed_at') {
      setPerformedAt(value);
    } else if (name === 'custom_fields') {
      setCustomFields(value);
    } else if (name === 'severity') {
      setSeverity(value);
    }
  };

  // Hàm xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let parsedCustomFields;
      try {
        parsedCustomFields = JSON.parse(customFields);
      } catch (jsonError) {
        setError('Invalid JSON format in Custom Fields.');
        setLoading(false);
        return;
      }

      const formData = {
        asset_id: assetId,
        type,
        description,
        status,
        performed_by: performedBy,
        created_by: createdBy,
        performed_at: performedAt,
        severity,
        custom_fields: parsedCustomFields
      };

      if (id) {
        await ActionService.update(id, formData);
        setSuccess('Action updated successfully');
        // Chuyển hướng về trang danh sách ngay lập tức sau khi cập nhật thành công
        navigate('/actions');
      } else {
        await ActionService.create(formData);
        setSuccess('Action created successfully');
        // Reset form sau khi tạo mới thành công
        setAssetId(assetIdFromQuery || '');
        setType('');
        setDescription('');
        setStatus('Planned');
        setPerformedBy('');
        setCreatedBy('');
        setPerformedAt(new Date().toISOString().slice(0, 16));
        setSeverity('medium');
        setCustomFields('{}');
        
        // Chuyển hướng về trang danh sách sau 2 giây
        setTimeout(() => {
          if (assetIdFromQuery) {
            navigate(`/assets/${assetIdFromQuery}`);
          } else {
            navigate('/actions');
          }
        }, 2000);
      }
    } catch (err) {
      setError('Failed to save action. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi nhấn nút Cancel
  const handleCancel = () => {
    if (assetIdFromQuery) {
      navigate(`/assets/${assetIdFromQuery}`);
    } else {
      navigate('/actions');
    }
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
          <h2>{isEditMode ? 'Edit Action' : 'Add New Action'}</h2>
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
                    value={assetId}
                    onChange={handleChange}
                    required
                    disabled={isEditMode}
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
                  <Form.Label>Maintenance Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="repair">Repair</option>
                    <option value="replacement">Replacement</option>
                    <option value="inspection">Inspection</option>
                    <option value="calibration">Calibration</option>
                  </Form.Select>
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
                    value={description}
                    onChange={handleChange}
                    required
                    placeholder="Enter action description"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={status}
                    onChange={handleChange}
                    required
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="On Hold">On Hold</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Severity</Form.Label>
                  <Form.Select
                    name="severity"
                    value={severity}
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
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Performed By</Form.Label>
                  <Form.Control
                    type="text"
                    name="performed_by"
                    value={performedBy}
                    onChange={handleChange}
                    required
                    placeholder="Enter performer name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Performed At</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="performed_at"
                    value={performedAt}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Created By</Form.Label>
                  <Form.Control
                    type="text"
                    name="created_by"
                    value={createdBy}
                    onChange={handleChange}
                    required
                    placeholder="Enter creator name"
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
                    value={customFields}
                    onChange={handleChange}
                    placeholder={`Example: {"cost": "500 USD", "parts_replaced": ["bearing", "belt"]}`}
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
                ) : (
                  isEditMode ? 'Update Action' : 'Create Action'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ActionForm;
