import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Label, Loader } from '@navikt/ds-react';
import { useEffect } from 'react';

import { hentNøkkeltall } from '~src/api/nøkkeltallApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Sakstype } from '~src/types/Sak.ts';
import { ferdigBehandlet, ikkeFerdigbehandlet, søknader } from '~src/utils/nøkkeltall/nøkkeltallUtils';

import messages from './nøkkeltall-nb';
import styles from './nøkkeltall.module.less';

const Rad = ({ label, verdi, bold = false }: { label: string; verdi: string; bold?: boolean }) => (
    <li className={styles.item}>
        <Label className={bold ? styles.bold : styles.normal}>{label}</Label>
        {verdi && <BodyShort className={bold ? styles.bold : styles.normal}>{verdi}</BodyShort>}
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
            (nøkkeltall) => {
                const nøkkelTallForUføre = nøkkeltall.find((n) => n.sakstype === Sakstype.Uføre)!;
                const nøkkelTallForAlder = nøkkeltall.find((n) => n.sakstype === Sakstype.Alder)!;
                return (
                    <div className={styles.nøkkeltall}>
                        <ul className={styles.list}>
                            <Rad
                                bold
                                label={formatMessage('ferdigBehandlede')}
                                verdi={ferdigBehandlet(nøkkelTallForUføre.søknader, nøkkelTallForAlder.søknader)}
                            />
                            <Rad
                                label={formatMessage('innvilgede')}
                                verdi={`${nøkkelTallForUføre.søknader.iverksatteInnvilget + nøkkelTallForAlder.søknader.iverksatteInnvilget} (Uføre: ${nøkkelTallForUføre.søknader.iverksatteInnvilget} Alder: ${nøkkelTallForAlder.søknader.iverksatteInnvilget})`}
                            />
                            <Rad
                                label={formatMessage('avslåtteSøknader')}
                                verdi={`${nøkkelTallForUføre.søknader.iverksatteAvslag + nøkkelTallForAlder.søknader.iverksatteAvslag} (Uføre: ${nøkkelTallForUføre.søknader.iverksatteAvslag} Alder: ${nøkkelTallForAlder.søknader.iverksatteAvslag})`}
                            />
                            <Rad
                                label={formatMessage('lukkede')}
                                verdi={`${nøkkelTallForUføre.søknader.lukket + nøkkelTallForAlder.søknader.lukket} (Uføre: ${nøkkelTallForUføre.søknader.lukket} Alder: ${nøkkelTallForAlder.søknader.lukket})`}
                            />
                        </ul>
                        <ul className={styles.list}>
                            <Rad
                                bold
                                label={formatMessage('ikkeFerdigBehandlede')}
                                verdi={ikkeFerdigbehandlet(nøkkelTallForUføre.søknader, nøkkelTallForAlder.søknader)}
                            />
                            <Rad
                                label={formatMessage('påbegynte')}
                                verdi={`${nøkkelTallForUføre.søknader.påbegynt + nøkkelTallForAlder.søknader.påbegynt} (Uføre: ${nøkkelTallForUføre.søknader.påbegynt} Alder: ${nøkkelTallForAlder.søknader.påbegynt})`}
                            />
                            <Rad
                                label={formatMessage('ikkePåbegynte')}
                                verdi={`${nøkkelTallForUføre.søknader.ikkePåbegynt + nøkkelTallForAlder.søknader.ikkePåbegynt} (Uføre: ${nøkkelTallForUføre.søknader.ikkePåbegynt} Alder: ${nøkkelTallForAlder.søknader.ikkePåbegynt})`}
                            />
                        </ul>
                        <ul className={styles.list}>
                            <Rad
                                bold
                                label={formatMessage('søknader')}
                                verdi={søknader(nøkkelTallForUføre.søknader, nøkkelTallForAlder.søknader)}
                            />
                            <Rad
                                label={formatMessage('digital')}
                                verdi={`${nøkkelTallForUføre.søknader.digitalsøknader + nøkkelTallForAlder.søknader.digitalsøknader} (Uføre: ${nøkkelTallForUføre.søknader.digitalsøknader} Alder: ${nøkkelTallForAlder.søknader.digitalsøknader})`}
                            />
                            <Rad
                                label={formatMessage('papir')}
                                verdi={`${nøkkelTallForUføre.søknader.papirsøknader + nøkkelTallForAlder.søknader.papirsøknader} (Uføre: ${nøkkelTallForUføre.søknader.papirsøknader} Alder: ${nøkkelTallForAlder.søknader.papirsøknader})`}
                            />
                        </ul>
                        <ul className={styles.list}>
                            <Rad bold label={formatMessage('brukere')} verdi={''} />
                            <Rad
                                label={formatMessage('antallPersoner')}
                                verdi={`${nøkkelTallForUføre.antallUnikePersoner + nøkkelTallForAlder.antallUnikePersoner} (Uføre: ${nøkkelTallForUføre.antallUnikePersoner} Alder: ${nøkkelTallForAlder.antallUnikePersoner})`}
                            />
                            <Rad
                                label={formatMessage('løpendeSaker')}
                                verdi={`${nøkkelTallForUføre.løpendeSaker + nøkkelTallForAlder.løpendeSaker} (Uføre: ${nøkkelTallForUføre.løpendeSaker} Alder: ${nøkkelTallForAlder.løpendeSaker})`}
                            />
                        </ul>
                    </div>
                );
            },
        ),
    );
};

export default Nøkkeltall;
