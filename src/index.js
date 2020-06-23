import React from 'react';
import { render } from 'react-dom';
import Root from './Root';
import * as Sentry from '@sentry/browser';

Sentry.init({
    dsn: 'https://86e03156def1405889ca142c2f08bdd8@sentry.gc.nav.no/34',
    environment: window.location.hostname,
    integrations: [new Sentry.Integrations.Breadcrumbs({ console: false })],
});

render(<Root />, document.getElementById('root'));

/* eslint-disable no-undef */
if (module.hot) {
    module.hot.accept();
}
/* eslint-enable */
