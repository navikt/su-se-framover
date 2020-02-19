import React from 'react';
import { useHistory } from 'react-router-dom';
import { Hovedknapp } from 'nav-frontend-knapper';
function RouteErrors({ state }) {
    const history = useHistory();
    return (
        <>
            <Hovedknapp
                onClick={() => {
                    state.hasError = false;
                    history.goBack();
                }}
            >
                Tilbake
            </Hovedknapp>
        </>
    );
}
export default RouteErrors;
