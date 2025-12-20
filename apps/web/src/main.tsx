import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Buffer } from 'buffer';
import App from './App';
import './index.css';

// Polyfill Buffer for client-side libraries (xlsx, docx)
globalThis.Buffer = Buffer;

import UpdateNotification from './components/UpdateNotification';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
            <UpdateNotification />
        </BrowserRouter>
    </React.StrictMode>
);
