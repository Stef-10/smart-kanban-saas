import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import TaskComments from '../components/TaskComments';
import DiagnosisModal from '../components/DiagnosisModal';

const USE_MOCK_DIAGNOSIS = false;

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
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [diagnosisError, setDiagnosisError] = useState('');

  const columns = [
    { id: 'todo', title: 'Por hacer' },
    { id: 'in_progress', title: 'En proceso' },
    { id: 'done', title: 'Finalizado' }
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

  useEffect(() => {
    const checkOwner = async () => {
      try {
        const res = await api.get('/boards');
        const board = res.data.find((b) => b.id === Number(boardId));
        const me = JSON.parse(localStorage.getItem('user') || 'null');
        setIsOwner(Boolean(board && me && board.owner_id === me.id));
      } catch {
        setIsOwner(false);
      }
    };
    checkOwner();
  }, [boardId]);

  const handleOpenDiagnosis = async () => {
    setShowDiagnosis(true);
    setDiagnosisLoading(true);
    setDiagnosisError('');
    try {
      if (USE_MOCK_DIAGNOSIS) {
        await new Promise((r) => setTimeout(r, 800));
        setDiagnosis({
          report:
            'Resumen:\n- 3 tareas llevan más de 7 días en "En proceso".\n- La prioridad alta se está acumulando.\n\nRecomendación: repartir las tareas pendientes entre los miembros del tablero.',
          generated_at: new Date().toISOString(),
        });
      } else {
        const res = await api.get(`/boards/${boardId}/diagnosis`);
        setDiagnosis(res.data);
      }
    } catch (err) {
      setDiagnosisError(err.response?.data?.message || 'No se pudo cargar el diagnóstico');
    } finally {
      setDiagnosisLoading(false);
    }
  };

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

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/boards/${boardId}/tasks/${taskId}`, {
        status: newStatus
      });

      setTasks(tasks.map(t => t.id === taskId ? res.data : t));
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar el estado de la tarea');
    }
  };

  const getPriorityBadge = (prio) => {
    if (prio === 'high') return 'badge-pastel-high fw-medium';
    if (prio === 'medium') return 'badge-pastel-medium fw-medium';
    return 'badge-pastel-low fw-medium';
  };

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const task = tasks.find(t => t.id === draggedTaskId);
    if (task && task.status !== newStatus) {
      await handleUpdateStatus(draggedTaskId, newStatus);
    }
    setDraggedTaskId(null);
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <div className="bg-pastel min-vh-100 py-4 px-4">
      <div className="container-fluid">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
          <div>
            <button
              type="button"
              className="btn btn-sm btn-pastel-secondary border rounded-3 text-pastel-muted mb-2"
              onClick={() => navigate('/boards')}
            >
              ← Volver a mis tableros
            </button>
            <h2 className="fw-semibold mb-1 text-pastel">Tablero de Trabajo</h2>
            <p className="text-pastel-muted mb-0">Gestiona el progreso de tus requerimientos</p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            {isOwner && (
              <button
                type="button"
                className="btn btn-pastel-secondary border rounded-3 px-3"
                onClick={handleOpenDiagnosis}
              >
                Diagnóstico IA
              </button>
            )}
            <button
              type="button"
              className="btn btn-pastel-secondary border rounded-3 px-3"
              onClick={() => navigate(`/boards/${boardId}/dashboard`)}
            >
              Ver dashboard
            </button>
            <button
              type="button"
              className="btn btn-pastel-primary rounded-3 px-3"
              onClick={() => setShowModal(true)}
            >
              + Nueva Tarea
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger border-0 rounded-3">
            {error}
          </div>
        )}

        <DiagnosisModal
          show={showDiagnosis}
          onClose={() => setShowDiagnosis(false)}
          report={diagnosis}
          loading={diagnosisLoading}
          error={diagnosisError}
        />

        <div className="row g-3">
          {columns.map((col) => {
            const colTasks = tasks.filter(t => t.status === col.id);

            return (
              <div className="col-md-4" key={col.id}>
                <div
                  className="bg-pastel-column border border-pastel rounded-4 p-3 h-100 d-flex flex-column"
                  style={{ minHeight: '70vh' }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                    <span className="fw-semibold text-pastel small">{col.title}</span>
                    <span className="badge rounded-pill bg-pastel-card text-pastel-muted border border-pastel">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="d-flex flex-column gap-2 flex-grow-1">
                    {loading ? (
                      <p className="text-pastel-muted small text-center my-auto">Cargando...</p>
                    ) : colTasks.length === 0 ? (
                      <div className="text-center text-pastel-muted my-auto small">
                        No hay tareas
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <div
                          className="card bg-pastel-card border border-pastel rounded-3 shadow-sm pastel-task-card"
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => setSelectedTaskId(task.id)}
                          style={{ cursor: 'grab' }}
                        >
                          <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                              <h6 className="card-title mb-0 fw-semibold text-pastel">
                                {task.title}
                              </h6>
                              <span className={`badge rounded-pill ${getPriorityBadge(task.priority)}`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="card-text text-pastel-muted small mb-0">
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
          <div
            className="modal show d-block"
            style={{ backgroundColor: 'rgba(39, 41, 61, 0.35)', position: 'fixed', zIndex: 1050 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content bg-pastel-card border border-pastel shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-pastel border-bottom border-pastel px-4 py-3">
                  <h5 className="modal-title fw-semibold text-pastel mb-0">Crear Nueva Tarea</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleCreateTask}>
                  <div className="modal-body px-4 py-3">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-pastel">
                        Título de la tarea
                      </label>
                      <input
                        className="form-control border-pastel rounded-3"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Ej: Programar estructura del login"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-pastel">
                        Descripción (Opcional)
                      </label>
                      <textarea
                        className="form-control border-pastel rounded-3"
                        rows="3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detalla las especificaciones técnicas..."
                      />
                    </div>
                    <div className="mb-1">
                      <label className="form-label small fw-semibold text-pastel">
                        Prioridad
                      </label>
                      <select
                        className="form-select border-pastel rounded-3"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer bg-pastel border-top border-pastel px-4 py-3">
                    <button
                      type="button"
                      className="btn btn-pastel-secondary border rounded-3"
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-pastel-primary rounded-3 px-3">
                      Guardar Tarea
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {selectedTask && (
          <div
            className="modal show d-block"
            style={{
              backgroundColor: 'rgba(39, 41, 61, 0.35)',
              position: 'fixed',
              zIndex: 1050,
              overflowY: 'auto'
            }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content bg-pastel-card border border-pastel shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-pastel border-bottom border-pastel px-4 py-3">
                  <h5 className="modal-title fw-semibold text-pastel mb-0">{selectedTask.title}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedTaskId(null)}
                  ></button>
                </div>
                <div className="modal-body px-4 py-4">
                  <div className="mb-3">
                    <span className={`badge rounded-pill ${getPriorityBadge(selectedTask.priority)} me-2`}>
                      {selectedTask.priority}
                    </span>
                    <span className="badge rounded-pill bg-pastel-column text-pastel-muted border border-pastel">
                      {columns.find(c => c.id === selectedTask.status)?.title}
                    </span>
                  </div>
                  <p className="text-pastel-muted" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedTask.description || 'Sin descripción'}
                  </p>
                  <hr className="border-pastel" />
                  <TaskComments boardId={boardId} taskId={selectedTask.id} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}