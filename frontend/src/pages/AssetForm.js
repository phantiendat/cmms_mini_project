import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import AssetService from '../services/asset.service';

// Component form thêm mới/chỉnh sửa tài sản
const AssetForm = () => {
  // Lấy tham số từ URL (nếu có)
  const { id } = useParams();
  // Hook điều hướng
  const navigate = useNavigate();
  
  // State để xác định form đang ở chế độ chỉnh sửa hay thêm mới
  const isEditMode = !!id;
  
  // State lưu trữ dữ liệu form
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    location: '',
    system: '',
    specifications: {},
    custom_fields: {}
  });
  
  // State lưu trữ chuỗi JSON của technicalSpecs
  const [technicalSpecs, setTechnicalSpecs] = useState('');
  
  // State theo dõi trạng thái loading
  const [loading, setLoading] = useState(false);
  // State lưu trữ thông báo lỗi
  const [error, setError] = useState('');
  // State lưu trữ thông báo thành công
  const [success, setSuccess] = useState('');
  // State theo dõi trạng thái loading khi tải dữ liệu
  const [fetchLoading, setFetchLoading] = useState(false);

  // useEffect để tải dữ liệu tài sản khi ở chế độ chỉnh sửa
  useEffect(() => {
    if (isEditMode) {
      const fetchAsset = async () => {
        try {
          setFetchLoading(true);
          // Gọi service để lấy thông tin tài sản theo id
          const response = await AssetService.get(id);
          // Cập nhật state với dữ liệu nhận được
          setFormData(response.data);
          // Chuyển đổi specifications thành chuỗi JSON nếu có
          if (response.data.specifications) {
            setTechnicalSpecs(JSON.stringify(response.data.specifications, null, 2));
          }
        } catch (err) {
          setError('Failed to fetch asset details. ' + (err.response?.data?.message || err.message));
        } finally {
          setFetchLoading(false);
        }
      };

      fetchAsset();
    }
  }, [id, isEditMode]);

  // Hàm xử lý khi giá trị form thay đổi
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
        specifications: technicalSpecs ? JSON.parse(technicalSpecs) : {}
      };

      if (isEditMode) {
        // Gọi service để cập nhật tài sản
        await AssetService.update(id, submitData);
        setSuccess('Asset updated successfully');
      } else {
        // Gọi service để tạo mới tài sản
        await AssetService.create(submitData);
        setSuccess('Asset created successfully');
        // Reset form sau khi tạo mới thành công
        setFormData({
          code: '',
          name: '',
          location: '',
          system: '',
          specifications: {},
          custom_fields: {}
        });
        setTechnicalSpecs('');
      }
      
      // Chuyển hướng về trang danh sách tài sản sau 2 giây
      setTimeout(() => {
        navigate('/assets');
      }, 2000);
    } catch (err) {
      setError('Failed to save asset. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi nhấn nút Cancel
  const handleCancel = () => {
    navigate('/assets');
  };

  // Hiển thị spinner khi đang tải dữ liệu trong chế độ chỉnh sửa
  if (isEditMode && fetchLoading) {
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
          <h2>{isEditMode ? 'Edit Asset' : 'Add New Asset'}</h2>
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
                  <Form.Label>Asset Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    placeholder="Enter asset code"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Asset Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter asset name"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>System</Form.Label>
                  <Form.Control
                    type="text"
                    name="system"
                    value={formData.system}
                    onChange={handleChange}
                    placeholder="Enter system"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Technical Specifications (JSON format)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder={`Example: {"temperature": "30°C", "pressure": "10 bar"}`}
                    value={technicalSpecs}
                    onChange={(e) => setTechnicalSpecs(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Enter technical specifications in JSON format.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={handleCancel} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Saving...</span>
                  </>
                ) : (
                  isEditMode ? 'Update Asset' : 'Create Asset'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AssetForm;
