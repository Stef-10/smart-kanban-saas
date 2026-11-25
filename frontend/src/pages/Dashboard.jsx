import { useParams, useNavigate } from 'react-router-dom';
import WeeklyChart from '../components/WeeklyChart';

export default function Dashboard() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="bg-pastel min-vh-100 py-4 px-4">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
          <div>
            <button
              type="button"
              className="btn btn-sm btn-pastel-secondary border rounded-3 text-pastel-muted mb-2"
              onClick={() => navigate(`/boards/${boardId}`)}
            >
              ← Volver al tablero
            </button>
            <h2 className="fw-semibold text-pastel mb-1">Dashboard</h2>
            <p className="text-pastel-muted small mb-0">
              Métricas y rendimiento de tu tablero
            </p>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="card bg-pastel-card border border-pastel rounded-4 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title fw-semibold text-pastel mb-0">
                    Tareas completadas por semana
                  </h5>
                  <span className="badge rounded-pill badge-pastel-accent">
                    Analítica
                  </span>
                </div>
                <WeeklyChart boardId={boardId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}