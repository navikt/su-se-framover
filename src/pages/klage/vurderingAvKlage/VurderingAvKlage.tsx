import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    Alert,
    Button,
    Checkbox,
    CheckboxGroup,
    Link as DsReactLink,
    HelpText,
    Label,
    Loader,
    Radio,
    RadioGroup,
    Select,
    Textarea,
} from '@navikt/ds-react';
import { struct } from 'fp-ts/Eq';
import * as A from 'fp-ts/lib/Array';
import * as S from 'fp-ts/string';
import { useEffect } from 'react';
import { Control, Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FritekstTyper, hentFritekst, redigerFritekst } from '~src/api/fritekstApi.ts';
import * as pdfApi from '~src/api/pdfApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import TextareaWithAutosave from '~src/components/inputs/textareaWithAutosave/TextareaWithAutosave.tsx';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as klageActions from '~src/features/klage/klageActions';
import { useApiCall, useAsyncActionCreator, useBrevForhåndsvisning } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { eqNullable, Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { KabalVedtakHjemmel, Klage, KlageStatus, KlageSteg, KlageVurderingType } from '~src/types/Klage';
import { OmgjøringsGrunn } from '~src/types/Revurdering';
import { erKlageVurdert, erKlageVurdertBekreftet } from '~src/utils/klage/klageUtils';
import sharedStyles from '../klage.module.less';
import messages from './VurderingAvKlage-nb';
import styles from './vurderingAvKlage.module.less';

interface OmgjørFormData {
    årsak: Nullable<OmgjøringsGrunn>;
    begrunnelse: Nullable<string>;
}

interface KabalData {
    hjemmel: KabalVedtakHjemmel[];
    klagenotat: Nullable<string>;
}

interface VurderingAvKlageFormData {
    klageVurderingType: Nullable<KlageVurderingType>;
    omgjør: OmgjørFormData;
    kabaldata: KabalData;
    fritekst: string;
}

const eqOmgjør = struct<OmgjørFormData>({
    årsak: eqNullable(S.Eq),
    begrunnelse: eqNullable(S.Eq),
});

const eqKabalData = struct<KabalData>({
    hjemmel: A.getEq(S.Eq),
    klagenotat: eqNullable(S.Eq),
});

const schema = yup.object<VurderingAvKlageFormData>({
    klageVurderingType: yup
        .string()
        .defined()
        .required()
        .oneOf(
            [
                KlageVurderingType.OMGJØR,
                KlageVurderingType.OPPRETTHOLD,
                KlageVurderingType.DELVIS_OMGJØRING_KA,
                KlageVurderingType.DELVIS_OMGJØRING_EGEN_VEDTAKSINSTANS,
            ],
            'Feltet må være "Omgjør", "Delvis omgjøring i vedtaksenhet, "Oppretthold" eller Delvis omgjøring',
        ),
    omgjør: yup
        .object<OmgjørFormData>()
        .defined()
        .when('klageVurderingType', {
            is: (val: KlageVurderingType | null) =>
                val === KlageVurderingType.OMGJØR || val === KlageVurderingType.DELVIS_OMGJØRING_EGEN_VEDTAKSINSTANS,
            then: yup.object({
                årsak: yup.mixed<Nullable<string>>().oneOf(Object.values(OmgjøringsGrunn)).required(),
                begrunnelse: yup.string().required('Må ha begrunnelse'),
            }),
            otherwise: yup.object().nullable(),
        }),
    kabaldata: yup
        .object<KabalData>()
        .defined()
        .when('klageVurderingType', {
            is: (val: KlageVurderingType | null) =>
                val === KlageVurderingType.OPPRETTHOLD || val === KlageVurderingType.DELVIS_OMGJØRING_KA,
            then: yup.object<KabalData>({
                hjemmel: yup.array<KabalVedtakHjemmel>().required(),
                klagenotat: yup.string(),
            }),
            otherwise: yup.object().nullable(),
        }),
    fritekst: yup.mixed<string>().when('klageVurderingType', (klageVurderingType: KlageVurderingType) => {
        if (
            klageVurderingType === KlageVurderingType.OMGJØR ||
            klageVurderingType === KlageVurderingType.DELVIS_OMGJØRING_EGEN_VEDTAKSINSTANS
        ) {
            return yup.string().nullable();
        } else {
            return yup.string().nullable().required('Brevet må ha tekst');
        }
    }),
});

const eqVurderingAvKlageFormData = struct<VurderingAvKlageFormData>({
    klageVurderingType: eqNullable(S.Eq),
    omgjør: eqOmgjør,
    kabaldata: eqKabalData,
    fritekst: S.Eq,
});

const VurderingAvKlage = (props: { sakId: string; klage: Klage }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    const [lagreVurderingAvKlageStatus, lagreVurderingAvKlage] = useAsyncActionCreator(
        klageActions.lagreVurderingAvKlage,
    );
    const [bekreftVurderingerStatus, bekreftVurderinger] = useAsyncActionCreator(klageActions.bekreftVurderinger);
    const [brevStatus, hentBrev] = useBrevForhåndsvisning(pdfApi.hentBrevutkastForKlage);

    const [lagreFritekstStatus, lagreFritekst] = useApiCall(redigerFritekst);

    const hjelpetekstLink =
        'https://navno.sharepoint.com/sites/fag-og-ytelser-pensjon-supplerende-stonad/SitePages/Midlertidig-rutine-for-klagebehandling---supplerende-st%C3%B8nad-til-uf%C3%B8re-flyktninger.aspx?OR=Teams-HL&CT=1645705340996&sourceId=&params=%7B%22AppName%22%3A%22Teams-Desktop%22%2C%22AppVersion%22%3A%2228%2F22010300411%22%7D';

    const klageVurderingType = props.klage.vedtaksvurdering?.type;

    const initialValues = {
        klageVurderingType: klageVurderingType ?? null,
        omgjør: {
            årsak:
                klageVurderingType === KlageVurderingType.OMGJØR
                    ? (props.klage.vedtaksvurdering?.omgjør?.årsak ?? null)
                    : klageVurderingType === KlageVurderingType.DELVIS_OMGJØRING_EGEN_VEDTAKSINSTANS
                      ? (props.klage.vedtaksvurdering?.delvisomgjøringEgenInstans?.årsak ?? null)
                      : null,
            begrunnelse:
                klageVurderingType === KlageVurderingType.OMGJØR
                    ? (props.klage.vedtaksvurdering?.omgjør?.begrunnelse ?? null)
                    : klageVurderingType === KlageVurderingType.DELVIS_OMGJØRING_EGEN_VEDTAKSINSTANS
                      ? (props.klage.vedtaksvurdering?.delvisomgjøringEgenInstans?.begrunnelse ?? null)
                      : null,
        },
        kabaldata: {
            hjemmel:
                klageVurderingType === KlageVurderingType.OPPRETTHOLD
                    ? (props.klage.vedtaksvurdering?.oppretthold?.hjemler ?? [])
                    : klageVurderingType === KlageVurderingType.DELVIS_OMGJØRING_KA
                      ? (props.klage.vedtaksvurdering?.delvisOmgjøringKa?.hjemler ?? [])
                      : [],
            klagenotat:
                klageVurderingType === KlageVurderingType.OPPRETTHOLD
                    ? (props.klage.vedtaksvurdering?.oppretthold?.klagenotat ?? null)
                    : klageVurderingType === KlageVurderingType.DELVIS_OMGJØRING_KA
                      ? (props.klage.vedtaksvurdering?.delvisOmgjøringKa?.klagenotat ?? null)
                      : null,
        },
        fritekst: '',
    };

    const {
        handleSubmit,
        watch,
        control,
        setValue,
        formState: { isDirty },
    } = useForm<VurderingAvKlageFormData>({
        resolver: yupResolver(schema),
        defaultValues: initialValues,
    });

    const lagOpprettholdApiBody = (data: VurderingAvKlageFormData) => {
        return {
            sakId: props.sakId,
            klageId: props.klage.id,
            omgjør:
                data.klageVurderingType === KlageVurderingType.OMGJØR
                    ? {
                          årsak: data.omgjør.årsak ? data.omgjør.årsak : null,
                          begrunnelse: data.omgjør.begrunnelse ? data.omgjør.begrunnelse : null,
                      }
                    : null,
            oppretthold:
                data.klageVurderingType === KlageVurderingType.OPPRETTHOLD
                    ? {
                          hjemler: data.kabaldata.hjemmel,
                          klagenotat: data.kabaldata.klagenotat ? data.kabaldata.klagenotat : null,
                      }
                    : null,
            delvisomgjøringKa:
                data.klageVurderingType === KlageVurderingType.DELVIS_OMGJØRING_KA
                    ? {
                          hjemler: data.kabaldata.hjemmel,
                          klagenotat: data.kabaldata.klagenotat ? data.kabaldata.klagenotat : null,
                      }
                    : null,
            delvisomgjøring_egen_instans:
                data.klageVurderingType === KlageVurderingType.DELVIS_OMGJØRING_EGEN_VEDTAKSINSTANS
                    ? {
                          årsak: data.omgjør.årsak ? data.omgjør.årsak : null,
                          begrunnelse: data.omgjør.begrunnelse ? data.omgjør.begrunnelse : null,
                      }
                    : null,
        };
    };

    const handleLagreVurderingAvKlageClick = (data: VurderingAvKlageFormData) => {
        if (eqVurderingAvKlageFormData.equals(data, initialValues)) {
            navigate(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
            return;
        }

        lagreVurderingAvKlage(lagOpprettholdApiBody(data), () => {
            navigate(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
        });
    };

    const handleBekreftOgFortsettSubmit = (data: VurderingAvKlageFormData) => {
        if (erKlageVurdertBekreftet(props.klage) && !isDirty) {
            navigate(
                Routes.klage.createURL({
                    sakId: props.sakId,
                    klageId: props.klage.id,
                    steg: KlageSteg.Oppsummering,
                }),
            );
            return;
        }
        lagreVurderingAvKlage(lagOpprettholdApiBody(data), () => {
            bekreftVurderinger(
                {
                    sakId: props.sakId,
                    klageId: props.klage.id,
                },
                () => {
                    navigate(
                        Routes.klage.createURL({
                            sakId: props.sakId,
                            klageId: props.klage.id,
                            steg: KlageSteg.Oppsummering,
                        }),
                    );
                },
            );
        });
    };

    const iGyldigTilstandForÅVurdere = (k: Klage) =>
        k.status === KlageStatus.VILKÅRSVURDERT_BEKREFTET_TIL_VURDERING || erKlageVurdert(k);

    if (!iGyldigTilstandForÅVurdere(props.klage)) {
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
    const klageVurderingTypeWatch = watch('klageVurderingType');
    const ikkeMedhold =
        klageVurderingTypeWatch === KlageVurderingType.OPPRETTHOLD ||
        klageVurderingTypeWatch === KlageVurderingType.DELVIS_OMGJØRING_KA;

    useEffect(() => {
        hentFritekst({
            referanseId: props.klage.id,
            sakId: props.sakId,
            type: FritekstTyper.VEDTAKSBREV_KLAGE,
        }).then((result) => {
            if (result.status === 'ok' && result.data) {
                setValue('fritekst', result.data.fritekst ?? '');
            }
        });
    }, [props.klage.id, props.sakId, setValue]);

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <form onSubmit={handleSubmit(handleBekreftOgFortsettSubmit)}>
                        <div className={styles.vedtakHandlingContainer}>
                            <Controller
                                control={control}
                                name={'klageVurderingType'}
                                render={({ field, fieldState }) => (
                                    <RadioGroup
                                        {...field}
                                        legend={formatMessage('form.klageVurderingType.legend')}
                                        hideLegend={true}
                                        error={fieldState.error?.message}
                                        value={field.value ?? ''}
                                    >
                                        <Radio value={KlageVurderingType.OMGJØR}>
                                            {formatMessage(KlageVurderingType.OMGJØR)}
                                        </Radio>
                                        <Radio value={KlageVurderingType.DELVIS_OMGJØRING_EGEN_VEDTAKSINSTANS}>
                                            {formatMessage(KlageVurderingType.DELVIS_OMGJØRING_EGEN_VEDTAKSINSTANS)}
                                        </Radio>
                                        <Radio value={KlageVurderingType.OPPRETTHOLD}>
                                            {formatMessage(KlageVurderingType.OPPRETTHOLD)}
                                        </Radio>
                                        <Radio value={KlageVurderingType.DELVIS_OMGJØRING_KA}>
                                            {formatMessage(KlageVurderingType.DELVIS_OMGJØRING_KA)}
                                        </Radio>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        {(klageVurderingTypeWatch === KlageVurderingType.OMGJØR ||
                            klageVurderingTypeWatch === KlageVurderingType.DELVIS_OMGJØRING_EGEN_VEDTAKSINSTANS) && (
                            <OmgjørVedtakForm control={control} />
                        )}
                        {ikkeMedhold && (
                            <>
                                <OpprettholdVedtakForm control={control} />
                                <div className={styles.fritesktOgVisBrevContainer}>
                                    <TextareaWithAutosave
                                        textarea={{
                                            name: 'fritekst',
                                            label: (
                                                <div className={styles.fritekstLabelOgHjelpeTekstContainer}>
                                                    <Label>{formatMessage('form.fritekst.label')}</Label>
                                                    <HelpText>
                                                        {/*Er mulig Folka fra designsystemet tillatter rikt innhold da noen har hatt et issue med det  */}
                                                        {/*@ts-ignore */}
                                                        <Label className={styles.hjelpetekst}>
                                                            <DsReactLink href={hjelpetekstLink} target="_blank">
                                                                {formatMessage('form.fritekst.hjelpeTekst')}
                                                            </DsReactLink>
                                                        </Label>
                                                    </HelpText>
                                                </div>
                                            ),
                                            description: [formatMessage('form.fritekst.description')],
                                            control: control,
                                            value: watch('fritekst') ?? '',
                                        }}
                                        save={{
                                            handleSave: () => {
                                                lagreFritekst({
                                                    referanseId: props.klage.id,
                                                    sakId: props.sakId,
                                                    type: FritekstTyper.VEDTAKSBREV_KLAGE,
                                                    fritekst: watch('fritekst') ?? '',
                                                });
                                            },
                                            status: lagreFritekstStatus,
                                        }}
                                        brev={{
                                            handleSeBrev: () =>
                                                hentBrev({
                                                    sakId: props.sakId,
                                                    klageId: props.klage.id,
                                                }),
                                            status: brevStatus,
                                        }}
                                    />
                                    {RemoteData.isFailure(brevStatus) && <ApiErrorAlert error={brevStatus.error} />}
                                </div>
                            </>
                        )}

                        <div className={styles.knapperContainer}>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => handleLagreVurderingAvKlageClick(watch())}
                            >
                                {formatMessage('knapp.lagre')}
                                {RemoteData.isPending(lagreVurderingAvKlageStatus) && <Loader />}
                            </Button>
                            <Button>
                                {formatMessage('knapp.bekreftOgFortsett')}
                                {RemoteData.isPending(bekreftVurderingerStatus) && <Loader />}
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
                        {RemoteData.isFailure(lagreVurderingAvKlageStatus) && (
                            <ApiErrorAlert error={lagreVurderingAvKlageStatus.error} />
                        )}
                        {RemoteData.isFailure(bekreftVurderingerStatus) && (
                            <ApiErrorAlert error={bekreftVurderingerStatus.error} />
                        )}
                    </form>
                ),
                right: <></>,
            }}
        </ToKolonner>
    );
};

const OmgjørVedtakForm = (props: { control: Control<VurderingAvKlageFormData> }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.formContainer}>
            <Controller
                control={props.control}
                name={'omgjør.årsak'}
                render={({ field, fieldState }) => (
                    <Select
                        {...field}
                        label={formatMessage('form.omgjørVedtak.årsak.label')}
                        value={field.value ?? ''}
                        error={fieldState.error?.message}
                    >
                        <option value={''}>{formatMessage('form.omgjørVedtak.årsak.velgÅrsak')}</option>
                        {Object.values(OmgjøringsGrunn).map((årsak) => (
                            <option value={årsak} key={årsak}>
                                {formatMessage(årsak)}
                            </option>
                        ))}
                    </Select>
                )}
            />
            <Controller
                control={props.control}
                name={'omgjør.begrunnelse'}
                render={({ field, fieldState }) => (
                    <Textarea
                        {...field}
                        label={formatMessage('begrunnelse.label')}
                        value={field.value ?? ''}
                        error={fieldState.error?.message}
                        description={formatMessage('begrunnelse.description')}
                    />
                )}
            />
        </div>
    );
};

