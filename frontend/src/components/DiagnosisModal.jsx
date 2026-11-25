import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DiagnosisModal({ show, onClose, report, loading, error }) {
  if (!show) return null;

  const markdownText = typeof report === 'string' ? report : report?.report || '';

  const markdownComponents = {
    h1: ({ children }) => <h4 className="fw-semibold text-pastel mt-2 mb-3">{children}</h4>,
    h2: ({ children }) => <h5 className="fw-semibold text-pastel mt-4 mb-2">{children}</h5>,
    h3: ({ children }) => <h6 className="fw-semibold text-pastel mt-3 mb-2">{children}</h6>,
    p: ({ children }) => <p className="mb-2 text-pastel">{children}</p>,
    table: ({ children }) => (
      <div className="table-responsive my-3">
        <table className="table table-bordered border-pastel table-sm align-middle mb-0">
          {children}
        </table>
      </div>
    ),
    pre({ children }) {
      return <>{children}</>;
    },
    code({ className, children, ...props }) {
      const isBlock = Boolean(className) || String(children).includes('\n');
      if (isBlock) {
        return (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {String(children).replace(/\n$/, '')}
          </ReactMarkdown>
        );
      }
      return (
        <code
          className={`px-1 py-0.5 rounded bg-pastel-column text-pastel ${className || ''}`}
          {...props}
        >
          {children}
        </code>
      );
    },
  };

  return (
    <>
      <div className="modal d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content bg-pastel-card border border-pastel shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header bg-pastel border-bottom border-pastel px-4 py-3 align-items-start">
              <div className="w-100 pe-3">
                <span className="badge rounded-pill badge-pastel-accent mb-1">
                  AI Insight
                </span>
                <h5 className="modal-title fw-semibold text-pastel mb-0">
                  Diagnóstico de cuellos de botella
                </h5>
              </div>
              <button type="button" className="btn-close mt-1" onClick={onClose}></button>
            </div>

            <div className="modal-body px-4 py-4 bg-pastel-card">
              {loading && (
                <div className="d-flex align-items-center gap-2 text-pastel-muted py-2">
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                  <span>Generando diagnóstico...</span>
                </div>
              )}

              {error && (
                <div className="alert alert-danger border-0 rounded-3 mb-0">
                  {error}
                </div>
              )}

              {!loading && !error && report && (
                <div className="small lh-lg text-pastel">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {markdownText}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            <div className="modal-footer bg-pastel border-top border-pastel px-4 py-3">
              {report?.generated_at && (
                <small className="text-pastel-muted me-auto">
                  Generado: {new Date(report.generated_at).toLocaleString('es-MX')}
                </small>
              )}
              <button
                type="button"
                className="btn btn-pastel-primary rounded-3 px-3"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal-backdrop show"
        style={{ backgroundColor: 'rgba(39, 41, 61, 0.35)' }}
      ></div>
    </>
  );
}