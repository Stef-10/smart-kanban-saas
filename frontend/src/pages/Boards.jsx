import { useEffect, useState } from 'react';
import api from '../api';

export default function Boards() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    api.get('/me').then((res) => setUserId(res.data.user_id)).catch(() => {});
  }, []);

  return (
    <div className="container mt-5">
      <h1>Tableros (ruta privada)</h1>
      <p>Sesión activa del usuario: {userId ?? 'verificando...'}</p>
    </div>
  );
}