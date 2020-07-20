import * as React from 'react';
import AlertStripe from 'nav-frontend-alertstriper';
import { useAppSelector } from '~redux/Store';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { useI18n } from '~lib/hooks';

const messages = {
    'kvittering.søknadSendt': 'Søknaden er sendt!',
};

const Kvittering = () => {
    const intl = useI18n({ messages });
    const innsending = useAppSelector((s) => s.innsending);

    return (
        <div>
            {innsending.sendingInProgress ? <NavFrontendSpinner /> : ''}
            {innsending.error ? <AlertStripe type="feil">{innsending.error.message}</AlertStripe> : ''}
            {innsending.søknadSendt && !innsending.error ? (
                <AlertStripe type="suksess"> {intl.formatMessage({ id: 'kvittering.søknadSendt' })}</AlertStripe>
            ) : (
                ''
            )}
        </div>
    );
};

export default Kvittering;
