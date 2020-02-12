import React from 'react';
import { render } from 'react-dom';
import Root from './components/Root.jsx';

render(<Root />, document.getElementById('root'));

/* eslint-disable no-undef */
if (module.hot) {
    module.hot.accept();
}
/* eslint-enable */
