import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAndStoreToken } from '../api/apiClient'

function LoginPage() {
    const [token, setToken] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        const rawToken = token.trim();
        if (!rawToken) return;

        const isValid = await checkAndStoreToken(rawToken);
        if (isValid) {
            navigate('/');
        } else {
            alert('Неверный токен');
        }
    };


    return (
        <div style={{ padding: '2rem' }}>
            <h2>Авторизация</h2>
            <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Введите токен"
            />
            <button onClick={handleLogin}>Войти</button>
        </div>
    );
}

export default LoginPage;