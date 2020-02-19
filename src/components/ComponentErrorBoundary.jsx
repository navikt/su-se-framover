import React from 'react';
import { Feilmelding } from 'nav-frontend-typografi';
import RouteErrors from './RouteErrors';

class ComponentErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={globalErrorPageStyle}>
                    <Feilmelding>En feil har oppstått.</Feilmelding>
                    <RouteErrors state={this.state} />
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

export default ComponentErrorBoundary;
