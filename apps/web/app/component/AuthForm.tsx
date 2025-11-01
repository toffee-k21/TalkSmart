'use client'
import React, { useReducer, useState } from 'react'
import { backend_url } from "../utils.json";
import { useRouter } from 'next/navigation';

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        // confirmPassword: ''
    });
    const router = useRouter();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let res;
        if (isLogin) {
            res = await fetch(`${backend_url}/auth/signin/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });
        }
        else {
            res = await fetch(`${backend_url}/auth/signup/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
            });
        }
        const token = await res.json();
        console.log(token);
        document.cookie = `token=${token}; path=/; max-age=86400; secure; samesite=strict`;
        router.push("/home");
        // console.log('Form submitted:', formData);
    };
    return (
        <div style={{ maxWidth: 400, margin: '2rem auto', textAlign: 'center' }}>
            <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {!isLogin && (
                    <input
                        type="text"
                        placeholder="Username"
                        value={formData.username}
                        onChange={e => handleInputChange('username', e.target.value)}
                        required
                    />
                )}
                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={e => handleInputChange('password', e.target.value)}
                    required
                />

                <button type="submit" style={{ padding: '0.5rem', cursor: 'pointer' }}>
                    {isLogin ? 'Sign In' : 'Sign Up'}
                </button>
            </form>

            <p style={{ marginTop: '1rem' }}>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <span
                    onClick={() => setIsLogin(!isLogin)}
                    style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                </span>
            </p>
        </div>
    );
}

export default AuthForm