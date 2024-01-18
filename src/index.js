import * as Sentry from '@sentry/browser';
import { createRoot } from 'react-dom/client';

import polyfill from './polyfills';
import Root from './Root';

polyfill().then(() => {
    // eslint-disable-next-line no-undef
    if (process.env.NODE_ENV !== 'development') {
        Sentry.init({
            dsn: 'https://86e03156def1405889ca142c2f08bdd8@sentry.gc.nav.no/34',
            environment: window.location.hostname,
            // eslint-disable-next-line no-undef
            release: process.env.SENTRY_RELEASE || 'unknown',
            integrations: [new Sentry.Integrations.Breadcrumbs({ console: false })],
            autoSessionTracking: false,
        });
    }
    const container = document.getElementById('root');

    const root = createRoot(container);
    root.render(<Root />);
});

/* eslint-disable no-undef */
if (module.hot) {
    // https://parceljs.org/features/development#hot-reloading
    module.hot.accept();
}
/* eslint-enable */
