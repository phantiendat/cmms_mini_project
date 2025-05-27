import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import FailureService from '../services/failure.service';

// Component hiển thị chi tiết hư hỏng
const FailureDetail = () => {
  // Lấy id từ tham số URL
  const { id } = useParams();
  // Hook điều hướng
  const navigate = useNavigate();
  
  // State lưu trữ thông tin hư hỏng
  const [failure, setFailure] = useState(null);
  // State theo dõi trạng thái loading
  const [loading, setLoading] = useState(true);
  // State lưu trữ thông báo lỗi
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // useEffect để tải dữ liệu hư hỏng
  useEffect(() => {
    const fetchFailure = async () => {
      try {
        setLoading(true);
        // Gọi service để lấy thông tin hư hỏng theo id
        const response = await FailureService.get(id);
        setFailure(response.data);
      } catch (err) {
        setError('Failed to fetch failure details. ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchFailure();
  }, [id]);

  // Hàm xử lý xóa hư hỏng
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this failure record?')) {
      try {
        setLoading(true);
        // Gọi service để xóa hư hỏng
        await FailureService.delete(id);
        setSuccess('Failure record deleted successfully');
        setTimeout(() => {
          navigate('/failures');
        }, 2000);
      } catch (err) {
        setError('Failed to delete failure record. ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
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

  // Hiển thị thông báo nếu không tìm thấy hư hỏng
  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate('/failures')}>
          Back to Failures
        </Button>
      </Container>
    );
  }

  if (!failure) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Failure record not found</Alert>
        <Button variant="secondary" onClick={() => navigate('/failures')}>
          Back to Failures
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col>
          <h2>Failure Details</h2>
        </Col>
        <Col xs="auto">
          <Button variant="secondary" onClick={() => navigate('/failures')} className="me-2">
            Back to List
          </Button>
          <Button variant="primary" onClick={() => navigate(`/failures/edit/${id}`)} className="me-2">
            Edit
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Col>
      </Row>

      {success && <Alert variant="success">{success}</Alert>}

      {/* Hiển thị status và severity badge ở phía trên cùng */}
      {failure && (
        <div className="mb-3 d-flex gap-3 align-items-center">
          <div>
            <strong>Status:</strong>
            <Badge bg={
              failure.status === 'Resolved' || failure.status === 'Closed' ? 'success' :
              failure.status === 'In Progress' ? 'info' : 'warning'
            }>
              {failure.status || 'N/A'}
            </Badge>
          </div>
          {failure.severity && (
            <div>
              <strong>Severity:</strong>
              <Badge bg={
                failure.severity === 'critical' ? 'danger' :
                failure.severity === 'high' ? 'warning' :
                failure.severity === 'medium' ? 'info' : 'secondary'
              }>
                {failure.severity || 'N/A'}
              </Badge>
            </div>
          )}
        </div>
      )}

      <Card>
        <Card.Body>
          <table className="table">
            <tbody>
              <tr>
                <th style={{ width: '200px' }}>Asset</th>
                <td>{failure.asset?.name || 'N/A'}</td>
              </tr>
              <tr>
                <th>Type</th>
                <td>{failure.type || 'N/A'}</td>
              </tr>
              <tr>
                <th>Description</th>
                <td style={{ whiteSpace: 'pre-wrap' }}>{failure.description || 'N/A'}</td>
              </tr>
              <tr>
                <th>Detected At</th>
                <td>{failure.detected_at ? new Date(failure.detected_at).toLocaleString() : 'N/A'}</td>
              </tr>
              <tr>
                <th>Resolved At</th>
                <td>{failure.resolved_at ? new Date(failure.resolved_at).toLocaleString() : 'N/A'}</td>
              </tr>
              <tr>
                <th>Resolved By</th>
                <td>{failure.resolved_by || 'N/A'}</td>
              </tr>
              <tr>
                <th>Reported By</th>
                <td>{failure.reported_by || 'N/A'}</td>
              </tr>
              <tr>
                <th>Resolution Details</th>
                <td style={{ whiteSpace: 'pre-wrap' }}>{failure.resolution_details || 'N/A'}</td>
              </tr>
              {failure.custom_fields && Object.keys(failure.custom_fields).length > 0 && (
                <tr>
                  <th>Custom Fields</th>
                  <td>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(failure.custom_fields, null, 2)}
                    </pre>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FailureDetail;
