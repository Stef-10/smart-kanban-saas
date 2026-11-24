import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DiagnosisModal({ show, onClose, report, loading, error }) {
  if (!show) return null;

  const markdownText = typeof report === 'string' ? report : report?.report || '';

  const markdownComponents = {
    h1: ({ children }) => <h4 className="fw-semibold mt-2 mb-3">{children}</h4>,
    h2: ({ children }) => <h5 className="fw-semibold mt-4 mb-2">{children}</h5>,
    h3: ({ children }) => <h6 className="fw-semibold mt-3 mb-2">{children}</h6>,
    p: ({ children }) => <p className="mb-2">{children}</p>,
    table: ({ children }) => (
      <div className="table-responsive my-3">
        <table className="table table-bordered table-sm align-middle mb-0">
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
          className={`px-1 py-0.5 rounded bg-body-tertiary text-body-emphasis ${className || ''}`}
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
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header bg-body-tertiary border-0 px-4 py-3 align-items-start">
              <div className="w-100 pe-3">
                <span className="badge rounded-pill bg-secondary-subtle text-secondary-emphasis mb-1">
                  AI Insight
                </span>
                <h5 className="modal-title fw-semibold mb-0">
                  Diagnóstico de cuellos de botella
                </h5>
              </div>
              <button type="button" className="btn-close mt-1" onClick={onClose}></button>
            </div>

            <div className="modal-body px-4 py-4 bg-body">
              {loading && (
                <div className="d-flex align-items-center gap-2 text-body-secondary py-2">
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
                <div className="small lh-lg text-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {markdownText}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            <div className="modal-footer bg-body-tertiary border-0 px-4 py-3">
              {report?.generated_at && (
                <small className="text-body-secondary me-auto">
                  Generado: {new Date(report.generated_at).toLocaleString('es-MX')}
                </small>
              )}
              <button
                type="button"
                className="btn btn-dark rounded-3 px-3"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
}