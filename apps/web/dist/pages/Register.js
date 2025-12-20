import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// Chú thích: Register page - tương tự Login
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState(null);
    const { register, error } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        if (password !== confirmPassword) {
            setLocalError('Mật khẩu xác nhận không khớp');
            return;
        }
        setIsLoading(true);
        const success = await register(email, password);
        if (success) {
            navigate('/');
        }
        setIsLoading(false);
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-4", children: _jsx(FileSpreadsheet, { className: "w-8 h-8 text-white" }) }), _jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "T\u1EA1o t\u00E0i kho\u1EA3n" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 mt-2", children: "\u0110\u0103ng k\u00FD \u0111\u1EC3 b\u1EAFt \u0111\u1EA7u t\u1EA1o \u0111\u1EC1 ki\u1EC3m tra" })] }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [(error || localError) && (_jsx("div", { className: "p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm", children: localError || error })), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "label", children: "Email gi\u00E1o vi\u00EAn" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }), _jsx("input", { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "input pl-10", placeholder: "teacher@school.edu.vn", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "label", children: "M\u1EADt kh\u1EA9u" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }), _jsx("input", { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "input pl-10", placeholder: "\u00CDt nh\u1EA5t 8 k\u00FD t\u1EF1", required: true, minLength: 8 })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "confirmPassword", className: "label", children: "X\u00E1c nh\u1EADn m\u1EADt kh\u1EA9u" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }), _jsx("input", { id: "confirmPassword", type: "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: "input pl-10", placeholder: "Nh\u1EADp l\u1EA1i m\u1EADt kh\u1EA9u", required: true, minLength: 8 })] })] }), _jsx("button", { type: "submit", disabled: isLoading, className: "btn-primary w-full py-3", children: isLoading ? (_jsx("div", { className: "spinner" })) : (_jsxs(_Fragment, { children: ["\u0110\u0103ng k\u00FD", _jsx(ArrowRight, { className: "w-4 h-4" })] })) })] }) }), _jsxs("p", { className: "mt-6 text-center text-gray-500 dark:text-gray-400", children: ["\u0110\u00E3 c\u00F3 t\u00E0i kho\u1EA3n?", ' ', _jsx(Link, { to: "/login", className: "text-primary-600 hover:underline font-medium", children: "\u0110\u0103ng nh\u1EADp" })] })] }) }));
}
//# sourceMappingURL=Register.js.map