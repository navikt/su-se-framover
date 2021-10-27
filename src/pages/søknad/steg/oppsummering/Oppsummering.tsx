import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyLong, Heading } from '@navikt/ds-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { Person } from '~api/personApi';
import * as innsendingSlice from '~features/søknad/innsending.slice';
import { useI18n } from '~lib/i18n';
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

                <Alert variant="info" className={styles.meldFraOmEndringerContainer}>
                    <Heading level="2" size="medium" spacing>
                        {intl.formatMessage({ id: 'meldFraOmEndringer.tittel' })}
                    </Heading>
                    <BodyLong>{intl.formatMessage({ id: 'meldFraOmEndringer.tekst' })}</BodyLong>
                </Alert>

                {RemoteData.isFailure(innsending) && (
                    <Alert className={styles.feilmelding} variant="error">
                        {intl.formatMessage({ id: 'feilmelding.innsendingFeilet' })}
                    </Alert>
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
