import { RefObject } from 'react';

export function focusAfterTimeout(ref: RefObject<HTMLDivElement>) {
    return () => {
        setTimeout(() => {
            ref.current?.focus();
        }, 0);
    };
}
