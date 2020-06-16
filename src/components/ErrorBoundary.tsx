import React, { ErrorInfo } from 'react';
import { Feilmelding } from 'nav-frontend-typografi';
import Sentry from '@sentry/browser';
import styles from './errorBoundary.module.less';

class ErrorBoundary extends React.Component<unknown, { hasError: boolean; error?: Error; eventId?: string }> {
    constructor(props: unknown) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        console.log(error);
        return { hasError: true, error };
    }

    componentDidCatch(error: Error | null, errorInfo: ErrorInfo) {
        Sentry.withScope(scope => {
            scope.setExtras(errorInfo);
            const eventId = Sentry.captureException(error);
            this.setState({ eventId });
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.container}>
                    <Feilmelding>En feil har oppstått.</Feilmelding>
                    <a href="/" className="knapp knapp--hoved">
                        Tilbake
                    </a>
                    <hr />
                    <div>
                        Informasjon for utviklere:
                        <pre className={styles.stackTrace}>{this.state.error?.stack}</pre>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
