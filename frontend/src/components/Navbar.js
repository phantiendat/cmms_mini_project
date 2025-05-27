import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AppNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/">CMMS Mini</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Offcanvas
          id="responsive-navbar-nav"
          aria-labelledby="responsive-navbar-nav-label"
          placement="end"
          bg="dark"
          variant="dark"
        >
          <Offcanvas.Header closeButton className="bg-dark text-white">
            <Offcanvas.Title id="responsive-navbar-nav-label">
              CMMS Mini
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="bg-dark text-white">
            {user ? (
              <>
                <Nav className="me-auto">
                  <Nav.Link 
                    as={Link} 
                    to="/dashboard" 
                    className={isActive('/dashboard') ? 'border-bottom border-white' : ''}
                  >
                    Dashboard
                  </Nav.Link>
                  <Nav.Link 
                    as={Link} 
                    to="/assets" 
                    className={isActive('/assets') ? 'border-bottom border-white' : ''}
                  >
                    Assets
                  </Nav.Link>
                  <Nav.Link 
                    as={Link} 
                    to="/actions" 
                    className={isActive('/actions') ? 'border-bottom border-white' : ''}
                  >
                    Maintenance Actions
                  </Nav.Link>
                  <Nav.Link 
                    as={Link} 
                    to="/failures" 
                    className={isActive('/failures') ? 'border-bottom border-white' : ''}
                  >
                    Failures
                  </Nav.Link>
                  <Nav.Link 
                    as={Link} 
                    to="/reports" 
                    className={isActive('/reports') ? 'border-bottom border-white' : ''}
                  >
                    Reports
                  </Nav.Link>
                </Nav>
                <Nav>
                  <Navbar.Text className="me-3 d-none d-lg-block">
                    Signed in as: <span className="text-white">{user.name || user.username}</span>
                  </Navbar.Text>
                  <Navbar.Text className="me-3 d-block d-lg-none mb-2">
                    Signed in as: <span className="text-white">{user.name || user.username}</span>
                  </Navbar.Text>
                  <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
                </Nav>
              </>
            ) : (
              <Nav className="ms-auto">
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </Nav>
            )}
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
