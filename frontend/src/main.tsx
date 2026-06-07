import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.scss';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext'; // Assuming ThemeProvider comes from here

// Mount the full React app
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </ThemeProvider>
    </StrictMode>,
  )
} else {
  console.error('Root element not found');
}
