import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { InviteMember } from '../components/InviteMember';

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
    <div className="bg-pastel min-vh-100 py-5">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <h1 className="fw-semibold text-pastel mb-0">Mis tableros</h1>
          <div className="d-flex align-items-center gap-3">
            <span className="text-pastel-muted small">Hola, {user?.name ?? 'usuario'}</span>
            <button
              type="button"
              className="btn btn-sm btn-pastel-secondary border rounded-3 px-3"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger border-0 rounded-3">
            {error}
          </div>
        )}

        <form
          onSubmit={handleCreate}
          className="card bg-pastel-card border border-pastel rounded-4 shadow-sm mb-4"
        >
          <div className="card-body p-3 p-md-4">
            <h5 className="fw-semibold text-pastel mb-3">Nuevo tablero</h5>
            <div className="row g-2 align-items-center">
              <div className="col-12 col-md-4">
                <input
                  className="form-control border-pastel rounded-3"
                  placeholder="Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <input
                  className="form-control border-pastel rounded-3"
                  placeholder="Descripción (opcional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-2">
                <button
                  type="submit"
                  className="btn btn-pastel-primary rounded-3 w-100"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </form>

        {loading ? (
          <p className="text-pastel-muted">Cargando...</p>
        ) : boards.length === 0 ? (
          <p className="text-pastel-muted">
            Todavía no tienes tableros. Crea el primero arriba.
          </p>
        ) : (
          <div className="row g-3">
            {boards.map((board) => (
              <div className="col-12 col-md-6 col-lg-4" key={board.id}>
                <div className="card bg-pastel-card border border-pastel rounded-4 shadow-sm h-100 pastel-task-card">
                  <div className="card-body p-4 d-flex flex-column">
                    {editingId === board.id ? (
                      <>
                        <input
                          className="form-control border-pastel rounded-3 mb-2"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                        <input
                          className="form-control border-pastel rounded-3 mb-3"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-pastel-primary btn-sm rounded-3 px-3"
                            onClick={() => handleSave(board.id)}
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            className="btn btn-pastel-secondary border btn-sm rounded-3 px-3"
                            onClick={() => setEditingId(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h5 className="card-title fw-semibold text-pastel mb-1">
                          {board.name}
                        </h5>
                        <p className="card-text text-pastel-muted small mb-3">
                          {board.description || 'Sin descripción'}
                        </p>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn btn-pastel-secondary border btn-sm rounded-3 px-3"
                            onClick={() => startEdit(board)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-pastel-danger border btn-sm rounded-3 px-3"
                            onClick={() => handleDelete(board.id)}
                          >
                            Eliminar
                          </button>
                          <button
                            type="button"
                            className="btn btn-pastel-primary btn-sm rounded-3 px-3"
                            onClick={() => navigate(`/boards/${board.id}`)}
                          >
                            Ver Tablero
                          </button>
                        </div>
                        <div className="mt-3 pt-3 border-top border-pastel">
                          <InviteMember boardId={board.id} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}