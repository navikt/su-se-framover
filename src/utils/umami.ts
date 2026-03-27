export const loggUmamiEvent = (eventName: string, data: object) => {
    if (typeof window === 'undefined') return;

    const umamiWindow = window as unknown as { umami?: { track: (eventName: string, data: object) => void } };
    umamiWindow.umami?.track(eventName, data);
};
