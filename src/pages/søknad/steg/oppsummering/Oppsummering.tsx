import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe from 'nav-frontend-alertstriper';
import { Undertittel } from 'nav-frontend-typografi';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { Person } from '~api/personApi';
import * as innsendingSlice from '~features/søknad/innsending.slice';
import { useI18n } from '~lib/hooks';
import { trackEvent } from '~lib/tracking/amplitude';
import { søknadSendInn } from '~lib/tracking/trackingEvents';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';

import messages from './oppsummering-nb';
import styles from './oppsummering.module.less';
import Søknadoppsummering from './Søknadoppsummering/Søknadoppsummering';

const Oppsummering = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string; søker: Person }) => {
    const history = useHistory();
    const [søknadFraStore, innsending] = useAppSelector((s) => [s.soknad, s.innsending.søknad]);
    const { intl } = useI18n({ messages });
    const dispatch = useAppDispatch();

    const handleSubmit = async () => {
        const res = await dispatch(
            innsendingSlice.sendSøknad({
                søknad: søknadFraStore,
                søker: props.søker,
            })
        );
        if (innsendingSlice.sendSøknad.fulfilled.match(res)) {
            history.push(props.nesteUrl);
            trackEvent(søknadSendInn({ ident: props.søker.aktorId }));
        }
    };

    return (
        <div className={sharedStyles.container}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                <Søknadoppsummering søknad={søknadFraStore} søker={props.søker} />

                <div className={styles.meldFraOmEndringerContainer}>
                    <Undertittel>{intl.formatMessage({ id: 'meldFraOmEndringer.tittel' })}</Undertittel>
                    <p>{intl.formatMessage({ id: 'meldFraOmEndringer.tekst' })}</p>
                </div>

                {RemoteData.isFailure(innsending) && (
                    <AlertStripe className={styles.feilmelding} type="feil">
                        {intl.formatMessage({ id: 'feilmelding.innsendingFeilet' })}
                    </AlertStripe>
                )}

                <Bunnknapper
                    previous={{
                        onClick: () => {
                            history.push(props.forrigeUrl);
                        },
                    }}
                    next={{
                        label: <FormattedMessage id="steg.sendInn" />,
                        spinner: RemoteData.isPending(innsending),
                    }}
                    avbryt={{
                        toRoute: props.avbrytUrl,
                    }}
                />
            </form>
        </div>
    );
};

export default Oppsummering;
