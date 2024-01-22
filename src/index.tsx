import * as Sentry from '@sentry/browser';
import { createRoot } from 'react-dom/client';

import polyfill from './polyfills';
import Root from './Root';

polyfill().then(() => {
    if (process.env.NODE_ENV !== 'development') {
        Sentry.init({
            dsn: 'https://86e03156def1405889ca142c2f08bdd8@sentry.gc.nav.no/34',
            environment: window.location.hostname,
            release: process.env.SENTRY_RELEASE || 'unknown',
            integrations: [new Sentry.Integrations.Breadcrumbs({ console: false })],
            autoSessionTracking: false,
        });
    }
    const container: HTMLElement | null = document.getElementById('root');

    if (container) {
        const root = createRoot(container);
        // TODO jah: Legg på React.StrictMode?
        root.render(<Root />);
    }
});

// TODO jah: Hot reloading
