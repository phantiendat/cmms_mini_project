import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import AssetService from '../services/asset.service';
import ActionService from '../services/action.service';
import FailureService from '../services/failure.service';

// Đăng ký các thành phần Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [stats, setStats] = useState({
    assets: 0,
    actions: 0,
    failures: 0,
    unresolvedFailures: 0
  });
  
  const [chartData, setChartData] = useState({
    failureSeverity: {
      labels: ['Low', 'Medium', 'High', 'Critical'],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#343a40']
      }]
    },
    actionTypes: {
      labels: [],
      datasets: [{
        label: 'Số lượng',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Tải dữ liệu từ các service
        const assetsResponse = await AssetService.getAll();
        const actionsResponse = await ActionService.getAll();
        const failuresResponse = await FailureService.getAll();
        
        const assets = assetsResponse.data.data || [];
        const actions = actionsResponse.data.data || [];
        const failures = failuresResponse.data.data || [];
        
        // Tính toán số lượng hư hỏng chưa giải quyết
        const unresolvedFailures = failures.filter(failure => !failure.resolved_at).length;
        
        // Cập nhật state với thống kê
        setStats({
          assets: assets.length,
          actions: actions.length,
          failures: failures.length,
          unresolvedFailures
        });
        
        // Tính toán dữ liệu cho biểu đồ mức độ nghiêm trọng của hư hỏng
        const severityCounts = {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0
        };
        
        failures.forEach(failure => {
          if (severityCounts[failure.severity] !== undefined) {
            severityCounts[failure.severity]++;
          }
        });
        
        // Tính toán dữ liệu cho biểu đồ loại tác động
        const actionTypes = {};
        actions.forEach(action => {
          if (!actionTypes[action.type]) {
            actionTypes[action.type] = 0;
          }
          actionTypes[action.type]++;
        });
        
        // Cập nhật dữ liệu biểu đồ
        setChartData({
          failureSeverity: {
            labels: ['Low', 'Medium', 'High', 'Critical'],
            datasets: [{
              data: [severityCounts.low, severityCounts.medium, severityCounts.high, severityCounts.critical],
              backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#343a40']
            }]
          },
          actionTypes: {
            labels: Object.keys(actionTypes),
            datasets: [{
              label: 'Số lượng',
              data: Object.values(actionTypes),
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Dashboard</h2>
      
      <Row>
        <Col md={3}>
          <Card className="mb-4 text-center">
            <Card.Body>
              <Card.Title>Assets</Card.Title>
              <Card.Text className="display-4">{stats.assets}</Card.Text>
            </Card.Body>
            <Card.Footer>
              <Card.Link href="/assets">View All</Card.Link>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="mb-4 text-center">
            <Card.Body>
              <Card.Title>Maintenance Actions</Card.Title>
              <Card.Text className="display-4">{stats.actions}</Card.Text>
            </Card.Body>
            <Card.Footer>
              <Card.Link href="/actions">View All</Card.Link>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="mb-4 text-center">
            <Card.Body>
              <Card.Title>Total Failures</Card.Title>
              <Card.Text className="display-4">{stats.failures}</Card.Text>
            </Card.Body>
            <Card.Footer>
              <Card.Link href="/failures">View All</Card.Link>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="mb-4 text-center bg-warning text-white">
            <Card.Body>
              <Card.Title>Unresolved Failures</Card.Title>
              <Card.Text className="display-4">{stats.unresolvedFailures}</Card.Text>
            </Card.Body>
            <Card.Footer>
              <Card.Link href="/failures" className="text-white">View All</Card.Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Failure Severity Distribution</Card.Header>
            <Card.Body>
              <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                <Pie 
                  data={chartData.failureSeverity} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }} 
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Maintenance Action Types</Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <Bar 
                  data={chartData.actionTypes} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }} 
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={12}>
          <Card>
            <Card.Body>
              <Card.Title>Welcome to CMMS Mini</Card.Title>
              <Card.Text>
                This is a simple Computerized Maintenance Management System (CMMS) for tracking assets, maintenance actions, and failures.
              </Card.Text>
              <Card.Text>
                Use the navigation menu to access different sections of the application.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
