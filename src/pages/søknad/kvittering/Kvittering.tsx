import * as RemoteData from '@devexperts/remote-data-ts';
import { Attachment } from '@navikt/ds-icons';
import { Alert, BodyLong, BodyShort, Button, Heading, Loader, Panel } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import { fetchSøknadutskrift } from '~api/pdfApi';
import { OpprettetSøknad } from '~api/søknadApi';
import CircleWithIcon from '~components/circleWithIcon/CircleWithIcon';
import { SuccessIcon } from '~components/icons/Icons';
import * as personSlice from '~features/person/person.slice';
import * as søknadslice from '~features/søknad/søknad.slice';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Søknadstype } from '~types/Søknad';
import { showName } from '~utils/person/personUtils';

import messages from './kvittering-nb';
import styles from './kvittering.module.less';

const Kvittering = () => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const søknad = useAppSelector((state) => state.innsending.søknad);
    const søker = useAppSelector((state) => state.søker.søker);
    const søknadstype = useAppSelector((state) => state.soknad.forVeileder.type);
    const [fetchSøknadPdfState, setFetchSøknadPdfState] = React.useState<RemoteData.RemoteData<ApiError, null>>(
        RemoteData.initial
    );
    const { formatMessage } = useI18n({ messages });

    const handleAvsluttSøknad = (sakId: Nullable<string>) => {
        dispatch(personSlice.default.actions.resetSøker());
        dispatch(søknadslice.default.actions.resetSøknad());

        if (søknadstype === Søknadstype.Papirsøknad && sakId) {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: sakId }));
        } else {
            history.push(Routes.soknad.createURL());
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
                                <div className={styles.textContainer}>
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
                                        <CircleWithIcon icon={<Attachment />} variant="yellow" />
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
                    }
                )
            )}
        </div>
    );
};

export default Kvittering;
