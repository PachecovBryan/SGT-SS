import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MantineProvider, createTheme, localStorageColorSchemeManager } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'sgt-color-scheme',
});

const theme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand: [
      '#eef3ff', '#dce4f5', '#b9c7e2', '#94a8d0', '#748dc1', 
      '#5f7cb8', '#5474b4', '#44639f', '#39588f', '#2d4b82',
    ],
  },

  components: {
    Button: { defaultProps: { size: 'md', radius: 'md' } },
    TextInput: { defaultProps: { radius: 'md' } },
    Paper: { defaultProps: { withBorder: true } }, 
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MantineProvider theme={theme} colorSchemeManager={colorSchemeManager}>
          <Notifications position="top-right" />
          <ModalsProvider>
            <App />
          </ModalsProvider>
        </MantineProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);