import { Alert } from '@navikt/ds-react';

import Toast, { ToastType, useToast } from './Toast';
import styles from './Toaster.module.less';

const Toaster = () => {
    const { toasts } = useToast();

    return (
        <ul className={styles.toasterContainer}>
            {toasts.map((t) => (
                <li key={t.id} className={styles.toastContainer}>
                    {getAlert(t)}
                </li>
            ))}
        </ul>
    );
};

const getAlert = (t: Toast) => {
    const message = Array.isArray(t.message) ? (
        <ul>
            {t.message.map((err) => (
                <li key={err}>{err}</li>
            ))}
        </ul>
    ) : (
        t.message
    );

    switch (t.type) {
        case ToastType.ERROR:
            return <Alert variant="error">{message}</Alert>;
        case ToastType.INFO:
            return <Alert variant="info">{message}</Alert>;
        case ToastType.SUCCESS:
            return <Alert variant="success">{message}</Alert>;
        case ToastType.WARNING:
            return <Alert variant="warning">{message}</Alert>;
    }
};

export default Toaster;