const OpprettholdVedtakForm = (props: { control: Control<VurderingAvKlageFormData> }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.formContainer}>
            <Controller
                control={props.control}
                name={'kabaldata.hjemmel'}
                render={({ field, fieldState }) => (
                    <CheckboxGroup
                        {...field}
                        legend={formatMessage('form.oversendelseKa.hjemmel.label')}
                        value={[...(field.value ?? '')]}
                        error={fieldState.error?.message}
                    >
                        <div className={styles.hjemmelCheckboxgroup}>
                            {Object.values(KabalVedtakHjemmel).map((hjemmel) => (
                                <Checkbox value={hjemmel} key={hjemmel}>
                                    {formatMessage(hjemmel)}
                                </Checkbox>
                            ))}
                        </div>
                    </CheckboxGroup>
                )}
            />
            <Controller
                control={props.control}
                name={'kabaldata.klagenotat'}
                render={({ field, fieldState }) => (
                    <Textarea
                        {...field}
                        minRows={5}
                        label={
                            <div className={styles.fritekstLabelOgHjelpeTekstContainer}>
                                <Label>{formatMessage('form.kabaldata.klagenotat')}</Label>
                            </div>
                        }
                        description={<div>{formatMessage('form.kabaldata.klagenotat.info')}</div>}
                        value={field.value ?? ''}
                        error={fieldState.error?.message}
                    />
                )}
            />
        </div>
    );
};

export default VurderingAvKlage;
