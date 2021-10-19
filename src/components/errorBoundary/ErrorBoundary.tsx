import * as Sentry from '@sentry/browser';
import React, { ErrorInfo } from 'react';

import LinkAsButton from '~components/linkAsButton/LinkAsButton';

import SkjemaelementFeilmelding from '../formElements/SkjemaelementFeilmelding';

import styles from './errorBoundary.module.less';

class ErrorBoundary extends React.Component<unknown, { hasError: boolean; error?: Error; eventId?: string }> {
    constructor(props: unknown) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error | null, errorInfo: ErrorInfo) {
        Sentry.withScope((scope) => {
            scope.setExtras({ errorInfo });
            const eventId = Sentry.captureException(error);
            this.setState({ eventId });
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.container}>
                    <SkjemaelementFeilmelding>En feil har oppstått.</SkjemaelementFeilmelding>
                    <LinkAsButton href="/" variant="primary">
                        Tilbake
                    </LinkAsButton>
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
