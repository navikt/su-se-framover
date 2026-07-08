import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Heading, Panel } from '@navikt/ds-react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchKontrollsamtaleNotatUtskrift } from '~src/api/pdfApi.ts';
import { SuccessIcon } from '~src/assets/Icons.tsx';
import { fetchSakByIdEllerNummer } from '~src/features/saksoversikt/sak.slice.ts';
import { useI18n } from '~src/lib/i18n.ts';
import messages from '~src/pages/kontrollsamtale/kvittering/kvittering-nb.ts';
import styles from '~src/pages/søknad/kvittering/kvittering.module.less';
import { useAppDispatch, useAppSelector } from '~src/redux/Store.ts';
import { showName } from '~src/utils/person/personUtils.ts';

export const KvitteringKontrollnotat = () => {
    const { sakId } = useParams();
    const dispatch = useAppDispatch();
    const søker = useAppSelector((state) => state.personopplysninger.søker);
    const sak = useAppSelector((state) => state.sak.sak);
    const { formatMessage } = useI18n({ messages });

    useEffect(() => {
        if (sakId) {
            dispatch(fetchSakByIdEllerNummer({ sakId }));
        }
    }, [sakId]);

    const handleSkrivUt = async () => {
        if (!sakId) {
            throw new Error('Mangler sakId');
        }
        const res = await fetchKontrollsamtaleNotatUtskrift(sakId);

        if (res.status === 'ok') {
            window.open(URL.createObjectURL(res.data));
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
                        {RemoteData.isSuccess(sak) &&
                            formatMessage('heading.saksnummer', {
                                saksnummer: sak.value.saksnummer,
                            })}
                    </span>
                </Heading>
            </Panel>
            <Button onClick={handleSkrivUt}>Skriv ut kontrollnotat</Button>
        </div>
    );
};

export default KvitteringKontrollnotat;
