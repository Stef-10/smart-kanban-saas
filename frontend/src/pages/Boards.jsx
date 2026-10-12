import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Boards() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    const loadBoards = async () => {
      try {
        const res = await api.get('/boards');
        setBoards(res.data);
      } catch {
        setError('No se pudieron cargar los tableros');
      } finally {
        setLoading(false);
      }
    };
    loadBoards();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/boards', { name, description });
      setBoards([res.data, ...boards]);
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo crear el tablero');
    }
  };

  const startEdit = (board) => {
    setEditingId(board.id);
    setEditName(board.name);
    setEditDescription(board.description || '');
  };

  const handleSave = async (id) => {
    setError('');
    try {
      const res = await api.put(`/boards/${id}`, {
        name: editName,
        description: editDescription,
      });
      setBoards(boards.map((b) => (b.id === id ? res.data : b)));
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el tablero');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este tablero?')) return;
    setError('');
    try {
      await api.delete(`/boards/${id}`);
      setBoards(boards.filter((b) => b.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el tablero');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Mis tableros</h1>
        <div>
          <span className="me-3">Hola, {user?.name ?? 'usuario'}</span>
          <button className="btn btn-outline-secondary" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleCreate} className="card card-body mb-4">
        <h5 className="mb-3">Nuevo tablero</h5>
        <div className="row g-2">
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">Crear</button>
          </div>
        </div>
      </form>

      {loading ? (
        <p className="text-muted">Cargando...</p>
      ) : boards.length === 0 ? (
        <p className="text-muted">Todavía no tienes tableros. Crea el primero arriba.</p>
      ) : (
        <div className="row g-3">
          {boards.map((board) => (
            <div className="col-md-4" key={board.id}>
              <div className="card h-100">
                <div className="card-body">
                  {editingId === board.id ? (
                    <>
                      <input
                        className="form-control mb-2"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                      <input
                        className="form-control mb-3"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleSave(board.id)}
                      >
                        Guardar
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setEditingId(null)}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <h5 className="card-title">{board.name}</h5>
                      <p className="card-text text-muted">
                        {board.description || 'Sin descripción'}
                      </p>
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => startEdit(board)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(board.id)}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}