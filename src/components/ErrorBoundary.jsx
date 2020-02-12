import React from 'react';
import { Feilmelding, Normaltekst } from 'nav-frontend-typografi';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        console.log(error);
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={globalErrorPageStyle}>
                    <Feilmelding>En feil har oppstått.</Feilmelding>
                    <Normaltekst>
                        Trykk <a href="/">her</a> for å komme tilbake til startsiden.
                    </Normaltekst>
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
