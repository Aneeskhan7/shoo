import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App';
import './styles/globals.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* Admin's own usage (testing, managing products/orders) was mixing
        into the same visitor/page-view numbers as real shoppers, skewing
        the whole dashboard. beforeSend returning null drops the event
        entirely instead of sending it. */}
    <Analytics beforeSend={(event) => (event.url.includes('/admin') ? null : event)} />
    <SpeedInsights />
  </StrictMode>,
);
