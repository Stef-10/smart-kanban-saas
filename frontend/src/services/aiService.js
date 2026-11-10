const API_URL = "http://localhost:5000";
export const getBoardDiagnostics = async (boardId, token) => {
  try {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/ai-diagnostics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Error al obtener el diagnóstico de IA");
    }

    return data;
    } catch (error) {
    console.error("Error en getBoardDiagnostics:", error);
    throw error;
  }
};