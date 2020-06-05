import React from 'react';
import { Feilmelding } from 'nav-frontend-typografi';
import Sentry from '@sentry/browser';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        console.log(error);
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        Sentry.withScope(scope => {
            scope.setExtras(errorInfo);
            const eventId = Sentry.captureException(error);
            this.setState({ eventId });
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={globalErrorPageStyle}>
                    <Feilmelding>En feil har oppstått.</Feilmelding>
                    <a href="/" className="knapp knapp--hoved">
                        Tilbake
                    </a>
                    <hr />
                    <div>
                        Informasjon for utviklere:
                        <pre style={stackTraceStyle}>{this.state.error.stack}</pre>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const globalErrorPageStyle = {
    margin: '4em 3em'
};
const stackTraceStyle = {
    marginTop: '1em',
    fontFamily: 'Consolas, monospace'
};

export default ErrorBoundary;
