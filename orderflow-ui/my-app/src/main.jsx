import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import {BrowserRouter} from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode>
      <Toaster position="bottom-right" theme="dark" richColors />
      <App />
    </StrictMode>
  </BrowserRouter>,
)
