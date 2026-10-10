import { useNavigate } from 'react-router-dom';

export default function Boards() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Tableros</h1>
        <div>
          <span className="me-3">Hola, {user?.name ?? 'usuario'}</span>
          <button className="btn btn-outline-secondary" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
      <p className="text-muted">Aquí irá el CRUD de tableros.</p>
    </div>
  );
}