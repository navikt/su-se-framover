import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Heading, Panel } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchKontrollsamtaleNotatUtskrift } from '~src/api/pdfApi.ts';
import { hentSakinfoPåFnr, SakInfo } from '~src/api/sakApi.ts';
import { SuccessIcon } from '~src/assets/Icons.tsx';
import { useApiCall } from '~src/lib/hooks.ts';
import { useI18n } from '~src/lib/i18n.ts';
import messages from '~src/pages/kontrollsamtale/kvittering/kvittering-nb.ts';
import styles from '~src/pages/søknad/kvittering/kvittering.module.less';
import { useAppSelector } from '~src/redux/Store.ts';
import { openPdfBlobInNewTab } from '~src/utils/dokumentUtils.ts';
import { showName } from '~src/utils/person/personUtils.ts';

export const KvitteringKontrollnotat = () => {
    const { sakId } = useParams();
    const søker = useAppSelector((state) => state.personopplysninger.søker);
    const { formatMessage } = useI18n({ messages });

    const [valgtSak, setValgtSak] = useState<SakInfo | null>(null);

    const [hentSakStatus, hentSak] = useApiCall(hentSakinfoPåFnr);
    useEffect(() => {
        if (sakId) {
            if (RemoteData.isSuccess(søker)) {
                hentSak(søker.value.fnr);
            }
        }
    }, [sakId]);

    useEffect(() => {
        if (RemoteData.isSuccess(hentSakStatus)) {
            const riktigSak = hentSakStatus.value.find((sak) => sak.sakId === sakId);
            setValgtSak(riktigSak ?? null);
        }
    }, [hentSakStatus]);

    const handleSkrivUt = async () => {
        if (!sakId) {
            throw new Error('Mangler sakId');
        }
        const res = await fetchKontrollsamtaleNotatUtskrift(sakId);

        if (res.status === 'ok') {
            openPdfBlobInNewTab(res.data);
        } else {
            throw new Error('Kunne ikke hente kontrollnotat PDF');
        }
    };

    return (
        <div>
            <Panel border className={styles.headingpanel}>
                <SuccessIcon className={styles.successIcon} />
                <Heading level="1" size="large" className={styles.headingContainer}>
                    <span>
                        {RemoteData.isSuccess(søker) &&
                            formatMessage('heading.kontrollNotatForNavnErMottatt', {
                                navn: showName(søker.value.navn),
                            })}
                    </span>
                    <span>
                        {RemoteData.isSuccess(hentSakStatus) &&
                            valgtSak &&
                            formatMessage('heading.saksnummer', {
                                saksnummer: valgtSak.saksnummer,
                            })}
                    </span>
                </Heading>
            </Panel>
            <Heading level="2" size="medium" spacing>
                <strong>{formatMessage('info.skjema')}</strong>
            </Heading>
            <Button onClick={handleSkrivUt}>Skriv ut kontrollnotat</Button>
        </div>
    );
};

export default KvitteringKontrollnotat;
