import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Buffer } from 'buffer';
import App from './App';
import './index.css';

// Polyfill Buffer for client-side libraries (xlsx, docx)
globalThis.Buffer = Buffer;

import UpdateNotification from './components/UpdateNotification';
import { NotificationProvider } from './lib/notifications';
import { OnboardingProvider } from './components/OnboardingTour';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <NotificationProvider>
                <OnboardingProvider>
                    <App />
                    <UpdateNotification />
                </OnboardingProvider>
            </NotificationProvider>
        </BrowserRouter>
    </React.StrictMode>
);
