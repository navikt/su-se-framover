import { RefObject } from 'react';

export function focusAfterTimeout(ref: RefObject<HTMLDivElement | null>) {
    return () => {
        setTimeout(() => {
            ref.current?.focus();
        }, 0);
    };
}
