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
        <div className="bg-pastel-column border border-pastel rounded-3 p-3">
            <h6 className="fw-semibold text-pastel small mb-2">Invitar Colaborador</h6>
            <form onSubmit={handleInvite}>
                <div className="input-group input-group-sm mb-2">
                    <input
                        type="email"
                        className="form-control bg-pastel-card border-pastel rounded-start-3"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button
                        className="btn btn-pastel-primary rounded-end-3 px-3"
                        type="submit"
                    >
                        Invitar
                    </button>
                </div>

                {message && (
                    <div
                        className={`py-1 px-2 rounded-3 text-center small border ${
                            status === 'success'
                                ? 'badge-pastel-low border-pastel'
                                : 'badge-pastel-high border-pastel'
                        }`}
                        role="alert"
                    >
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
};