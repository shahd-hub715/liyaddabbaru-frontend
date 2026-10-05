import { createRoot } from 'react-dom/client';
import './styles/app.css';
import { App } from './App';
import { startSync } from './lib/sync';

createRoot(document.getElementById('app')!).render(<App />);
startSync();
