import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Importing Lucide icons used across the application
import { 
  AlertTriangle, 
  ClipboardCheck, 
  Activity,
  Home, 
  Bell, 
  User,
  Settings, 
  HelpCircle
} from 'lucide-react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);