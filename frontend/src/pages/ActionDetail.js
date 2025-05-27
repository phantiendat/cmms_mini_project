import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ActionService from '../services/action.service';
import { formatDateTime } from '../utils/dateFormat';

// Component hiển thị chi tiết tác động
const ActionDetail = () => {
  // Lấy id từ tham số URL
  const { id } = useParams();
  // Hook điều hướng
  const navigate = useNavigate();
  
  // State lưu trữ thông tin tác động
  const [action, setAction] = useState(null);
  // State theo dõi trạng thái loading
  const [loading, setLoading] = useState(true);
  // State lưu trữ thông báo lỗi
  const [error, setError] = useState('');

  // useEffect để tải dữ liệu tác động
  useEffect(() => {
    const fetchAction = async () => {
      try {
        setLoading(true);
        // Gọi service để lấy thông tin tác động theo id
        const response = await ActionService.get(id);
        console.log('Action data:', response.data);
        console.log('Asset data:', response.data.Asset);
        setAction(response.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch action details. ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchAction();
  }, [id]);

  // Hàm xử lý xóa tác động
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this action?')) {
      try {
        // Gọi service để xóa tác động
        await ActionService.remove(id);
        alert('Action deleted successfully');
        // Chuyển hướng về trang danh sách tác động
        navigate('/actions');
      } catch (err) {
        setError('Failed to delete action. ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Hàm để hiển thị badge màu khác nhau cho từng loại tác động
  const getTypeBadge = (type) => {
    switch (type) {
      case 'repair':
        return <Badge bg="warning">Repair</Badge>;
      case 'maintenance':
        return <Badge bg="info">Maintenance</Badge>;
      case 'replacement':
        return <Badge bg="primary">Replacement</Badge>;
      case 'inspection':
        return <Badge bg="secondary">Inspection</Badge>;
      case 'calibration':
        return <Badge bg="dark">Calibration</Badge>;
      default:
        return <Badge bg="secondary">{type}</Badge>;
    }
  };

  // Hàm để hiển thị badge màu cho severity
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'low':
        return <Badge bg="success">Low</Badge>;
      case 'medium':
        return <Badge bg="warning">Medium</Badge>;
      case 'high':
        return <Badge bg="danger">High</Badge>;
      case 'critical':
        return <Badge bg="dark">Critical</Badge>;
      default:
        return <Badge bg="secondary">{severity}</Badge>;
    }
  };

  // Hàm để hiển thị badge màu cho status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Planned':
        return <Badge bg="secondary">Planned</Badge>;
      case 'In Progress':
        return <Badge bg="info">In Progress</Badge>;
      case 'Completed':
        return <Badge bg="success">Completed</Badge>;
      case 'Cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      case 'On Hold':
        return <Badge bg="warning">On Hold</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Hiển thị spinner khi đang tải dữ liệu
  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  // Hiển thị thông báo nếu không tìm thấy tác động
  if (!action && !loading) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          Action not found or you don't have permission to view it.
        </Alert>
        <Link to="/actions">
          <Button variant="primary">Back to Actions</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Hiển thị thông báo lỗi nếu có */}
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-3">
        <Col>
          <h2>
            {action && action.Asset ? (
              <>
                Asset ID: {action.asset_id} - {action.Asset.code} ({action.Asset.name})
              </>
            ) : action ? (
              <>
                Asset ID: {action.asset_id}
              </>
            ) : ''}
          </h2>
        </Col>
        <Col className="text-end">
          <Link to="/actions" className="me-2">
            <Button variant="secondary">Back to List</Button>
          </Link>
          <Link to={`/actions/edit/${id}`} className="me-2">
            <Button variant="warning">Edit</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Col>
      </Row>

      {/* Hiển thị status và severity badge ở phía trên cùng */}
      {action && (
        <div className="mb-3 d-flex gap-3 align-items-center">
          <div>
            <strong>Status:</strong> {getStatusBadge(action.status)}
          </div>
          {action.severity && (
            <div>
              <strong>Severity:</strong> {getSeverityBadge(action.severity)}
            </div>
          )}
        </div>
      )}

      <Card className="mb-4">
        <Card.Header as="h5">Action Information</Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Table borderless>
                <tbody>
                  <tr>
                    <td><strong>Type:</strong></td>
                    <td>{action ? getTypeBadge(action.type) : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Asset:</strong></td>
                    <td>
                      {action && action.Asset ? (
                        <Link to={`/assets/${action.asset_id}`}>
                          {action.Asset.name}
                        </Link>
                      ) : action ? (
                        <Link to={`/assets/${action.asset_id}`}>
                          Asset ID: {action.asset_id}
                        </Link>
                      ) : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Performed By:</strong></td>
                    <td>{action ? action.performed_by || 'N/A' : 'N/A'}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            <Col md={6}>
              <Table borderless>
                <tbody>
                  <tr>
                    <td><strong>Date Performed:</strong></td>
                    <td>{action ? formatDateTime(action.performed_at) : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Created At:</strong></td>
                    <td>{action ? formatDateTime(action.created_at) : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Last Updated:</strong></td>
                    <td>{action ? formatDateTime(action.updated_at) : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Custom Fields:</strong></td>
                    <td>
                      {action && action.custom_fields ? (
                        <pre className="mb-0">{JSON.stringify(action.custom_fields, null, 2)}</pre>
                      ) : (
                        <span className="text-muted">Not specified</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
          
          <Row className="mt-3">
            <Col md={12}>
              <h5>Description</h5>
              <p>{action.description || 'No description provided.'}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Hiển thị trường tùy chỉnh nếu có */}
      {action.custom_fields && Object.keys(action.custom_fields).length > 0 && (
        <Card className="mb-4">
          <Card.Header as="h5">Custom Fields</Card.Header>
          <Card.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(action.custom_fields).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{typeof value === 'object' ? JSON.stringify(value) : value}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ActionDetail;
