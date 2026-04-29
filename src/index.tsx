import { createRoot } from 'react-dom/client';

import { fetchFrontendConfig } from '~src/api/frontendConfigApi';
import frontendConfigSlice from '~src/features/frontendConfig/frontendConfig.slice';
import Store from '~src/redux/Store';
import { initUmami } from '~src/utils/umami';

import polyfill from './polyfills';
import Root from './Root';

async function setupFrontendConfig() {
    try {
        const frontendConfig = await fetchFrontendConfig();
        Store.dispatch(frontendConfigSlice.actions.setFrontendConfig(frontendConfig));
    } catch (_error) {
        Store.dispatch(
            frontendConfigSlice.actions.setFrontendConfig({
                environment: 'unknown',
            }),
        );
    }
}

polyfill().then(async () => {
    await setupFrontendConfig();
    initUmami();

    const container: HTMLElement | null = document.getElementById('root');

    if (container) {
        const root = createRoot(container);
        // TODO jah: Legg på React.StrictMode?
        root.render(<Root />);
    }
});

// TODO jah: Hot reloading
