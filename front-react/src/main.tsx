import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';

// import './index.css'
// import './layout.css'
// import './style.css'
// import App from './App.tsx'
import Layout from './Layout.tsx'
import Manage from './Manage.tsx';
import Mail from './Mail.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Mailbox from './Mailbox.tsx';
import TopBarAddress from './TopBarAddress.tsx';
import { WebSocketNotificationProvider } from './WebSocketNotificationProvider.tsx';
import TopBarSettings from './TopBarSettings.tsx';

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

// Renamed from root to app for css compatability
createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <ThemeProvider theme={theme} noSsr >
      <CssBaseline />
      <WebSocketNotificationProvider>
        <QueryClientProvider client={queryClient}>
          {/* <App /> */}
          <Router>
            <Routes>
              <Route path="/" element={<Layout bodyChildren={<Mailbox />} topBarChildren={<TopBarAddress />} />} />
              <Route path="/manage" element={<Layout bodyChildren={<Manage />} topBarChildren={<TopBarSettings/>} />} />
              <Route path="/mail/:messageId" element={<Layout bodyChildren={<Mail />} topBarChildren={<TopBarAddress />} />} />
              <Route path="/inbox/:address" element={<Layout bodyChildren={<Mailbox />} topBarChildren={<TopBarAddress />} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </QueryClientProvider>
      </WebSocketNotificationProvider>
    </ThemeProvider>
  </StrictMode>,
)
