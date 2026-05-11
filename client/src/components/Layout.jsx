import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="header">
        <Link to="/patients">
          <img src="/logo.png" alt="ALCODS" className="header-logo" />
        </Link>
        <button onClick={handleLogout} className="btn btn-danger">Logout</button>
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
}
