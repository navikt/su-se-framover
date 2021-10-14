import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Loader, Panel } from '@navikt/ds-react';
import { Feilmelding, Ingress, Normaltekst, Element } from 'nav-frontend-typografi';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router';

import { pipe } from '~/lib/fp';
import { hentNøkkeltall } from '~api/nøkkeltallApi';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~components/revurdering/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { useApiCall } from '~lib/hooks';
import { useI18n } from '~lib/i18n';

import styles from './index.module.less';
import messages from './nøkkeltall-nb';

const NøkkelTall = () => {
    const [nøkkeltallStatus, fetchNøkkeltall] = useApiCall(hentNøkkeltall);
    const { intl } = useI18n({ messages });
    const history = useHistory();

    useEffect(() => {
        fetchNøkkeltall({});
    }, []);

    const Rad = ({ messageId, verdi }: { messageId: string; verdi: number }) => (
        <li className={styles.item}>
            <Element>{`${intl.formatMessage({ id: messageId })}:`}</Element>
            <Normaltekst>{verdi}</Normaltekst>
        </li>
    );

    const TilbakeKnapp = () => (
        <Button className={styles.tilbakeKnapp} variant="secondary" onClick={history.goBack} type="button">
            {intl.formatMessage({ id: 'knapp.tilbake' })}
        </Button>
    );

    return pipe(
        nøkkeltallStatus,
        RemoteData.fold(
            () => <Loader />,
            () => <Loader />,
            () => (
                <div className={styles.container}>
                    <Feilmelding>{intl.formatMessage({ id: 'ukjentFeil' })}</Feilmelding>
                    <TilbakeKnapp />
                </div>
            ),
            (nøkkeltall) => (
                <div className={styles.container}>
                    <Oppsummeringspanel
                        ikon={Oppsummeringsikon.Liste}
                        farge={Oppsummeringsfarge.Grønn}
                        tittel={'Nøkkeltall'}
                    >
                        <Ingress>{intl.formatMessage({ id: 'søknader.tittel' })}</Ingress>
                        <Panel border className={styles.panel}>
                            <div>
                                <ul className={styles.list}>
                                    <Rad
                                        messageId="søknader.iverksatt.innvilget"
                                        verdi={nøkkeltall.søknader.iverksatteInnvilget}
                                    />
                                    <Rad
                                        messageId="søknader.iverksatt.avslag"
                                        verdi={nøkkeltall.søknader.iverksatteInnvilget}
                                    />
                                    <Rad messageId="søknader.påbegynt" verdi={nøkkeltall.søknader.påbegynt} />
                                    <Rad messageId="søknader.ikkePåbegynt" verdi={nøkkeltall.søknader.ikkePåbegynt} />
                                    <Rad messageId="søknader.digital" verdi={nøkkeltall.søknader.digitalsøknader} />
                                    <Rad messageId="søknader.papir" verdi={nøkkeltall.søknader.papirsøknader} />
                                </ul>
                            </div>
                        </Panel>

                        <Ingress>{intl.formatMessage({ id: 'personer.tittel' })}</Ingress>
                        <Panel border className={styles.panel}>
                            <ul className={styles.list}>
                                <Rad messageId="personer.antal" verdi={nøkkeltall.antallUnikePersoner} />
                            </ul>
                        </Panel>
                    </Oppsummeringspanel>
                    <TilbakeKnapp />
                </div>
            )
        )
    );
};

export default NøkkelTall;
