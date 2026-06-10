import type { FrontendConfig } from '~src/types/FrontendConfig';

export async function fetchFrontendConfig(): Promise<FrontendConfig> {
    const res = await fetch('/frontend-config', {
        headers: {
            Accept: 'application/json',
        },
    });

    if (!res.ok) {
        throw new Error(`Kunne ikke hente frontend-config. Status: ${res.status}`);
    }

    return res.json() as Promise<FrontendConfig>;
}
