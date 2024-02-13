import { useEffect } from 'react';

import toastsSlice from '~src/features/ToastSlice';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';

export enum ToastType {
    SUCCESS = 'success',
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
}

export interface Toast {
    id: string;
    type: ToastType;
    message: string | string[];
    duration: number;
    createdAt: number;
}

export const createToast = (args: { type: ToastType; message: string | string[]; duration?: number }): Toast => {
    const { type, message, duration = 5000 } = args;

    return {
        id: Math.random().toString(),
        type: type,
        message: message,
        duration: duration,
        createdAt: Date.now(),
    };
};

export const useToast = () => {
    const dispatch = useAppDispatch();
    const { toasts } = useAppSelector((s) => s.toast);

    const insert = (toast: Toast) => dispatch(toastsSlice.actions.insert(toast));

    useEffect(() => {
        const now = Date.now();
        const timeouts = toasts.map((t) => {
            if (t.duration === Infinity) {
                return;
            }

            const durationLeft = t.duration - (now - t.createdAt);
            return setTimeout(() => dispatch(toastsSlice.actions.remove(t)), durationLeft);
        });

        return () => {
            timeouts.forEach((timeout) => timeout && clearTimeout(timeout));
        };
    }, [toasts]);

    return { insert, toasts };
};

export default Toast;
