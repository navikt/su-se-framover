import * as RemoteData from '@devexperts/remote-data-ts';
import { PaperclipIcon } from '@navikt/aksel-icons';
import { Alert, BodyLong, BodyShort, Button, Heading, Link, Loader, Modal, Panel } from '@navikt/ds-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '~src/api/apiClient';
import { fetchSøknadutskrift } from '~src/api/pdfApi';
import { OpprettetSøknad } from '~src/api/søknadApi';
import { SuccessIcon } from '~src/assets/Icons';
import forsteSideBildet from '~src/assets/images/forsteSide.png';
import CircleWithIcon from '~src/components/circleWithIcon/CircleWithIcon';
import * as personSlice from '~src/features/person/person.slice';
import innsendingSlice from '~src/features/søknad/innsending.slice';
import * as søknadslice from '~src/features/søknad/søknad.slice';
import { pipe } from '~src/lib/fp';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { Søknadstype } from '~src/types/Søknadinnhold';
import { showName } from '~src/utils/person/personUtils';
import styles from './kvittering.module.less';
import messages from './kvittering-nb';

const Kvittering = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const søknad = useAppSelector((state) => state.innsending.søknad);
    const søker = useAppSelector((state) => state.personopplysninger.søker);
    const søknadstype = useAppSelector((state) => state.soknad.forVeileder.type);
    const [fetchSøknadPdfState, setFetchSøknadPdfState] = useState<RemoteData.RemoteData<ApiError, null>>(
        RemoteData.initial,
    );
    const ref = useRef<HTMLDialogElement>(null);
    const [open, setOpen] = useState(false);
    const { formatMessage } = useI18n({ messages });

    const handleAvsluttSøknad = (sakId: Nullable<string>) => {
        dispatch(personSlice.default.actions.resetSøkerData());
        dispatch(søknadslice.default.actions.resetSøknad());
        dispatch(innsendingSlice.actions.resetInnsending());

        if (søknadstype === Søknadstype.Papirsøknad && sakId) {
            navigate(Routes.saksoversiktValgtSak.createURL({ sakId: sakId }));
        } else {
            navigate(Routes.soknad.createURL());
        }
    };

    const handleSkrivUtSøknadClick = async (opprettetSøknad: OpprettetSøknad) => {
        setFetchSøknadPdfState(RemoteData.pending);
        const res = await fetchSøknadutskrift(opprettetSøknad.søknad.id);
        if (res.status === 'ok') {
            setFetchSøknadPdfState(RemoteData.success(null));
            window.open(URL.createObjectURL(res.data));
        } else {
            setFetchSøknadPdfState(RemoteData.failure(res.error));
        }
    };

    const VisFeil = () => (
        <div className={styles.container}>
            <Alert variant="error">{formatMessage('feil.feilOppsto')}</Alert>

            <Button variant="secondary" onClick={() => handleAvsluttSøknad(null)}>
                {formatMessage('kvittering.avslutt')}
            </Button>
        </div>
    );

    return (
        <div>
            {pipe(
                RemoteData.combine(søknad, søker),
                RemoteData.fold(
                    () => <VisFeil />,
                    () => {
                        return (
                            <div className={styles.senderSøknadSpinnerContainer}>
                                <Loader />
                            </div>
                        );
                    },
                    () => <VisFeil />,
                    ([saksnummerOgSøknad, søker]) => {
                        return (
                            <div className={styles.container}>
                                <div>
                                    <Panel border className={styles.headingpanel}>
                                        <SuccessIcon className={styles.successIcon} />
                                        <Heading level="1" size="large" className={styles.headingContainer}>
                                            <span>
                                                {formatMessage('heading.søknadForNavnErMottatt', {
                                                    navn: showName(søker.navn),
                                                })}
                                            </span>
                                            <span>
                                                {formatMessage('heading.saksnummer', {
                                                    saksnummer: saksnummerOgSøknad.saksnummer,
                                                })}
                                            </span>
                                        </Heading>
                                    </Panel>

                                    <Heading level="2" size="medium" spacing>
                                        {formatMessage('kvittering.tilVeileder.heading')}
                                    </Heading>
                                    <BodyLong as="ol" spacing>
                                        <li>{formatMessage('kvittering.tilVeileder.punkt1')}</li>
                                        <li>{formatMessage('kvittering.tilVeileder.punkt2')}</li>
                                        <li>{formatMessage('kvittering.tilVeileder.punkt3')}</li>
                                    </BodyLong>

                                    <Heading level="2" size="medium" spacing className={styles.vedleggHeadingContainer}>
                                        <CircleWithIcon icon={<PaperclipIcon />} variant="yellow" />
                                        {formatMessage('vedlegg.huskVedlegg')}
                                    </Heading>

                                    <BodyLong spacing as={'div'}>
                                        {formatMessage('vedlegg.måLeggesMed')}
                                        <ul>
                                            <li>
                                                <strong>{formatMessage('vedlegg.måLeggesMed.puntk1')}</strong>
                                            </li>
                                            <li>
                                                <strong>{formatMessage('vedlegg.måLeggesMed.puntk2')}</strong>
                                            </li>
                                        </ul>
                                    </BodyLong>

                                    <BodyLong spacing as={'div'}>
                                        {formatMessage('vedlegg.formueIUtlandet')}
                                        <ul>
                                            <li>
                                                <strong>{formatMessage('vedlegg.formueIUtlandet.punkt1')}</strong>
                                            </li>
                                            <li>
                                                <strong>{formatMessage('vedlegg.formueIUtlandet.punkt2')}</strong>
                                            </li>
                                        </ul>
                                    </BodyLong>

                                    <BodyShort>
                                        <strong>{formatMessage('vedlegg.søkerManglerDok')}</strong>
                                    </BodyShort>

                                    <Alert variant="info" className={styles.påminnelseIkkeSkrivPåUtskriftContainer}>
                                        <Heading level="2" size="medium" spacing>
                                            {formatMessage('påminnelse.ikkeSkrivPåUtskrift.tittel')}
                                        </Heading>
                                        <BodyLong>{formatMessage('påminnelse.ikkeSkrivPåUtskrift.tekst')}</BodyLong>
                                    </Alert>
                                </div>
                                {RemoteData.isFailure(fetchSøknadPdfState) && (
                                    <Alert variant="error">{formatMessage('feil.kunneIkkeHentePdf')}</Alert>
                                )}
                                <div className={styles.buttonContainer}>
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleAvsluttSøknad(saksnummerOgSøknad.søknad.sakId)}
                                    >
                                        {formatMessage('kvittering.avslutt')}
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            handleSkrivUtSøknadClick(saksnummerOgSøknad);
                                            setOpen(true);
                                        }}
                                    >
                                        {formatMessage('kvittering.skrivUtSøknad')}
                                        {RemoteData.isPending(fetchSøknadPdfState) && <Loader />}
                                    </Button>

                                    <Modal
                                        ref={ref}
                                        aria-label="Kontrollsamtale"
                                        open={open}
                                        onClose={() => setOpen(false)}
                                    >
                                        <Modal.Body>
                                            <Heading size="medium" spacing>
                                                {formatMessage('påminnelse.ikkeSkrivPåUtskrift.tittel')}
                                            </Heading>
                                            <form>
                                                <BodyShort spacing>
                                                    {formatMessage('påminnelse.ikkeSkrivPåUtskrift.tekst')}
                                                </BodyShort>

                                                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                                                    <Button
                                                        variant="secondary"
                                                        type="button"
                                                        onClick={() => setOpen(false)}
                                                    >
                                                        Jeg forstår
                                                    </Button>
                                                </div>
                                            </form>
                                        </Modal.Body>
                                    </Modal>
                                </div>
                            </div>
                        );
                    },
                ),
            )}
        </div>
    );
};

export default Kvittering;
