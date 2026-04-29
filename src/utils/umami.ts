import Store from '~src/redux/Store';

type UmamiValue = string | number | boolean | null;
export type UmamiData = Record<string, UmamiValue>;

const UMAMI_SCRIPT_ID = 'umami-script';

export const initUmami = () => {
    if (typeof window === 'undefined') return;

    const umamiConfig = Store.getState().frontendConfig.config.umami;

    if (!umamiConfig) return;
    if (document.getElementById(UMAMI_SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = UMAMI_SCRIPT_ID;
    script.defer = true;
    script.src = umamiConfig.scriptUrl;
    script.dataset.hostUrl = umamiConfig.hostUrl;
    script.dataset.websiteId = umamiConfig.websiteId;

    document.head.appendChild(script);
};

export const loggUmamiEvent = (eventName: string, data: UmamiData) => {
    if (typeof window === 'undefined') return;

    initUmami();
    window.umami?.track(eventName, data);
};
