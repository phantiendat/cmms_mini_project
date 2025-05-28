import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import AssetService from '../services/asset.service';
import ActionService from '../services/action.service';
import FailureService from '../services/failure.service';
import { formatDateTime } from '../utils/dateFormat';
import { CSVLink } from 'react-csv';
import './Reports.css';

// Đăng ký các thành phần Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

// Định nghĩa thứ tự cột cho báo cáo hư hỏng
const failureReportColumns = [
  { key: 'no', label: 'No.' },
  { key: 'asset_id', label: 'Asset ID' },
  { key: 'asset_code', label: 'Asset Code' },
  { key: 'asset_name', label: 'Asset Name' },
  { key: 'type', label: 'Type' },
  { key: 'description', label: 'Description' },
  { key: 'resolution_details', label: 'Resolution Details' },
  { key: 'severity', label: 'Severity' },
  { key: 'status', label: 'Status' },
  { key: 'resolved_by', label: 'Resolved By' },
  { key: 'reported_by', label: 'Reported By' },
  { key: 'detected_at_formatted', label: 'Detected At' },
  { key: 'resolved_at_formatted', label: 'Resolved At' },
  { key: 'created_at_formatted', label: 'Created At' },
  { key: 'updated_at_formatted', label: 'Updated At' }
];

// Định nghĩa thứ tự cột cho báo cáo actions by month
const actionMonthColumns = [
  { key: 'no', label: 'No.' },
  { key: 'asset_id', label: 'Asset ID' },
  { key: 'asset_code', label: 'Asset Code' },
  { key: 'asset_name', label: 'Asset Name' },
  { key: 'type', label: 'Type' },
  { key: 'description', label: 'Description' },
  { key: 'severity', label: 'Severity' },
  { key: 'status', label: 'Status' },
  { key: 'performed_by', label: 'Performed By' },
  { key: 'created_by', label: 'Created By' },
  { key: 'created_at_formatted', label: 'Created At' },
  { key: 'performed_at_formatted', label: 'Performed At' },
  { key: 'updated_at_formatted', label: 'Updated At' }
];

// Định nghĩa thứ tự cột cho báo cáo lịch sử
const historyReportColumns = [
  { key: 'id', label: 'ID' },
  { key: 'asset_code', label: 'Asset Code' },
  { key: 'asset_name', label: 'Asset Name' },
  { key: 'type', label: 'Type' },
  { key: 'event_type', label: 'Event Type' },
  { key: 'description', label: 'Description' },
  { key: 'severity', label: 'Severity' },
  { key: 'status', label: 'Status' },
  { key: 'performed_by', label: 'Performed By' },
  { key: 'resolution_details', label: 'Resolution Details' },
  { key: 'date_formatted', label: 'Date' }
];

// Định nghĩa cột cho báo cáo actions
const actionReportColumns = [
  { key: 'id', label: 'ID' },
  { key: 'asset_code', label: 'Asset Code' },
  { key: 'asset_name', label: 'Asset Name' },
  { key: 'type', label: 'Type' },
  { key: 'description', label: 'Description' },
  { key: 'performed_by', label: 'Performed By' },
  { key: 'created_by', label: 'Created By' },
  { key: 'performed_at', label: 'Performed At' },
  { key: 'custom_fields', label: 'Custom Fields' }
];

