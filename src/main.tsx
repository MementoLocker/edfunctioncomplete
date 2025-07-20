import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './hooks/useAuth'; // Import the AuthProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider> {/* Wrap the entire App with AuthProvider */}
      <App />
    </AuthProvider>
  </StrictMode>
);
