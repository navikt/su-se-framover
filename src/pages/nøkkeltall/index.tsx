import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Button, Heading, Label, Loader, Panel } from '@navikt/ds-react';
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

import SkjemaelementFeilmelding from '../../components/formElements/SkjemaelementFeilmelding';

import styles from './index.module.less';
import messages from './nøkkeltall-nb';

const Rad = ({ label, verdi }: { label: string; verdi: number }) => (
    <li className={styles.item}>
        <Label>{`${label}:`}</Label>
        <BodyShort>{verdi}</BodyShort>
    </li>
);

const TilbakeKnapp = ({ onClick, label }: { label: string; onClick: () => void }) => (
    <Button className={styles.tilbakeKnapp} variant="secondary" onClick={onClick} type="button">
        {label}
    </Button>
);

const NøkkelTall = () => {
    const [nøkkeltallStatus, fetchNøkkeltall] = useApiCall(hentNøkkeltall);
    const { formatMessage } = useI18n({ messages });
    const history = useHistory();

    useEffect(() => {
        fetchNøkkeltall({});
    }, []);

    return pipe(
        nøkkeltallStatus,
        RemoteData.fold(
            () => <Loader />,
            () => <Loader />,
            () => (
                <div className={styles.container}>
                    <SkjemaelementFeilmelding>{formatMessage('ukjentFeil')}</SkjemaelementFeilmelding>
                    <TilbakeKnapp label={formatMessage('knapp.tilbake')} onClick={history.goBack} />
                </div>
            ),
            (nøkkeltall) => (
                <div className={styles.container}>
                    <Oppsummeringspanel
                        ikon={Oppsummeringsikon.Liste}
                        farge={Oppsummeringsfarge.Grønn}
                        tittel={formatMessage('oppsummering.tittel')}
                    >
                        <Heading level="2" size="medium">
                            {formatMessage('søknader.tittel')}
                        </Heading>
                        <Panel border className={styles.panel}>
                            <ul className={styles.list}>
                                <Rad
                                    label={formatMessage('søknader.iverksatt.innvilget')}
                                    verdi={nøkkeltall.søknader.iverksatteInnvilget}
                                />
                                <Rad
                                    label={formatMessage('søknader.iverksatt.avslag')}
                                    verdi={nøkkeltall.søknader.iverksatteAvslag}
                                />
                                <Rad label={formatMessage('søknader.påbegynt')} verdi={nøkkeltall.søknader.påbegynt} />
                                <Rad
                                    label={formatMessage('søknader.ikkePåbegynt')}
                                    verdi={nøkkeltall.søknader.ikkePåbegynt}
                                />
                                <Rad
                                    label={formatMessage('søknader.digital')}
                                    verdi={nøkkeltall.søknader.digitalsøknader}
                                />
                                <Rad
                                    label={formatMessage('søknader.papir')}
                                    verdi={nøkkeltall.søknader.papirsøknader}
                                />
                            </ul>
                        </Panel>
                        <Heading level="2" size="medium">
                            {formatMessage('personer.tittel')}
                        </Heading>
                        <Panel border className={styles.panel}>
                            <ul className={styles.list}>
                                <Rad label={formatMessage('personer.antall')} verdi={nøkkeltall.antallUnikePersoner} />
                                <Rad label={formatMessage('saker.løpende')} verdi={nøkkeltall.løpendeSaker} />
                            </ul>
                        </Panel>
                    </Oppsummeringspanel>
                    <TilbakeKnapp label={formatMessage('knapp.tilbake')} onClick={history.goBack} />
                </div>
            )
        )
    );
};

export default NøkkelTall;
