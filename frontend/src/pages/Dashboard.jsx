import { useParams, useNavigate } from 'react-router-dom';
import WeeklyChart from '../components/WeeklyChart';

export default function Dashboard() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Dashboard</h2>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(`/boards/${boardId}`)}
        >
          Volver al tablero
        </button>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Tareas completadas por semana</h5>
              <WeeklyChart boardId={boardId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}