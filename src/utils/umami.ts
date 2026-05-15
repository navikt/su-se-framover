type UmamiValue = string | number | boolean | null;
export type UmamiData = Record<string, UmamiValue>;

export const loggUmamiEvent = (eventName: string, data: UmamiData) => {
    if (typeof window === 'undefined') return;

    window.umami?.track(eventName, data);
};
