import os
import time
from google import genai
from models import Task

def extract_board_metrics_json(board):
    all_tasks = board.tasks
    
    todo_tasks = [t for t in all_tasks if t.status == 'todo']
    in_progress_tasks = [t for t in all_tasks if t.status == 'in_progress']
    done_tasks = [t for t in all_tasks if t.status == 'done']
    
    high_priority_pending = [
        {"id": t.id, "title": t.title, "status": t.status, "priority": t.priority}
        for t in all_tasks if t.priority == 'high' and t.status != 'done'
    ]
    
    payload = {
        "board_id": board.id,
        "board_name": board.name,
        "summary": {
            "total_tasks": len(all_tasks),
            "todo_count": len(todo_tasks),
            "in_progress_count": len(in_progress_tasks),
            "done_count": len(done_tasks)
        },
        "bottlenecks": {
            "high_priority_pending": high_priority_pending,
            "in_progress_details": [
                {"id": t.id, "title": t.title, "priority": t.priority} 
                for t in in_progress_tasks
            ]
        }
    }
    return payload

def generate_board_diagnostics(board):
    payload = extract_board_metrics_json(board)
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {
            "error": "GEMINI_API_KEY no configurada en las variables de entorno",
            "payload": payload
        }
        
    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    Actúa como un Agile Coach y experto en gestión de proyectos Kanban.
    Analiza la siguiente información estructurada en JSON correspondiente al tablero "{board.name}":

    ```json
    {payload}
    ```

    Por favor genera un reporte de diagnóstico claro, conciso y profesional estructurado en formato Markdown con las siguientes secciones:
    1. **Resumen de Estado:** Breve evaluación general de la salud del tablero.
    2. **Cuellos de Botella Detectados:** Identifica si hay acumulación en 'En proceso', tareas de alta prioridad estancadas o desproporción entre trabajo por hacer y finalizado.
    3. **Recomendaciones Accionables:** 2 o 3 sugerencias concretas para que el equipo mejore el flujo de trabajo.
    """
    
    max_retries = 3
    delay = 2  

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model='gemini-3.8-flash',
                contents=prompt
            )
            return {
                "status": "success",
                "report": response.text,
                "raw_payload": payload
            }

        except Exception as e:
            error_message = str(e)
            if ("503" in error_message or "UNAVAILABLE" in error_message) and attempt < max_retries - 1:
                print(f"Intento {attempt + 1} fallido por alta demanda (503). Reintentando en {delay} segundos...")
                time.sleep(delay)
                delay *= 2  
                continue
            else:
                if attempt == max_retries - 1 or ("503" not in error_message and "UNAVAILABLE" not in error_message):
                    return {
                        "status": "error",
                        "message": f"Error al generar el diagnóstico de IA: {error_message}",
                        "raw_payload": payload
                    }
                raise e