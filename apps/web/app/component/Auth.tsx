import React, { useState } from 'react'
import { backend_url } from "../utils.json";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        // confirmPassword: ''
    });

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
        // console.log('Form submitted:', formData);
    };
  return (
    <div>Auth</div>
  )
}

export default Auth