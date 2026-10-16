import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function BoardDetail() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { id: 'todo', title: 'Por hacer', bg: 'bg-light' },
    { id: 'in_progress', title: 'En proceso', bg: 'bg-warning-subtle' },
    { id: 'done', title: 'Finalizado', bg: 'bg-success-subtle' }
  ];

  useEffect(() => {
    setLoading(false);
  }, [boardId]);

  return (
    <div className="container-fluid mt-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button className="btn btn-sm btn-outline-secondary mb-2" onClick={() => navigate('/boards')}>
            ← Volver a mis tableros
          </button>
          <h2>Tablero de Trabajo</h2>
          <p className="text-muted">Organiza las actividades de tu equipo de desarrollo</p>
        </div>
        <button className="btn btn-success">+ Nueva Tarea</button>
      </div>

      <div className="row g-3">
        {columns.map((col) => (
          <div className="col-md-4" key={col.id}>
            <div className={`card ${col.bg} border-secondary-subtle shadow-sm h-100`} style={{ minHeight: '70vh' }}>
              <div className="card-header bg-dark text-white fw-bold d-flex justify-content-between align-items-center">
                {col.title}
                <span className="badge bg-secondary">0</span>
              </div>
              
              <div className="card-body d-flex flex-column p-2">
                <div className="text-center text-muted my-auto small">
                  No hay tareas en esta columna
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}