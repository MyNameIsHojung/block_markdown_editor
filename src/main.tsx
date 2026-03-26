import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './theme/ThemeProvider';
import { EditorProvider } from './store/editorStore';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <EditorProvider>
        <App />
      </EditorProvider>
    </ThemeProvider>
  </StrictMode>
);
