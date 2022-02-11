import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Label, Loader } from '@navikt/ds-react';
import React, { useEffect } from 'react';

import { pipe } from '~/lib/fp';
import { hentNøkkeltall } from '~api/nøkkeltallApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { useApiCall } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { brukere, ferdigBehandlet, ikkeFerdigbehandlet, søknader } from '~utils/nøkkeltall/nøkkeltallUtils';

import messages from './nøkkeltall-nb';
import styles from './nøkkeltall.module.less';

const Rad = ({ label, verdi, bold = false }: { label: string; verdi: number; bold?: boolean }) => (
    <li className={styles.item}>
        <Label className={bold ? styles.bold : styles.normal}>{label}</Label>
        <BodyShort className={styles.bold}>{verdi}</BodyShort>
    </li>
);

const Nøkkeltall = () => {
    const [nøkkeltallStatus, fetchNøkkeltall] = useApiCall(hentNøkkeltall);
    const { formatMessage } = useI18n({ messages });

    useEffect(() => {
        fetchNøkkeltall({});
    }, []);

    return pipe(
        nøkkeltallStatus,
        RemoteData.fold(
            () => <Loader />,
            () => <Loader />,
            (error) => <ApiErrorAlert error={error} />,
            (nøkkeltall) => (
                <div className={styles.nøkkeltall}>
                    <ul className={styles.list}>
                        <Rad
                            bold
                            label={formatMessage('ferdigBehandlede')}
                            verdi={ferdigBehandlet(nøkkeltall.søknader)}
                        />
                        <Rad label={formatMessage('innvilgede')} verdi={nøkkeltall.søknader.iverksatteInnvilget} />
                        <Rad label={formatMessage('avslåtteSøknader')} verdi={nøkkeltall.søknader.iverksatteAvslag} />
                        <Rad label={formatMessage('lukkede')} verdi={nøkkeltall.søknader.lukket} />
                    </ul>
                    <ul className={styles.list}>
                        <Rad
                            bold
                            label={formatMessage('ikkeFerdigBehandlede')}
                            verdi={ikkeFerdigbehandlet(nøkkeltall.søknader)}
                        />
                        <Rad label={formatMessage('påbegynte')} verdi={nøkkeltall.søknader.påbegynt} />
                        <Rad label={formatMessage('ikkePåbegynte')} verdi={nøkkeltall.søknader.ikkePåbegynt} />
                    </ul>
                    <ul className={styles.list}>
                        <Rad bold label={formatMessage('søknader')} verdi={søknader(nøkkeltall.søknader)} />
                        <Rad label={formatMessage('digital')} verdi={nøkkeltall.søknader.digitalsøknader} />
                        <Rad label={formatMessage('papir')} verdi={nøkkeltall.søknader.papirsøknader} />
                    </ul>
                    <ul className={styles.list}>
                        <Rad bold label={formatMessage('brukere')} verdi={brukere(nøkkeltall)} />
                        <Rad label={formatMessage('antallPersoner')} verdi={nøkkeltall.antallUnikePersoner} />
                        <Rad label={formatMessage('løpendeSaker')} verdi={nøkkeltall.løpendeSaker} />
                    </ul>
                </div>
            )
        )
    );
};

export default Nøkkeltall;
