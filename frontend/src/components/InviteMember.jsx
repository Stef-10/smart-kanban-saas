import React, { useState } from 'react';
export const InviteMember = ({ boardId }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');

    const handleInvite = async (e) => {
        e.preventDefault();
        setMessage('');
        setStatus('');

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/boards/${boardId}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: email.trim() })
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message);
                setEmail(''); 
            } else {
                setStatus('error');
                setMessage(data.message || 'Ocurrió un error inesperado');
            }
        } catch (error) {
            setStatus('error');
            setMessage('No se pudo conectar con el servidor de Flask');
        }
    };

    return (
        <div className="card p-3 my-3 shadow-sm" style={{ maxWidth: '400px' }}>
            <h5 className="card-title text-secondary">👥 Invitar Colaborador</h5>
            <form onSubmit={handleInvite} className="mt-2">
                <div className="input-group mb-2">
                    <input
                        type="email"
                        className="form-control"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button className="btn btn-primary" type="submit">
                        Invitar
                    </button>
                </div>
                
                {message && (
                    <div className={`alert py-1 px-2 text-center small ${status === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
};
