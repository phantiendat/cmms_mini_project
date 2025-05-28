import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Button, Badge, Spinner, Alert, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ActionService from '../services/action.service';
import AssetService from '../services/asset.service';
import { formatDateTime } from '../utils/dateFormat';
import './ActionList.css';

// Component hiển thị danh sách tác động
const ActionList = () => {
  // State để lưu trữ danh sách tác động
  const [actions, setActions] = useState([]);
  // State để lưu trữ danh sách tài sản
  const [assets, setAssets] = useState([]);
  // State để lưu trữ tác động được chọn
  const [selectedAction, setSelectedAction] = useState(null);
  // State để theo dõi trạng thái loading
  const [loading, setLoading] = useState(true);
  // State để lưu trữ thông báo lỗi (nếu có)
  const [error, setError] = useState('');
  // Thêm state cho search query
  const [searchQuery, setSearchQuery] = useState('');

  // Hàm để tải dữ liệu từ API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [actionsResponse, assetsResponse] = await Promise.all([
        ActionService.getAll(),
        AssetService.getAll()
      ]);
      
      // Sắp xếp actions theo created_at giảm dần (mới nhất lên đầu)
      const sortedActions = (actionsResponse.data.data || []).sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
      
      setActions(sortedActions);
      setAssets(assetsResponse.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch data. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Thêm useEffect để cập nhật danh sách khi component được mount
  useEffect(() => {
    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Hàm xử lý xóa tác động
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this action?')) {
      try {
        // Gọi service để xóa tác động
        await ActionService.remove(id);
        // Tải lại danh sách tác động sau khi xóa
        fetchData();
        if (selectedAction && selectedAction.id === id) {
          setSelectedAction(null);
        }
        alert('Action deleted successfully');
      } catch (err) {
        setError('Failed to delete action. ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Hàm để hiển thị badge màu khác nhau cho từng loại tác động
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <Badge bg="success">Completed</Badge>;
      case 'In Progress':
        return <Badge bg="info">In Progress</Badge>;
      case 'On Hold':
      case 'Planned':
        return <Badge bg="secondary">{status}</Badge>;
      case 'Cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="light">{status}</Badge>;
    }
  };

  // Thêm hàm để lấy thông tin tài sản
  const getAssetInfo = (assetId) => {
    return assets.find(asset => asset.id === assetId) || { code: 'N/A', name: 'Unknown' };
  };

  // Thêm hàm để hiển thị badge màu cho severity
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

  return (
    <Container fluid className="mt-4 vh-100 d-flex flex-column action-list-container">
      <Row className="mb-3">
        <Col>
          <h2>Maintenance Actions</h2>
        </Col>
        <Col className="text-end">
          <Link to="/actions/add">
            <Button variant="primary">Add New Action</Button>
          </Link>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="loading-container">
          <Spinner animation="border" />
          <p>Loading actions...</p>
        </div>
      ) : (
        <Row className="flex-grow-1" style={{ overflow: 'hidden' }}>
          {/* Left Pane - Action List */}
          <Col md={4} className="d-flex flex-column pe-0 action-list-left" style={{ height: '100%' }}>
            <div className="p-2 border-bottom">
              <Form.Control
                type="search"
                placeholder="Search actions (type, status, asset code...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <Card className="flex-grow-1 border-top-0" style={{ overflowY: 'auto' }}>
              <ListGroup variant="flush">
                {(() => {
                  const lowerCaseQuery = searchQuery.toLowerCase();
                  const filteredActions = actions.filter(action => {
                    const asset = getAssetInfo(action.asset_id);
                    return (
                      (action.type && action.type.toLowerCase().includes(lowerCaseQuery)) ||
                      (action.status && action.status.toLowerCase().includes(lowerCaseQuery)) ||
                      (action.description && action.description.toLowerCase().includes(lowerCaseQuery)) ||
                      (asset.code && asset.code.toLowerCase().includes(lowerCaseQuery)) ||
                      (asset.name && asset.name.toLowerCase().includes(lowerCaseQuery)) ||
                      (action.performed_by && action.performed_by.toLowerCase().includes(lowerCaseQuery))
                    );
                  });

                  if (filteredActions.length === 0) {
                    return <ListGroup.Item className="text-center">No matching actions found</ListGroup.Item>;
                  }

                  return filteredActions.map((action) => (
                    <ListGroup.Item
                      key={action.id}
                      action
                      active={selectedAction?.id === action.id}
                      onClick={() => setSelectedAction(action)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="d-flex justify-content-between align-items-center gap-2 mb-1">
                            <div style={{ minWidth: '230px' }}>
                              {getStatusBadge(action.status)}
                              <span className="ms-1">{getSeverityBadge(action.severity)}</span>
                            </div>
                            <small className="text-muted">{formatDateTime(action.created_at)}</small>
                          </div>
                          <h6>{action.Asset ? action.Asset.code : `Asset ID: ${action.asset_id}`}</h6>
                          <small className="d-block text-muted mt-1">Type: {action.type || 'N/A'}</small>
                          <small className="d-block text-truncate text-muted" style={{ maxWidth: '350px' }}>
                            {action.description || 'No description'}
                          </small>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ));
                })()}
              </ListGroup>
            </Card>
          </Col>

          {/* Right Pane - Action Details */}
          <Col md={8} className="d-flex flex-column ps-2" style={{ height: '100%' }}>
            <Card className="flex-grow-1 action-detail-card" style={{ overflowY: 'auto' }}>
              <Card.Body>
                {selectedAction ? (
                  <div>
                    <div className="mb-3 d-flex gap-3 align-items-center">
                      <div>
                        <strong>Status:</strong> {getStatusBadge(selectedAction.status)}
                      </div>
                      <div>
                        <strong>Severity:</strong> {getSeverityBadge(selectedAction.severity)}
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-start mb-3 detail-section">
                      <div>
                        <h5 className="mb-0">
                          {selectedAction.Asset ? (
                            <Link to={`/assets/${selectedAction.asset_id}`} className="asset-link">
                              {`${selectedAction.Asset.code} - ${selectedAction.Asset.name}`}
                            </Link>
                          ) : (
                            `Asset ID: ${selectedAction.asset_id}`
                          )}
                        </h5>
                      </div>
                      <div className="action-buttons">
                        <Link to={`/actions/edit/${selectedAction.id}`}>
                          <Button variant="outline-primary" size="sm" className="me-2">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(selectedAction.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <Row className="detail-section">
                      <Col md={6}>
                        <div className="mb-3">
                          <h6>Type</h6>
                          <p>{selectedAction.type || 'N/A'}</p>
                        </div>
                        <div className="mb-3">
                          <h6>Performed By</h6>
                          <p>{selectedAction.performed_by || 'N/A'}</p>
                        </div>
                        <div className="mb-3">
                          <h6>Created By</h6>
                          <p>{selectedAction.created_by || 'N/A'}</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <h6>Performed At</h6>
                          <p>{formatDateTime(selectedAction.performed_at)}</p>
                        </div>
                        <div className="mb-3">
                          <h6>Created At</h6>
                          <p>{formatDateTime(selectedAction.created_at)}</p>
                        </div>
                        <div className="mb-3">
                          <h6>Updated At</h6>
                          <p>{formatDateTime(selectedAction.updated_at)}</p>
                        </div>
                      </Col>
                    </Row>

                    <div className="mb-3 detail-section">
                      <h6>Description</h6>
                      <p className="description-text">{selectedAction.description || 'No description provided'}</p>
                    </div>

                    {selectedAction.custom_fields && Object.keys(selectedAction.custom_fields).length > 0 && (
                      <div className="mb-3 custom-fields">
                        <h6>Custom Fields</h6>
                        <pre>{JSON.stringify(selectedAction.custom_fields, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state">
                    <h5>Select an action to view details</h5>
                    <p>Choose an action from the list on the left to see its full details here.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ActionList;
