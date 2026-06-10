import * as RemoteData from '@devexperts/remote-data-ts';
import { PaperclipIcon } from '@navikt/aksel-icons';
import { Alert, BodyLong, Button, Heading, Link, Panel, Select, TextField } from '@navikt/ds-react';
import { useState } from 'react';
import { sakOpprettelse } from '~src/api/sakApi.ts';
import { SuccessIcon } from '~src/assets/Icons.tsx';
import CircleWithIcon from '~src/components/circleWithIcon/CircleWithIcon.tsx';
import * as personSlice from '~src/features/person/person.slice.ts';
import { useApiCall } from '~src/lib/hooks.ts';
import { useI18n } from '~src/lib/i18n.ts';
import * as Routes from '~src/lib/routes.ts';
import messages from '~src/pages/søknad/steg/inngang/SakInngang-nb.ts';
import styles from '~src/pages/søknad/steg/inngang/sakInngang.module.less';
import { useAppDispatch } from '~src/redux/Store.ts';
import { Sakstype } from '~src/types/Sak.ts';

export const SakInngang = () => {
    const dispatch = useAppDispatch();
    const [sakstype, setSakstype] = useState<Sakstype>(Sakstype.Alder);
    const [fnr, setFnr] = useState<string>('');
    const [opprettSakStatus, opprettSak, resetOpprettSak] = useApiCall(sakOpprettelse);

    const handleOpprettSak = () => {
        if (fnr.length === 11) {
            opprettSak({ fnr, sakstype });
        }
    };
    const { formatMessage } = useI18n({ messages });

    const handleNySøk = () => {
        setFnr('');
        resetOpprettSak();
        dispatch(personSlice.default.actions.resetSøkerData());
    };

    return (
        <div className={styles.bakgrunn}>
            {RemoteData.isSuccess(opprettSakStatus) ? (
                <div className={styles.pageContainer}>
                    <Panel border className={styles.headingpanel}>
                        <SuccessIcon className={styles.successIcon} />
                        <Heading level="1" size="large" className={styles.headingContainer}>
                            <span>
                                {formatMessage('heading.sakOpprettet', {
                                    fnr: opprettSakStatus.value.fnr,
                                    sakstype: opprettSakStatus.value.sakstype === Sakstype.Alder ? 'Alder' : 'Uføre',
                                })}
                            </span>
                        </Heading>
                    </Panel>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                        <Link href={Routes.saksoversiktValgtSak.createURL({ sakId: opprettSakStatus.value.id })}>
                            <Button as="span">Gå til sak</Button>
                        </Link>

                        <Button variant="secondary" onClick={handleNySøk}>
                            Opprett ny sak
                        </Button>
                    </div>
                </div>
            ) : (
                <div className={styles.pageContainer}>
                    <Heading level="1" size="xlarge" spacing className={styles.heading}>
                        Registrer sak
                        <>
                            <CircleWithIcon icon={<PaperclipIcon />} variant="yellow" />
                        </>
                    </Heading>
                    <BodyLong spacing>{formatMessage('sak.beskrivelse')}</BodyLong>
                    <BodyLong spacing>{formatMessage('sak.opprettkrav')}</BodyLong>

                    <div className={styles.formWrapper}>
                        <TextField
                            label="Fødselsnummer"
                            value={fnr}
                            onChange={(e) => setFnr(e.target.value)}
                            maxLength={11}
                            style={{ marginBottom: '1rem', maxWidth: '300px' }}
                            description="11 siffer"
                        />

                        <Select
                            label="Velg sakstype"
                            value={sakstype}
                            onChange={(e) => setSakstype(e.target.value as Sakstype)}
                            style={{ marginBottom: '1rem', maxWidth: '300px' }}
                        >
                            <option value={Sakstype.Alder}>Alder</option>
                            <option value={Sakstype.Uføre}>Uføre</option>
                        </Select>

                        <Button
                            onClick={handleOpprettSak}
                            disabled={fnr.length !== 11}
                            loading={RemoteData.isPending(opprettSakStatus)}
                            style={{ marginBottom: '1rem' }}
                        >
                            Opprett sak
                        </Button>

                        {RemoteData.isFailure(opprettSakStatus) && (
                            <Alert variant="error" style={{ marginTop: '1rem' }}>
                                <Heading level="2" size="small" spacing>
                                    Feil ved opprettelse av sak
                                </Heading>
                                <BodyLong>{opprettSakStatus.error.body?.message}</BodyLong>
                            </Alert>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
