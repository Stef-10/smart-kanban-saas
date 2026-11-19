import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function WeeklyChart({ boardId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await api.get(`/boards/${boardId}/metrics/weekly`);
        if (!cancelled) setRows(res.data);
      } catch {
        if (!cancelled) setError('No se pudieron cargar las métricas');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [boardId]);

  if (loading) return <p className="text-muted">Cargando métricas...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const data = {
    labels: rows.map((r) =>
      new Date(`${r.week}T00:00:00`).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
      })
    ),
    datasets: [
      {
        label: 'Tareas completadas',
        data: rows.map((r) => r.total),
        backgroundColor: 'rgba(13, 110, 253, 0.7)',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '320px' }}>
      <Bar data={data} options={options} />
    </div>
  );
}