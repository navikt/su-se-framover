import type { UmamiData } from '../types/umami';

export const loggUmamiEvent = (eventName: string, data: UmamiData) => {
    if (typeof window === 'undefined') return;
    window.umami?.track(eventName, data);
};
