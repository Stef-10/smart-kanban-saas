import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DiagnosisModal({ show, onClose, report, loading, error }) {
  if (!show) return null;

  const markdownText = typeof report === 'string' ? report : report?.report || '';

  return (
    <>
      <div className="modal d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Diagnóstico de cuellos de botella</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {loading && <p className="text-muted">Generando diagnóstico...</p>}
              {error && <div className="alert alert-danger">{error}</div>}
              {!loading && !error && report && (
                <div className="diagnosis-markdown">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      pre({ children }) {
                        return <>{children}</>;
                      },
                      code({ className, children, ...props }) {
                        const isBlock = Boolean(className) || String(children).includes('\n');
                        if (isBlock) {
                          return (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {String(children).replace(/\n$/, '')}
                            </ReactMarkdown>
                          );
                        }
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {markdownText}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {report?.generated_at && (
                <small className="text-muted me-auto">
                  Generado: {new Date(report.generated_at).toLocaleString('es-MX')}
                </small>
              )}
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
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