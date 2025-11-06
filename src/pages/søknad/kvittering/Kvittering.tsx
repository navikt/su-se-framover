import * as RemoteData from '@devexperts/remote-data-ts';
import { PaperclipIcon } from '@navikt/aksel-icons';
import { Alert, BodyLong, BodyShort, Button, Heading, Loader, Panel } from '@navikt/ds-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '~src/api/apiClient';
import { fetchSøknadutskrift } from '~src/api/pdfApi';
import { OpprettetSøknad } from '~src/api/søknadApi';
import { SuccessIcon } from '~src/assets/Icons';
import CircleWithIcon from '~src/components/circleWithIcon/CircleWithIcon';
import * as personSlice from '~src/features/person/person.slice';
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
    const { formatMessage } = useI18n({ messages });

    const handleAvsluttSøknad = (sakId: Nullable<string>) => {
        dispatch(personSlice.default.actions.resetSøkerData());
        dispatch(søknadslice.default.actions.resetSøknad());

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
                                        }}
                                    >
                                        {formatMessage('kvittering.skrivUtSøknad')}
                                        {RemoteData.isPending(fetchSøknadPdfState) && <Loader />}
                                    </Button>
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
