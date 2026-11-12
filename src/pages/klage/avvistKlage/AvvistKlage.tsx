import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, BodyShort, Button, HelpText, Label, Loader, Textarea } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { Brevtype, hentMottaker, LagreMottakerRequest } from '~src/api/mottakerClient.ts';
import * as pdfApi from '~src/api/pdfApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { MottakerAlert, toMottakerAlert } from '~src/components/mottaker/mottakerUtils';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as klageActions from '~src/features/klage/klageActions';
import { useAsyncActionCreator, useBrevForhåndsvisning } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import yup from '~src/lib/validering';
import DødsboPage from '~src/pages/saksbehandling/mottaker/Dødsbo.tsx';
import { Mottaker } from '~src/pages/saksbehandling/mottaker/Mottaker.tsx';
import { Klage, KlageStatus, KlageSteg } from '~src/types/Klage';
import { KontaktInfoDødsbo, Kontaktinformasjon } from '~src/types/Person.ts';
import { erKlageAvvist } from '~src/utils/klage/klageUtils';
import sharedStyles from '../klage.module.less';
import styles from './avvistKlage.module.less';
import messages from './avvistKlage-nb';

interface AvvistKlageFormData {
    fritekstTilBrev: string;
}

const schema = yup.object<AvvistKlageFormData>({
    fritekstTilBrev: yup.string().required(),
});
const mapDødsboKontaktTilMottaker = (
    kontakt: Kontaktinformasjon,
    adresse: KontaktInfoDødsbo,
): Partial<LagreMottakerRequest> => ({
    navn:
        kontakt.organisasjonsnavn ?? [kontakt.fornavn, kontakt.mellomnavn, kontakt.etternavn].filter(Boolean).join(' '),
    foedselsnummer: kontakt.identifikasjonsnummer ?? '',
    orgnummer: kontakt.organisasjonsnummer ?? '',
    adresse: {
        adresselinje1: adresse.adresselinje1 ?? '',
        adresselinje2: adresse.adresselinje2 ?? '',
        adresselinje3: '',
        postnummer: adresse.postnummer ?? '',
        poststed: adresse.poststedsnavn ?? '',
    },
});
const AvvistKlage = (props: { sakId: string; klage: Klage }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    const [lagreFritekstStatus, lagreFritekst] = useAsyncActionCreator(klageActions.lagreAvvistFritekst);
    const [sendTilAttesteringStatus, sendTilAttestering] = useAsyncActionCreator(klageActions.sendTilAttestering);
    const [brevStatus, hentBrev] = useBrevForhåndsvisning(pdfApi.hentBrevutkastForKlage);
    const [skalLeggeTilMottaker, setSkalLeggeTilMottaker] = useState(false);
    const [mottakerFinnes, setMottakerFinnes] = useState<boolean | null>(null);
    const [mottakerFetchError, setMottakerFetchError] = useState<MottakerAlert | null>(null);
    const mottakerBrevtype: Brevtype = 'VEDTAK';
    const [visDødsbo, setVisDødsbo] = useState(false);
    const [harDødsbo, setHarDødsbo] = useState(false);
    const [prefillMottaker, setPrefillMottaker] = useState<Partial<LagreMottakerRequest> | undefined>(undefined);
    const referanseTypeDødsbo = 'DØDSBO_KLAGE';

    const { handleSubmit, control, getValues } = useForm<AvvistKlageFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            fritekstTilBrev: props.klage.fritekstTilBrev ?? '',
        },
    });

    const onSeBrevClick = (fritekstTilBrev: string) => {
        lagreFritekst({ sakId: props.sakId, klageId: props.klage.id, fritekstTilBrev: fritekstTilBrev }, () => {
            hentBrev({ sakId: props.sakId, klageId: props.klage.id });
        });
    };

    const handleOnLagre = (fritekstTilBrev: string) => {
        lagreFritekst({ sakId: props.sakId, klageId: props.klage.id, fritekstTilBrev: fritekstTilBrev }, () => {
            navigate(
                Routes.saksoversiktValgtSak.createURL({
                    sakId: props.sakId,
                }),
            );
        });
    };

    const handleBekreftOgFortsettSubmit = (data: AvvistKlageFormData) => {
        lagreFritekst({ sakId: props.sakId, klageId: props.klage.id, fritekstTilBrev: data.fritekstTilBrev }, () => {
            sendTilAttestering({ sakId: props.sakId, klageId: props.klage.id }, () => {
                Routes.navigateToSakIntroWithMessage(
                    navigate,
                    formatMessage('avvistKlage.sendtTilAttestering'),
                    props.sakId,
                );
            });
        });
    };

    const handleBrukDødsboKontaktSomMottaker = (kontakt: Kontaktinformasjon, adresse: KontaktInfoDødsbo) => {
        setPrefillMottaker(mapDødsboKontaktTilMottaker(kontakt, adresse));
        setVisDødsbo(true);
    };

    useEffect(() => {
        if (!props.klage.id) {
            return;
        }

        const sjekkMottaker = async () => {
            setMottakerFinnes(null);
            setMottakerFetchError(null);

            const res = await hentMottaker(props.sakId, 'KLAGE', props.klage.id, mottakerBrevtype);

            if (res.status === 'ok') {
                if (res.data) {
                    setMottakerFinnes(true);
                    setSkalLeggeTilMottaker(true);
                } else {
                    setMottakerFinnes(false);
                    setSkalLeggeTilMottaker(false);
                }
                return;
            }

            if (res.error.statusCode === 404) {
                setMottakerFinnes(false);
                setSkalLeggeTilMottaker(false);
                return;
            }

            setMottakerFinnes(false);
            setSkalLeggeTilMottaker(false);
            setMottakerFetchError(toMottakerAlert(res.error, formatMessage('feilmelding.kanIkkeHenteMottaker')));
        };

        void sjekkMottaker();
    }, [formatMessage, props.klage.id, props.sakId]);

    useEffect(() => {
        const sjekkMottaker = async () => {
            const res = await hentMottaker(props.sakId, referanseTypeDødsbo, props.klage.id, mottakerBrevtype);

            if (res.status === 'ok') {
                if (res.data) {
                    setHarDødsbo(true);
                }
                return;
            } else {
                if (res.error.statusCode !== 404) {
                    setMottakerFetchError(toMottakerAlert(res.error, 'Kan ikke hente mottaker'));
                }
            }
        };
        void sjekkMottaker();
    }, [props.sakId, props.klage.id, mottakerBrevtype, referanseTypeDødsbo]);

    const iGyldigStatusForÅAvvise = (k: Klage) =>
        k.status === KlageStatus.VILKÅRSVURDERT_BEKREFTET_AVVIST || erKlageAvvist(k);

    if (!iGyldigStatusForÅAvvise(props.klage)) {
        return (
            <div className={sharedStyles.feilTilstandContainer}>
                <Alert variant="error">{formatMessage('feil.ikkeRiktigTilstandForÅVurdere')}</Alert>
                <Link
                    to={Routes.klage.createURL({
                        sakId: props.sakId,
                        klageId: props.klage.id,
                        steg: KlageSteg.Formkrav,
                    })}
                >
                    {formatMessage('knapp.tilbake')}
                </Link>
            </div>
        );
    }

    return (
        <ToKolonner tittel={formatMessage('avvistKlage.tittel')}>
            {{
                left: (
                    <form onSubmit={handleSubmit(handleBekreftOgFortsettSubmit)}>
                        <Label className={styles.resultatLabel}>{formatMessage('avvistKlage.resultat')}</Label>
                        <div className={styles.fritekstOgVisBrevContainer}>
                            <Controller
                                control={control}
                                name={'fritekstTilBrev'}
                                render={({ field, fieldState }) => (
                                    <Textarea
                                        {...field}
                                        label={
                                            <div className={styles.fritekstLabelOgHjelpeTekstContainer}>
                                                <Label>{formatMessage('avvistKlage.brevTilBruker')}</Label>
                                                <HelpText>
                                                    {/*Er mulig Folka fra designsystemet tillatter rikt innhold da noen har hatt et issue med det  */}
                                                    {/*@ts-ignore */}
                                                    <Label className={styles.hjelpetekst}>
                                                        {formatMessage('avvistKlage.brevTilBruker.hjelpetekst')}
                                                    </Label>
                                                </HelpText>
                                            </div>
                                        }
                                        value={field.value}
                                        error={fieldState.error?.message}
                                    />
                                )}
                            />
                            <div>
                                <DødsboPage onVelgKontakt={handleBrukDødsboKontaktSomMottaker} />
                                {!visDødsbo && (
                                    <Button
                                        variant="secondary"
                                        type="button"
                                        onClick={() => {
                                            setPrefillMottaker(undefined);
                                            setVisDødsbo(true);
                                        }}
                                    >
                                        {harDødsbo ? 'Vis dødsbo' : 'Legg til dødsbo'}
                                    </Button>
                                )}
                                {visDødsbo && (
                                    <>
                                        <Mottaker
                                            sakId={props.sakId}
                                            referanseId={props.klage.id}
                                            referanseType={referanseTypeDødsbo}
                                            brevtype={mottakerBrevtype}
                                            initialValues={prefillMottaker}
                                            onClose={() => {
                                                setPrefillMottaker(undefined);
                                                setVisDødsbo(false);
                                            }}
                                            onDelete={() => setHarDødsbo(false)}
                                        />
                                        {mottakerFetchError && (
                                            <Alert variant={mottakerFetchError.variant} size="small">
                                                {mottakerFetchError.text}
                                            </Alert>
                                        )}
                                    </>
                                )}
                            </div>
                            <Button
                                className={styles.seBrevKnapp}
                                type="button"
                                variant="secondary"
                                loading={RemoteData.isPending(brevStatus)}
                                onClick={() => onSeBrevClick(getValues('fritekstTilBrev'))}
                            >
                                {formatMessage('knapp.seBrev')}
                            </Button>
                            {RemoteData.isFailure(brevStatus) && <ApiErrorAlert error={brevStatus.error} />}
                        </div>
                        <div className={styles.mottakerSection}>
                            {mottakerFetchError && (
                                <Alert variant={mottakerFetchError.variant} size="small">
                                    {mottakerFetchError.text}
                                </Alert>
                            )}
                            <Button
                                variant="secondary"
                                className={styles.mottakerToggle}
                                type="button"
                                onClick={() => setSkalLeggeTilMottaker((prev) => !prev)}
                                size="small"
                                disabled={mottakerFinnes === null}
                            >
                                {skalLeggeTilMottaker
                                    ? formatMessage('knapp.lukkmottaker')
                                    : mottakerFinnes
                                      ? formatMessage('knapp.vismottaker')
                                      : formatMessage('knapp.leggtilmottaker')}
                                {mottakerFinnes === null && <Loader size="small" className={styles.buttonSpinner} />}
                            </Button>
                            {skalLeggeTilMottaker && (
                                <Mottaker
                                    sakId={props.sakId}
                                    referanseId={props.klage.id}
                                    referanseType={'KLAGE'}
                                    brevtype={mottakerBrevtype}
                                    onClose={() => setSkalLeggeTilMottaker(false)}
                                />
                            )}
                        </div>
                        <div className={styles.knapperContainer}>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => handleOnLagre(getValues('fritekstTilBrev'))}
                            >
                                {formatMessage('knapp.lagre')}
                                {RemoteData.isPending(lagreFritekstStatus) && <Loader />}
                            </Button>
                            <Button>
                                {formatMessage('knapp.sendTilAttestering')}
                                {RemoteData.isPending(sendTilAttesteringStatus) && <Loader />}
                            </Button>
                            <LinkAsButton
                                variant="secondary"
                                href={Routes.klage.createURL({
                                    sakId: props.sakId,
                                    klageId: props.klage.id,
                                    steg: KlageSteg.Formkrav,
                                })}
                            >
                                {formatMessage('knapp.tilbake')}
                            </LinkAsButton>
                        </div>
                        {RemoteData.isFailure(lagreFritekstStatus) && (
                            <ApiErrorAlert error={lagreFritekstStatus.error} />
                        )}
                        {RemoteData.isFailure(sendTilAttesteringStatus) && (
                            <ApiErrorAlert error={sendTilAttesteringStatus.error} />
                        )}
                    </form>
                ),
                right: props.klage.begrunnelse ? (
                    <InformasjonTilAttestant formkravBegrunnelse={props.klage.begrunnelse} />
                ) : null,
            }}
        </ToKolonner>
    );
};

const InformasjonTilAttestant = (props: { formkravBegrunnelse: string }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <Label>{formatMessage('avvistKlage.infoTilAttestant')}</Label>
            <BodyShort className={styles.formkravBegrunnelse}>{props.formkravBegrunnelse}</BodyShort>
        </div>
    );
};

export default AvvistKlage;