// Định nghĩa cột cho báo cáo tài sản
const assetHealthColumns = [
  { key: 'no', label: 'No.' },
  { key: 'id', label: 'ID' },
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Name' },
  { key: 'location', label: 'Location' },
  { key: 'maintenance_actions_count', label: 'Maintenance Actions' },
  { key: 'failures_count', label: 'Failures' },
  { key: 'created_at_formatted', label: 'Created At' },
  { key: 'updated_at_formatted', label: 'Updated At' }
];

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState('failures_by_asset');
  const [reportData, setReportData] = useState(null);
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState('');
  
  // State cho bộ lọc ngày
  const [dateRangePreset, setDateRangePreset] = useState('all_time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // State cho báo cáo actions by month
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Tải danh sách tài sản khi component được render
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await AssetService.getAll();
        setAssets(response.data.data || []);
      } catch (err) {
        setError('Failed to fetch assets. ' + (err.response?.data?.message || err.message));
      }
    };
    
    fetchAssets();
  }, []);

  const generateReport = async () => {
    // Kiểm tra các điều kiện cần thiết
    if (!reportType) {
      setError('Please select a report type.');
      return;
    }
    if ((reportType === 'failures_by_asset' || reportType === 'asset_history') && !selectedAsset) {
      setError('Please select an asset for this report type.');
      return;
    }
    if (reportType === 'actions_by_month' && (!selectedMonth || !selectedYear)) {
      setError('Please select month and year for this report type.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setReportData(null);

      // Tính toán startDate và endDate
      let startDate = null;
      let endDate = null;
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      switch (dateRangePreset) {
        case 'last_day':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(today);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'last_2_days':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 2);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(today);
          endDate.setDate(today.getDate() - 1);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'last_week':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(today);
          endDate.setDate(today.getDate() - 1);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'last_month':
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'custom':
          if (customStartDate) {
            startDate = new Date(customStartDate);
            startDate.setHours(0, 0, 0, 0);
          }
          if (customEndDate) {
            endDate = new Date(customEndDate);
            endDate.setHours(23, 59, 59, 999);
          }
          break;
        default:
          break;
      }

      const startDateISO = startDate ? startDate.toISOString() : null;
      const endDateISO = endDate ? endDate.toISOString() : null;

      let responseData = [];
      let reportTitle = '';
      let columnOrder = [];
      let tableData = [];

      switch (reportType) {
        case 'failures_by_asset':
          const response = await FailureService.getByAsset(selectedAsset, startDateISO, endDateISO);
          responseData = response.data.data || [];
          const asset = assets.find(a => a.id === Number(selectedAsset));
          reportTitle = `Failures for Asset ${asset ? asset.code + ' - ' + asset.name : selectedAsset}`;
          columnOrder = failureReportColumns;

          // Xử lý dữ liệu trả về
          tableData = responseData.map((item, index) => {
            const orderedItem = {};
            columnOrder.forEach(col => {
              if (col.key === 'no') {
                orderedItem[col.key] = index + 1;
              } else if (col.key === 'asset_code') {
                orderedItem[col.key] = asset ? asset.code : 'N/A';
              } else if (col.key === 'asset_name') {
                orderedItem[col.key] = asset ? asset.name : 'N/A';
              } else if (col.key.endsWith('_formatted')) {
                const originalKey = col.key.replace('_formatted', '');
                orderedItem[col.key] = formatDateTime(item[originalKey]);
              } else {
                orderedItem[col.key] = item[col.key] !== undefined && item[col.key] !== null ? item[col.key] : '-';
              }
            });
            // Đảm bảo các trường mới được lấy đúng
            orderedItem['resolved_by'] = item.resolved_by || '-';
            orderedItem['reported_by'] = item.reported_by || '-';
            orderedItem['status'] = item.status || 'Open';
            orderedItem['resolution_details'] = item.resolution_details || '-';
            return orderedItem;
          });
          break;

        case 'actions_by_month':
          const actionsResponse = await ActionService.getAll();
          const allAssets = assets.length > 0 ? assets : (await AssetService.getAll()).data.data || [];
          setAssets(allAssets);

          responseData = (actionsResponse.data.data || []).filter(action => {
            if (!action.performed_at) return false;
            const actionDate = new Date(action.performed_at);
            return actionDate.getFullYear() === parseInt(selectedYear) && 
                   (actionDate.getMonth() + 1) === parseInt(selectedMonth);
          });

          reportTitle = `Maintenance Actions for ${selectedMonth}/${selectedYear}`;
          columnOrder = actionMonthColumns;

          tableData = responseData.map((item, index) => {
            const asset = allAssets.find(a => a.id === item.asset_id) || {};
            const orderedItem = {};
            columnOrder.forEach(col => {
              if (col.key === 'no') {
                orderedItem[col.key] = index + 1;
              } else if (col.key === 'asset_code') {
                orderedItem[col.key] = asset.code || 'N/A';
              } else if (col.key === 'asset_name') {
                orderedItem[col.key] = asset.name || 'N/A';
              } else if (col.key === 'severity') {
                orderedItem[col.key] = item.severity || '-';
              } else if (col.key === 'status') {
                orderedItem[col.key] = item.status || 'Planned';
              } else if (col.key.endsWith('_formatted')) {
                const originalKey = col.key.replace('_formatted', '');
                orderedItem[col.key] = formatDateTime(item[originalKey]);
              } else {
                orderedItem[col.key] = item[col.key] !== undefined && item[col.key] !== null ? item[col.key] : '-';
              }
            });
            orderedItem['created_by'] = item.created_by || '-';
            orderedItem['performed_by'] = item.performed_by || '-';
            return orderedItem;
          });
          break;

        case 'asset_health':
          try {
            const response = await AssetService.getAllWithCounts(startDateISO, endDateISO);
            console.log('Asset health response:', response); // Debug log
            
            if (!response.data || !response.data.data) {
              throw new Error('Invalid response format from asset health API');
            }
            
            responseData = response.data.data;
            reportTitle = 'Asset Health Report';
            columnOrder = assetHealthColumns;

            // Xử lý dữ liệu trả về
            tableData = responseData.map((item, index) => {
              const orderedItem = {};
              columnOrder.forEach(col => {
                if (col.key === 'no') {
                  orderedItem[col.key] = index + 1;
                } else if (col.key === 'maintenance_actions_count') {
                  orderedItem[col.key] = item.actions_count !== undefined ? item.actions_count : '-';
                } else if (col.key === 'failures_count') {
                  orderedItem[col.key] = item.failures_count !== undefined ? item.failures_count : '-';
                } else if (col.key.endsWith('_formatted')) {
                  const originalKey = col.key.replace('_formatted', '');
                  orderedItem[col.key] = formatDateTime(item[originalKey]);
                } else {
                  orderedItem[col.key] = item[col.key] !== undefined && item[col.key] !== null ? item[col.key] : '-';
                }
              });
              return orderedItem;
            });
          } catch (error) {
            console.error('Error fetching asset health:', error);
            throw new Error('Failed to fetch asset health data: ' + (error.response?.data?.message || error.message));
          }
          break;

        default:
          throw new Error('Invalid report type');
      }

      // Kiểm tra dữ liệu trước khi set
      if (!tableData || tableData.length === 0) {
        setError('No data found for the selected criteria.');
        setReportData(null);
        return;
      }

      setReportData({
        title: reportTitle,
        data: tableData,
        columnOrder: columnOrder
      });

    } catch (err) {
      console.error("Failed to generate report:", err);
      setError('Failed to generate report. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    return (
      <Badge bg={
        status === 'Resolved' || status === 'Closed' ? 'success' :
        status === 'In Progress' ? 'info' : 'warning'
      }>
        {status}
      </Badge>
    );
  };

  const renderSeverityBadge = (severity) => {
    return (
      <Badge bg={
        severity === 'critical' ? 'danger' :
        severity === 'high' ? 'warning' :
        severity === 'medium' ? 'info' : 'secondary'
      }>
        {severity}
      </Badge>
    );
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Reports</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          <Form>
            <Row className="align-items-end">
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Report Type</Form.Label>
                  <Form.Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    required
                  >
                    <option value="">Select Report Type</option>
                    <option value="failures_by_asset">Failures by Asset</option>
                    <option value="actions_by_month">Actions by Month</option>
                    <option value="asset_health">Asset Health</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              {(reportType === 'failures_by_asset') && (
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Select Asset</Form.Label>
                    <Form.Select
                      value={selectedAsset}
                      onChange={(e) => setSelectedAsset(e.target.value)}
                      required
                    >
                      <option value="">Select an Asset</option>
                      {assets.map(asset => (
                        <option key={asset.id} value={asset.id}>
                          {asset.code} - {asset.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}

              {reportType === 'actions_by_month' && (
                <>
                  <Col md={2} sm={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Month</Form.Label>
                      <Form.Select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                      >
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2} sm={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Year</Form.Label>
                      <Form.Control
                        type="number"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </>
              )}
            </Row>

            <Row className="align-items-end mt-3">
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Date Range</Form.Label>
                  <Form.Select
                    value={dateRangePreset}
                    onChange={(e) => setDateRangePreset(e.target.value)}
                  >
                    <option value="all_time">All Time</option>
                    <option value="last_day">Last Day</option>
                    <option value="last_2_days">Last 2 Days</option>
                    <option value="last_week">Last Week</option>
                    <option value="last_month">Last Month</option>
                    <option value="custom">Custom Range</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {dateRangePreset === 'custom' && (
                <>
                  <Col md={3} sm={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3} sm={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </>
              )}

              <Col md={2} className="mb-3 d-flex align-items-end">
                <Button
                  variant="primary"
                  onClick={generateReport}
                  disabled={loading || !reportType || ((reportType === 'failures_by_asset') && !selectedAsset)}
                  className="w-100"
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Generating...</span>
                    </>
                  ) : (
                    'Generate Report'
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      
      {reportData && (
        <Card className="mt-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>{reportData.title}</h3>
              <CSVLink
                data={reportData.data}
                headers={reportData.columnOrder.map(col => ({
                  label: col.label,
                  key: col.key
                }))}
                filename={`${reportType}_${new Date().toISOString().split('T')[0]}.csv`}
                className="btn btn-success"
              >
                Export to CSV
              </CSVLink>
            </div>

            <div className="table-responsive">
              <Table striped bordered hover responsive size="sm" className="report-table">
                <thead>
                  <tr>
                    {reportData.columnOrder.map(col => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.map((row, index) => (
                    <tr key={index}>
                      {reportData.columnOrder.map(col => {
                        const value = row[col.key];
                        let cellContent = value;
                        let cellClassName = '';
                        let dataType = '';

                        // Xác định loại dữ liệu và className cho cell
                        if (col.key === 'asset_code') {
                          cellClassName = 'asset-code-cell';
                        } else if (col.key === 'description') {
                          cellClassName = 'description-cell';
                        } else if (col.key === 'resolution_details') {
                          cellClassName = 'resolution-details-cell';
                        } else if (col.key.endsWith('_count')) {
                          dataType = 'number';
                        } else if (col.key.endsWith('_formatted')) {
                          dataType = 'datetime';
                        }

                        // Xử lý hiển thị nội dung cell
                        if (col.key === 'severity') {
                          cellContent = renderSeverityBadge(value);
                        } else if (col.key === 'status') {
                          cellContent = renderStatusBadge(value);
                        }

                        return (
                          <td 
                            key={col.key} 
                            className={cellClassName}
                            data-type={dataType}
                          >
                            {cellContent}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Reports;
