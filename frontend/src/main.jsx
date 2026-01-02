import React from 'react'
import ReactDOM from 'react-dom/client'
// Import sans extension pour une meilleure compatibilité, ou avec .jsx si le fichier est présent
import App from './App' 
import './index.css'
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)