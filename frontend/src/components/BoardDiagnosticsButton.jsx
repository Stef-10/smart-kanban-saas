import React, { useState } from 'react';
import { getBoardDiagnostics } from '../services/aiService';

const BoardDiagnosticsButton = ({ boardId }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const handleFetchDiagnostics = async () => {
    setLoading(true);
    setError(null);
    
    // Verificamos qué token hay en localStorage
    const token = localStorage.getItem("token");
    console.log("Token obtenido de localStorage:", token ? "Sí existe (longitud: " + token.length + ")" : "NO EXISTE");

    try {
      const result = await getBoardDiagnostics(boardId, token);
      console.log("Resultado de IA:", result);
      
      if (result.status === "success") {
        setReport(result.report);
      } else {
        setError(result.message || "No se pudo generar el reporte");
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
        onClick={handleFetchDiagnostics}
        disabled={loading}
        className="btn btn-outline-primary fw-bold"
      >
        {loading ? "Analizando con IA..." : "✨ Generar Diagnóstico IA"}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-danger text-white rounded-lg text-sm">
          {error}
        </div>
      )}

      {report && (
        <div className="mt-4 p-5 bg-light border border-secondary rounded-xl shadow-sm">
          <h3 className="text-lg font-bold mb-2 text-primary">Diagnóstico del Agile Coach</h3>
          <div className="whitespace-pre-line text-sm text-dark">
            {report}
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardDiagnosticsButton;