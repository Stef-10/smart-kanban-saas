import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', { name, email, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar');
    }
  };

  return (
    <div className="bg-pastel min-vh-100 d-flex align-items-center justify-content-center px-3 py-5">
      <div
        className="card bg-pastel-card border border-pastel rounded-4 shadow-sm w-100"
        style={{ maxWidth: 420 }}
      >
        <div className="card-body p-4 p-md-5">
          <h2 className="fw-semibold text-pastel mb-1">Crear cuenta</h2>
          <p className="text-pastel-muted small mb-4">
            Comienza a organizar tus tableros
          </p>

          {error && (
            <div className="py-2 px-3 rounded-3 small border badge-pastel-high border-pastel mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-pastel">
                Nombre
              </label>
              <input
                type="text"
                className="form-control border-pastel rounded-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-pastel">
                Correo electrónico
              </label>
              <input
                type="email"
                className="form-control border-pastel rounded-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-pastel">
                Contraseña
              </label>
              <input
                type="password"
                className="form-control border-pastel rounded-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-pastel-primary rounded-3 w-100 py-2"
            >
              Registrarme
            </button>
          </form>

          <p className="mt-4 mb-0 text-center text-pastel-muted small">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="fw-semibold text-pastel text-decoration-none">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}