/// <reference types="vite/client" />
import { UmamiData } from '~src/utils/umami.ts';

export {};

declare global {
    interface Window {
        umami?: {
            track: (eventName: string, data: UmamiData) => void;
        };
    }
}
