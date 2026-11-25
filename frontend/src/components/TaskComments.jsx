import { useEffect, useState } from 'react';
import api from '../api';

const MAX_LENGTH = 1000;

const formatDate = (iso) =>
  new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

export default function TaskComments({ boardId, taskId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadComments = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/boards/${boardId}/tasks/${taskId}/comments`);
        if (!cancelled) setComments(res.data);
      } catch {
        if (!cancelled) setError('No se pudieron cargar los comentarios');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadComments();
    return () => {
      cancelled = true;
    };
  }, [boardId, taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    setError('');
    try {
      const res = await api.post(`/boards/${boardId}/tasks/${taskId}/comments`, { content });
      setComments((prev) => [...prev, res.data]);
      setContent('');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo enviar el comentario');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mt-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <h6 className="fw-semibold text-pastel mb-0">Comentarios</h6>
        <span className="badge rounded-pill bg-pastel-column text-pastel-muted border border-pastel">
          {comments.length}
        </span>
      </div>

      {error && (
        <div className="py-1 px-3 rounded-3 small border badge-pastel-high border-pastel mb-2">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-pastel-muted small">Cargando comentarios...</p>
      ) : comments.length === 0 ? (
        <p className="text-pastel-muted small">
          Aún no hay comentarios. Sé el primero en escribir.
        </p>
      ) : (
        <ul
          className="list-unstyled mb-3 d-flex flex-column gap-2"
          style={{ maxHeight: '300px', overflowY: 'auto' }}
        >
          {comments.map((c) => (
            <li
              key={c.id}
              className="bg-pastel-column border border-pastel rounded-3 p-3"
            >
              <div className="d-flex justify-content-between align-items-center small mb-1">
                <strong className="text-pastel">{c.author.name}</strong>
                <span className="text-pastel-muted">{formatDate(c.created_at)}</span>
              </div>
              <div className="text-pastel small" style={{ whiteSpace: 'pre-wrap' }}>
                {c.content}
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          className="form-control border-pastel rounded-3 mb-2"
          rows={2}
          maxLength={MAX_LENGTH}
          placeholder="Escribe un comentario..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-pastel-muted">
            {content.length}/{MAX_LENGTH}
          </small>
          <button
            type="submit"
            className="btn btn-pastel-primary btn-sm rounded-3 px-3"
            disabled={sending || !content.trim()}
          >
            {sending ? 'Enviando...' : 'Comentar'}
          </button>
        </div>
      </form>
    </section>
  );
}