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

  if (loading) return <p className="text-pastel-muted small mb-0">Cargando métricas...</p>;
  if (error) {
    return (
      <div className="py-2 px-3 rounded-3 small border badge-pastel-high border-pastel">
        {error}
      </div>
    );
  }

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
        backgroundColor: 'rgba(109, 93, 252, 0.32)',
        hoverBackgroundColor: 'rgba(109, 93, 252, 0.48)',
        borderColor: 'rgba(109, 93, 252, 0.85)',
        borderWidth: 1.5,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#27293d',
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#27293d',
        bodyColor: '#6b6f8c',
        borderColor: '#dce0f2',
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(220, 224, 242, 0.5)',
        },
        ticks: {
          color: '#6b6f8c',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(220, 224, 242, 0.5)',
        },
        ticks: {
          precision: 0,
          color: '#6b6f8c',
        },
      },
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '320px' }}>
      <Bar data={data} options={options} />
    </div>
  );
}