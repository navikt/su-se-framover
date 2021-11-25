import { Alert, Heading } from '@navikt/ds-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { Person } from '~api/personApi';
import OppsummeringAvKlage from '~components/oppsummeringAvKlage/OppsummeringAvKlage';
import Personlinje from '~components/personlinje/Personlinje';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Klage } from '~types/Klage';
import { Vedtak } from '~types/Vedtak';

import sharedStyles from '../sharedStyles.module.less';

import messages from './attesterKlage-nb';
import styles from './attesterKlage.module.less';
const AttesterKlage = (props: {
    sakInfo: { sakId: string; saksnummer: number };
    søker: Person;
    klager: Klage[];
    vedtaker: Vedtak[];
}) => {
    const { formatMessage } = useI18n({ messages });
    const urlParams = Routes.useRouteParams<typeof Routes.attesterKlage>();

    const klage = props.klager.find((k) => k.id === urlParams.klageId);

    const klagensVedtak = props.vedtaker.find((v) => v.id === klage?.vedtakId);

    //const [iverksettStatus, iverksettKlage] = useAsyncActionCreator(klageActions.sendTilAttestering);
    //const [underkjennStatus, underkjenn] = useAsyncActionCreator(klageActions.sendTilAttestering);

    if (!klagensVedtak || !klage) {
        return (
            <div className={styles.fantIkkevedtakFeilContainer}>
                <Alert variant="error">{formatMessage('feil.fantIkkeKlageEllerVedtakensKlage')}</Alert>
                <Link
                    to={Routes.saksoversiktValgtSak.createURL({
                        sakId: props.sakInfo.sakId,
                    })}
                >
                    {formatMessage('knapp.tilbake')}
                </Link>
            </div>
        );
    }
    return (
        <div className={sharedStyles.container}>
            <Personlinje søker={props.søker} sakInfo={props.sakInfo} />
            <Heading level="1" size="xlarge" className={sharedStyles.tittel}>
                {formatMessage('page.tittel')}
            </Heading>
            <div className={styles.oppsummeringOgKnapperContainer}>
                <OppsummeringAvKlage klage={klage} klagensVedtak={klagensVedtak} />
            </div>
        </div>
    );
};

export default AttesterKlage;
