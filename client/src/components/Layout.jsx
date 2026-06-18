import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  admin: 'Admin',
  doctor: 'Doctor',
  owner: 'Owner',
};

export default function Layout({ children }) {
  const { logout, user } = useAuth();
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
        <div className="header-actions">
          {user?.role && (
            <span className="role-badge">{ROLE_LABELS[user.role] || user.role}</span>
          )}
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </div>
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
}
