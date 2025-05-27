import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';
import AssetService from '../services/asset.service';

const AssetList = () => {
  // State để lưu trữ danh sách tài sản
  const [assets, setAssets] = useState([]);
  // State để lưu trữ danh sách tài sản đã lọc
  const [filteredAssets, setFilteredAssets] = useState([]);
  // State để theo dõi trạng thái loading
  const [loading, setLoading] = useState(true);
  // State để lưu trữ thông báo lỗi (nếu có)
  const [error, setError] = useState('');
  
  // State cho tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSystem, setFilterSystem] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [systems, setSystems] = useState([]);
  const [locations, setLocations] = useState([]);

  // Hàm để tải danh sách tài sản từ API
  const fetchAssets = async () => {
    try {
      setLoading(true);
      // Gọi service để lấy tất cả tài sản
      const response = await AssetService.getAll();
      // Cập nhật state với dữ liệu nhận được
      setAssets(response.data);
      setFilteredAssets(response.data);
      
      // Trích xuất danh sách hệ thống và vị trí duy nhất để sử dụng trong bộ lọc
      const uniqueSystems = [...new Set(response.data.map(asset => asset.system))].filter(Boolean);
      const uniqueLocations = [...new Set(response.data.map(asset => asset.location))].filter(Boolean);
      
      setSystems(uniqueSystems);
      setLocations(uniqueLocations);
      
      setError('');
    } catch (err) {
      // Xử lý lỗi nếu có
      setError('Failed to fetch assets. ' + (err.response?.data?.message || err.message));
    } finally {
      // Đánh dấu đã tải xong dữ liệu
      setLoading(false);
    }
  };

  // useEffect hook để tải dữ liệu khi component được render
  useEffect(() => {
    fetchAssets();
  }, []);
  
  // useEffect để lọc tài sản khi các điều kiện tìm kiếm/lọc thay đổi
  useEffect(() => {
    if (assets.length > 0) {
      let result = [...assets];
      
      // Lọc theo từ khóa tìm kiếm
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        result = result.filter(asset => 
          asset.name.toLowerCase().includes(searchLower) || 
          asset.code.toLowerCase().includes(searchLower) ||
          (asset.description && asset.description.toLowerCase().includes(searchLower))
        );
      }
      
      // Lọc theo hệ thống
      if (filterSystem) {
        result = result.filter(asset => asset.system === filterSystem);
      }
      
      // Lọc theo vị trí
      if (filterLocation) {
        result = result.filter(asset => asset.location === filterLocation);
      }
      
      setFilteredAssets(result);
    }
  }, [assets, searchTerm, filterSystem, filterLocation]);

  // Hàm xử lý xóa tài sản
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        // Gọi service để xóa tài sản
        await AssetService.remove(id);
        // Tải lại danh sách tài sản sau khi xóa
        fetchAssets();
        alert('Asset deleted successfully');
      } catch (err) {
        setError('Failed to delete asset. ' + (err.response?.data?.message || err.message));
      }
    }
  };
  
  // Hàm để reset các bộ lọc
  const resetFilters = () => {
    setSearchTerm('');
    setFilterSystem('');
    setFilterLocation('');
  };

  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col>
          <h2>Assets</h2>
        </Col>
        <Col className="text-end">
          <Link to="/assets/add">
            <Button variant="primary">Add New Asset</Button>
          </Link>
        </Col>
      </Row>

      {/* Hiển thị thông báo lỗi nếu có */}
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Phần tìm kiếm và lọc */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <InputGroup className="mb-3">
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by name or code"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Filter by System</Form.Label>
                <Form.Select
                  value={filterSystem}
                  onChange={(e) => setFilterSystem(e.target.value)}
                >
                  <option value="">All Systems</option>
                  {systems.map((system, index) => (
                    <option key={index} value={system}>{system}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Filter by Location</Form.Label>
                <Form.Select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {locations.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button 
                variant="secondary" 
                className="mb-3 w-100"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {/* Hiển thị spinner khi đang tải dữ liệu */}
          {loading ? (
            <div className="text-center my-3">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            // Hiển thị bảng danh sách tài sản khi đã tải xong
            <>
              <div className="mb-3">
                <small className="text-muted">
                  Showing {filteredAssets.length} of {assets.length} assets
                </small>
              </div>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>System</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Kiểm tra nếu không có tài sản nào */}
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">No assets found</td>
                    </tr>
                  ) : (
                    // Hiển thị danh sách tài sản
                    filteredAssets.map((asset) => (
                      <tr key={asset.id}>
                        <td>{asset.code}</td>
                        <td>{asset.name}</td>
                        <td>{asset.location}</td>
                        <td>{asset.system}</td>
                        <td>
                          {/* Nút xem chi tiết tài sản */}
                          <Link to={`/assets/${asset.id}`} className="me-2">
                            <Button variant="info" size="sm">View</Button>
                          </Link>
                          {/* Nút chỉnh sửa tài sản */}
                          <Link to={`/assets/edit/${asset.id}`} className="me-2">
                            <Button variant="warning" size="sm">Edit</Button>
                          </Link>
                          {/* Nút xóa tài sản */}
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDelete(asset.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AssetList;
