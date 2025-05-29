// Import our temporary environment configuration first
import './tempEnvConfig';

import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { StagewiseToolbar } from '@stagewise/toolbar-react';

// Stagewise configuration
const stagewiseConfig = {
  plugins: []
};

// Only include StagewiseToolbar in development
const ToolbarWrapper = import.meta.env.DEV ? () => (
  <StagewiseToolbar config={stagewiseConfig} />
) : () => null;

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <ToolbarWrapper />
  </React.StrictMode>,
)
