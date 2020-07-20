import * as React from 'react';
import AlertStripe from 'nav-frontend-alertstriper';
import { useAppSelector } from '~redux/Store';

import NavFrontendSpinner from 'nav-frontend-spinner';

const Kvittering = () => {
    const innsending = useAppSelector((s) => s.innsending);

    return (
        <div>
            {innsending.sendingInProgress ? <NavFrontendSpinner /> : ''}
            {innsending.error ? <AlertStripe type="feil">{innsending.error}</AlertStripe> : ''}
            {!innsending.sendingInProgress && !innsending.error ? (
                <AlertStripe type="suksess">Søknaden er sendt!</AlertStripe>
            ) : (
                ''
            )}
        </div>
    );
};

export default Kvittering;
