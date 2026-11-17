export default function DiagnosisModal({ show, onClose, report, loading, error }) {
  if (!show) return null;

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
                <div style={{ whiteSpace: 'pre-wrap' }}>{report.report}</div>
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