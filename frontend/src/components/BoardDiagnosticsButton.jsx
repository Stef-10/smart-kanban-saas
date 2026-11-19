import React, { useState, useEffect } from 'react';
import { getBoardDiagnostics } from '../services/aiService';
import ReactMarkdown from 'react-markdown';

const BoardDiagnosticsButton = ({ boardId }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const fetchDiagnostics = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem("token");
    console.log("Token obtenido de localStorage:", token ? "Sí existe (longitud: " + token.length + ")" : "NO EXISTE");

    try {
      const result = await getBoardDiagnostics(boardId, token);
      console.log("Resultado de IA:", result);
      
      if (result && result.report) {
        setReport(result.report);
      } else {
        setError("No se pudo obtener el reporte del servidor.");
      }
    } catch (err) {
      console.error("Error atrapado en el botón:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="my-4">
      <button 
        onClick={fetchDiagnostics} 
        disabled={loading}
        className="btn btn-outline-primary fw-bold"
      >
        {loading ? (
          <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Analizando con IA...
          </>
        ) : ( 
          report ? "Actualizar Diagnóstico IA" : "Generar Diagnóstico IA"
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-danger text-white rounded-lg text-sm">
          {error}
        </div>
      )}

      {report && (
        <div className="mt-4 p-5 bg-light border border-secondary rounded-xl shadow-sm">
          <h3 className="text-lg font-bold mb-2 text-primary">Diagnóstico del Agile Coach</h3>
          <div className="markdown-body">
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardDiagnosticsButton;