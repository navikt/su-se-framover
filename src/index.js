import * as Sentry from '@sentry/browser';
import * as React from 'react';
import { render } from 'react-dom';

import * as Amplitude from '~lib/tracking/amplitude';

import Root from './Root';

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV !== 'development') {
    Sentry.init({
        dsn: 'https://86e03156def1405889ca142c2f08bdd8@sentry.gc.nav.no/34',
        environment: window.location.hostname,
        integrations: [new Sentry.Integrations.Breadcrumbs({ console: false })],
    });
}

Amplitude.init();

render(<Root />, document.getElementById('root'));

/* eslint-disable no-undef */
if (module.hot) {
    module.hot.accept();
}
/* eslint-enable */
