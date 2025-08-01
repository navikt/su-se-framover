import { Component, ErrorInfo, PropsWithChildren } from 'react';
import StackTrace from 'stacktrace-js';

import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types.ts';

import SkjemaelementFeilmelding from '../formElements/SkjemaelementFeilmelding';

import styles from './errorBoundary.module.less';

interface ErrorBoundaryState {
    hasError: boolean;
    errorInfo?: {
        componentStack?: Nullable<string>;
        mappedStack: string;
    } | null;
}

class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
    constructor(props: PropsWithChildren) {
        super(props);
        this.state = { hasError: false, errorInfo: undefined };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        StackTrace.fromError(error).then((frames) => {
            const mapped = frames.map((f) => f.toString()).join('\n');
            this.setState({ errorInfo: { componentStack: errorInfo.componentStack, mappedStack: mapped } });
        });
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
                    {this.state.errorInfo && (
                        <div>
                            Informasjon for utviklere:
                            <pre className={styles.stackTrace}>{this.state.errorInfo.mappedStack}</pre>
                        </div>
                    )}
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
