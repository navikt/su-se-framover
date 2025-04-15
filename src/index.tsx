import { createRoot } from 'react-dom/client';

import polyfill from './polyfills';
import Root from './Root';

polyfill().then(() => {
    const container: HTMLElement | null = document.getElementById('root');

    if (container) {
        const root = createRoot(container);
        // TODO jah: Legg på React.StrictMode?
        root.render(<Root />);
    }
});

// TODO jah: Hot reloading
