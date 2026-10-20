import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function BoardDetail() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  const columns = [
    { id: 'todo', title: 'Por hacer', bg: 'bg-light' },
    { id: 'in_progress', title: 'En proceso', bg: 'bg-warning-subtle' },
    { id: 'done', title: 'Finalizado', bg: 'bg-success-subtle' }
  ];

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get(`/boards/${boardId}/tasks`);
        setTasks(res.data);
      } catch (err) {
        setError('No se pudieron cargar las tareas de este tablero');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [boardId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/boards/${boardId}/tasks`, {
        title,
        description,
        priority,
        status: 'todo' 
      });
      setTasks([...tasks, res.data]);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setShowModal(false); 
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear la tarea');
    }
  };

  const getPriorityBadge = (prio) => {
    if (prio === 'high') return 'bg-danger';
    if (prio === 'medium') return 'bg-primary';
    return 'bg-secondary';
  };

  return (
    <div className="container-fluid mt-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button className="btn btn-sm btn-outline-secondary mb-2" onClick={() => navigate('/boards')}>
            ← Volver a mis tableros
          </button>
          <h2>Tablero de Trabajo</h2>
          <p className="text-muted">Gestiona el progreso de tus requerimientos</p>
        </div>
        <button className="btn btn-success" onClick={() => setShowModal(true)}>+ Nueva Tarea</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3">
        {columns.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.id);
          
          return (
            <div className="col-md-4" key={col.id}>
              <div className={`card ${col.bg} border-secondary-subtle shadow-sm h-100`} style={{ minHeight: '70vh' }}>
                <div className="card-header bg-dark text-white fw-bold d-flex justify-content-between align-items-center">
                  {col.title}
                  <span className="badge bg-secondary">{colTasks.length}</span>
                </div>
                
                <div className="card-body d-flex flex-column p-2 gap-2">
                  {loading ? (
                    <p className="text-muted small text-center my-auto">Cargando...</p>
                  ) : colTasks.length === 0 ? (
                    <div className="text-center text-muted my-auto small">No hay tareas</div>
                  ) : (
                    colTasks.map((task) => (
                      <div className="card shadow-sm border-start border-4 border-dark" key={task.id}>
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title mb-0 fw-bold">{task.title}</h6>
                            <span className={`badge ${getPriorityBadge(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className="card-text text-muted small mb-0">
                            {task.description || 'Sin descripción'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal show d-block animate fadeIn" style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', zIndex: 1050 }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Crear Nueva Tarea</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateTask}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Título de la tarea</label>
                    <input 
                      className="form-control" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      required 
                      placeholder="Ej: Programar estructura del login"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Descripción (Opcional)</label>
                    <textarea 
                      className="form-control" 
                      rows="3" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detalla las especificaciones técnicas..."
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Prioridad</label>
                    <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-success">Guardar Tarea</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
