import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Button, Badge, Spinner, Alert, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import FailureService from '../services/failure.service';
import AssetService from '../services/asset.service';
import { formatDateTime } from '../utils/dateFormat';
import './FailureList.css';

const FailureList = () => {
  const [failures, setFailures] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedFailure, setSelectedFailure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [failuresResponse, assetsResponse] = await Promise.all([
        FailureService.getAll(),
        AssetService.getAll()
      ]);
      setFailures(failuresResponse.data);
      setAssets(assetsResponse.data);
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this failure?')) {
      try {
        await FailureService.remove(id);
        fetchData();
        if (selectedFailure && selectedFailure.id === id) {
          setSelectedFailure(null);
        }
        alert('Failure deleted successfully');
      } catch (err) {
        setError('Failed to delete failure. ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge bg="danger">Open</Badge>;
      case 'in_progress':
        return <Badge bg="warning">In Progress</Badge>;
      case 'resolved':
        return <Badge bg="success">Resolved</Badge>;
      case 'closed':
        return <Badge bg="secondary">Closed</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return <Badge bg="danger">Critical</Badge>;
      case 'high':
        return <Badge bg="warning">High</Badge>;
      case 'medium':
        return <Badge bg="info">Medium</Badge>;
      case 'low':
        return <Badge bg="success">Low</Badge>;
      default:
        return <Badge bg="secondary">{severity}</Badge>;
    }
  };

  const getAssetInfo = (assetId) => {
    return assets.find(asset => asset.id === assetId) || { code: 'N/A', name: 'Unknown' };
  };

  return (
    <Container fluid className="mt-4 vh-100 d-flex flex-column failure-list-container">
      <Row className="mb-3">
        <Col>
          <h2>Failures</h2>
        </Col>
        <Col className="text-end">
          <Link to="/failures/add">
            <Button variant="primary">Add New Failure</Button>
          </Link>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="loading-container">
          <Spinner animation="border" />
          <p>Loading failures...</p>
        </div>
      ) : (
        <Row className="flex-grow-1" style={{ overflow: 'hidden' }}>
          {/* Left Pane - Failure List */}
          <Col md={4} className="d-flex flex-column pe-0 failure-list-left" style={{ height: '100%' }}>
            <div className="p-2 border-bottom">
              <Form.Control
                type="search"
                placeholder="Search failures (status, severity, asset code...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <Card className="flex-grow-1 border-top-0" style={{ overflowY: 'auto' }}>
              <ListGroup variant="flush">
                {(() => {
                  const lowerCaseQuery = searchQuery.toLowerCase();
                  const filteredFailures = failures.filter(failure => {
                    const asset = getAssetInfo(failure.asset_id);
                    return (
                      (failure.status && failure.status.toLowerCase().includes(lowerCaseQuery)) ||
                      (failure.severity && failure.severity.toLowerCase().includes(lowerCaseQuery)) ||
                      (failure.description && failure.description.toLowerCase().includes(lowerCaseQuery)) ||
                      (asset.code && asset.code.toLowerCase().includes(lowerCaseQuery)) ||
                      (asset.name && asset.name.toLowerCase().includes(lowerCaseQuery)) ||
                      (failure.reported_by && failure.reported_by.toLowerCase().includes(lowerCaseQuery))
                    );
                  });

                  if (filteredFailures.length === 0) {
                    return <ListGroup.Item className="text-center">No matching failures found</ListGroup.Item>;
                  }

                  return filteredFailures.map((failure) => {
                    return (
                      <ListGroup.Item
                        key={failure.id}
                        action
                        active={selectedFailure?.id === failure.id}
                        onClick={() => setSelectedFailure(failure)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="d-flex justify-content-between align-items-center gap-2 mb-1">
                              <div style={{ minWidth: '250px' }}>
                                {getStatusBadge(failure.status)}
                                <span className="ms-1">{getSeverityBadge(failure.severity)}</span>
                              </div>
                              <small className="text-muted">{formatDateTime(failure.detected_at)}</small>
                            </div>
                            <h6>{failure.Asset ? failure.Asset.code : `Asset ID: ${failure.asset_id}`}</h6>
                            <small className="d-block text-muted mt-1">Type: {failure.type || 'N/A'}</small>
                            <small className="d-block text-truncate text-muted" style={{ maxWidth: '350px' }}>
                              {failure.description || 'No description'}
                            </small>
                          </div>
                        </div>
                      </ListGroup.Item>
                    );
                  });
                })()}
              </ListGroup>
            </Card>
          </Col>

          {/* Right Pane - Failure Details */}
          <Col md={8} className="d-flex flex-column ps-2" style={{ height: '100%' }}>
            <Card className="flex-grow-1 failure-detail-card" style={{ overflowY: 'auto' }}>
              <Card.Body>
                {selectedFailure ? (
                  <div>
                    <div className="mb-3 d-flex gap-3 align-items-center">
                      <div>
                        <strong>Status:</strong> {getStatusBadge(selectedFailure.status)}
                      </div>
                      {selectedFailure.severity && (
                        <div>
                          <strong>Severity:</strong> {getSeverityBadge(selectedFailure.severity)}
                        </div>
                      )}
                    </div>

                    <div className="d-flex justify-content-between align-items-start mb-3 detail-section">
                      <div>
                        <h5 className="mb-0">
                          {selectedFailure.Asset ? (
                            <Link to={`/assets/${selectedFailure.asset_id}`} className="asset-link">
                              {`${selectedFailure.Asset.code} - ${selectedFailure.Asset.name}`}
                            </Link>
                          ) : (
                            `Asset ID: ${selectedFailure.asset_id}`
                          )}
                        </h5>
                      </div>
                      <div className="action-buttons">
                        <Link to={`/failures/edit/${selectedFailure.id}`}>
                          <Button variant="outline-primary" size="sm" className="me-2">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(selectedFailure.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <Row className="detail-section">
                      <Col md={6}>
                        <div className="mb-3">
                          <h6>Type</h6>
                          <p>{selectedFailure.type || 'N/A'}</p>
                        </div>
                        <div className="mb-3">
                          <h6>Reported By</h6>
                          <p>{selectedFailure.reported_by || 'N/A'}</p>
                        </div>
                        <div className="mb-3">
                          <h6>Assigned To</h6>
                          <p>{selectedFailure.assigned_to || 'N/A'}</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <h6>Detected At</h6>
                          <p>{formatDateTime(selectedFailure.detected_at)}</p>
                        </div>
                        <div className="mb-3">
                          <h6>Created At</h6>
                          <p>{formatDateTime(selectedFailure.created_at)}</p>
                        </div>
                        <div className="mb-3">
                          <h6>Updated At</h6>
                          <p>{formatDateTime(selectedFailure.updated_at)}</p>
                        </div>
                        {selectedFailure.resolved_at && (
                          <div className="mb-3">
                            <h6>Resolved At</h6>
                            <p>{formatDateTime(selectedFailure.resolved_at)}</p>
                          </div>
                        )}
                      </Col>
                    </Row>

                    <div className="mb-3 detail-section">
                      <h6>Description</h6>
                      <p className="description-text">{selectedFailure.description || 'No description provided'}</p>
                    </div>

                    {selectedFailure.cause && (
                      <div className="mb-3 detail-section">
                        <h6>Cause</h6>
                        <p className="description-text">{selectedFailure.cause}</p>
                      </div>
                    )}

                    {selectedFailure.resolution_details && (
                      <div className="mb-3 detail-section">
                        <h6>Resolution Details</h6>
                        <p className="description-text">{selectedFailure.resolution_details}</p>
                      </div>
                    )}

                    {selectedFailure.notes && (
                      <div className="mb-3 detail-section">
                        <h6>Notes</h6>
                        <p className="description-text">{selectedFailure.notes}</p>
                      </div>
                    )}

                    {selectedFailure.custom_fields && Object.keys(selectedFailure.custom_fields).length > 0 && (
                      <div className="mb-3 custom-fields">
                        <h6>Custom Fields</h6>
                        <pre>{JSON.stringify(selectedFailure.custom_fields, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state">
                    <h5>Select a failure to view details</h5>
                    <p>Choose a failure from the list on the left to see its full details here.</p>
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

export default FailureList;
