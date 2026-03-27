/// <reference types="vite/client" />
import type { UmamiData } from '~src/types/umami.ts';

export {};
declare global {
    interface Window {
        umami?: {
            track: (eventName: string, data: UmamiData) => void;
        };
    }
}
