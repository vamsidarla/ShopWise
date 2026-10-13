import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './insights.css';
import './shopwise-ui.css'; // must stay last so it overrides legacy rules
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);