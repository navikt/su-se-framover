type UmamiValue = string | number | boolean | null;
type UmamiData = Record<string, UmamiValue>;

export const loggUmamiEvent = (eventName: string, data: UmamiData) => {
    if (typeof window === 'undefined') return;

    const umamiWindow = window as unknown as { umami?: { track: (eventName: string, data: object) => void } };
    umamiWindow.umami?.track(eventName, data);
};
