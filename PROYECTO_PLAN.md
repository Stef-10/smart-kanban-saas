1\. Descripción General del Proyecto

**SmartKanban SaaS** es una plataforma de gestión de proyectos y productividad en equipo basada en el método Kanban (estilo Trello/Jira). La aplicación permite centralizar flujos de trabajo interactivos, comunicarse mediante comentarios en tiempo real y delegar reportes analíticos complejos a una **Inteligencia Artificial integrada** para detectar cuellos de botella organizacionales.

---

2\. Stack Tecnológico Mandatorio

El proyecto se construirá exclusivamente utilizando las tecnologías validadas en nuestro perfil profesional:

| Capa del Software | Tecnología Seleccionada | Propósito Clave |
| ----- | ----- | ----- |
| **Frontend (Cliente)** | React.js (JavaScript) | SPA reactiva para renderizar el tablero e interfaces del panel. |
| **Diseño / UI** | Bootstrap 5 \+ HTML5 \+ CSS3 | Estilizado moderno, diseño responsivo y adaptabilidad móvil. |
| **Backend (Servidor)** | Python con Flask | Micro-framework ágil para la exposición de endpoints RESTful. |
| **Base de Datos / ORM** | SQL con SQLAlchemy | Modelado relacional estructurado y persistencia de datos seguros. |
| **Seguridad** | JSON Web Tokens (JWT) | Autenticación y control de accesos protegidos basados en roles. |
| **Pruebas Automatizadas** | Jest (en Frontend) | Aseguramiento de la lógica de renderizado de componentes críticos. |
| **Control de Versiones** | Git \+ GitHub | Gestión del código, revisiones por ramas e historial colaborativo. |

---

3\. Requerimientos Funcionales (Módulos del MVP)

El sistema se subdividirá en 5 módulos principales distribuidos equitativamente entre los desarrolladores:

Módulo A: Autenticación y Seguridad (JWT)

* Registro de usuarios con contraseñas encriptadas (hashing en el backend).  
* Inicio de sesión confiable que retorne un **JSON Web Token (JWT)** con tiempo de expiración.  
* Middleware de protección de rutas para restringir accesos del frontend a usuarios no autenticados.

Módulo B: Gestión de Proyectos y Espacios de Trabajo

* Creación, edición y eliminación de espacios de proyectos (Tableros independientes).  
* Flujo para invitar o asignar colaboradores/miembros a un proyecto específico mediante su correo electrónico.

Módulo C: Tablero Kanban Interactivos (Core App)

* Soporte dinámico para arrastrar y soltar (*drag-and-drop*) tareas individuales entre tres columnas fijas: *Por hacer*, *En proceso* y *Finalizado*.  
* Formulario interactivo para agregar propiedades a la tarea: título, descripción, fecha de vencimiento y colaborador asignado.  
* **Sección de comentarios:** Un hilo de discusión interno dentro de cada tarea para guardar el feedback de los colaboradores.

Módulo D: El "Efecto Wow" – Analíticas con IA

* **Módulo Extractor:** Lógica en Python que recopila periódicamente las tareas retrasadas, acumuladas o con fechas límite vencidas en un payload estructurado en JSON.  
* **Integración HTTP:** Conexión segura hacia la API de OpenAI o Anthropic que envía los datos del proyecto y retorna un reporte ejecutivo de cuellos de botella en lenguaje natural.  
* **Visualización:** Ventana modal responsiva en React para mostrar el diagnóstico inteligente al administrador del proyecto.

Módulo E: Dashboard de Métricas

* Panel analítico que consume datos históricos de las tareas completadas por semana.  
* Visualización de gráficos dinámicos (usando *Chart.js* o librerías homólogas) detallando el rendimiento colectivo.

---

4\. Requerimientos No Funcionales & Documentación profesional

1. **Estrategia Git-Flow Rigurosa:** Queda prohibido pushear código directamente a main. Todo desarrollo deberá nacer en ramas secundarias (ej: feature/auth, feature/kanban-ui) y requerirá un *Pull Request* aprobado por el otro colaborador.  
2. **Arquitectura Limpia:** Separación clara en directorios independientes: /frontend y /backend. El backend no debe servir HTML; se comunicará de forma exclusiva en formato **JSON** implementando políticas de **CORS**.  
3. **Documentación Impecable:**  
    El repositorio contará con un archivo README.md que incluirá:  
   * Diagrama de arquitectura del software.  
   * Pasos detallados para configurar el entorno virtual de Python (venv), instalación de dependencias vía pip y montaje de Node.js.  
   * Documentación interactiva de endpoints de la API (Endpoints RESTful expuestos).  
   * Enlace al despliegue funcional en vivo de la aplicación.

---

