import { Component, PropsWithChildren } from 'react';

import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import * as Routes from '~src/lib/routes';

import SkjemaelementFeilmelding from '../formElements/SkjemaelementFeilmelding';

import styles from './errorBoundary.module.less';

class ErrorBoundary extends Component<PropsWithChildren, { hasError: boolean; error?: Error; eventId?: string }> {
    constructor(props: PropsWithChildren) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.container}>
                    <SkjemaelementFeilmelding>En feil har oppstått.</SkjemaelementFeilmelding>
                    <LinkAsButton href={Routes.home.createURL()} variant="primary">
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
