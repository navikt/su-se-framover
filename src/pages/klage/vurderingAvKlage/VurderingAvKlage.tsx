import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    Button,
    Checkbox,
    CheckboxGroup,
    Radio,
    Loader,
    RadioGroup,
    Select,
    Textarea,
    Alert,
    Label,
    HelpText,
} from '@navikt/ds-react';
import { struct } from 'fp-ts/Eq';
import * as A from 'fp-ts/lib/Array';
import * as S from 'fp-ts/string';
import React from 'react';
import { Control, Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import * as pdfApi from '~api/pdfApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as klageActions from '~features/klage/klageActions';
import { useAsyncActionCreator, useBrevForhåndsvisning } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { eqNullable, Nullable } from '~lib/types';
import yup from '~lib/validering';
import { KlageSteg } from '~pages/saksbehandling/types';
import {
    Klage,
    OmgjørVedtakUtfall,
    OmgjørVedtakÅrsak,
    OpprettholdVedtakHjemmel,
    KlageVurderingType,
    KlageStatus,
} from '~types/Klage';
import { erKlageVurdert, erKlageVurdertBekreftet } from '~utils/klage/klageUtils';

import sharedStyles from '../klage.module.less';

import messages from './VurderingAvKlage-nb';
import styles from './vurderingAvKlage.module.less';

interface OmgjørFormData {
    årsak: Nullable<OmgjørVedtakÅrsak>;
    utfall: Nullable<OmgjørVedtakUtfall>;
}

interface HjemmelFormData {
    hjemmel: OpprettholdVedtakHjemmel[];
}

interface VurderingAvKlageFormData {
    klageVurderingType: Nullable<KlageVurderingType>;
    omgjør: OmgjørFormData;
    oppretthold: HjemmelFormData;
    fritekstTilBrev: Nullable<string>;
}

const eqOmgjør = struct<OmgjørFormData>({
    årsak: eqNullable(S.Eq),
    utfall: eqNullable(S.Eq),
});

const eqOppretthold = struct<HjemmelFormData>({
    hjemmel: A.getEq(S.Eq),
});

const eqVurderingAvKlageFormData = struct<VurderingAvKlageFormData>({
    klageVurderingType: eqNullable(S.Eq),
    omgjør: eqOmgjør,
    oppretthold: eqOppretthold,
    fritekstTilBrev: eqNullable(S.Eq),
});

const schema = yup.object<VurderingAvKlageFormData>({
    klageVurderingType: yup
        .string()
        .defined()
        .required()
        .oneOf(
            [KlageVurderingType.OMGJØR, KlageVurderingType.OPPRETTHOLD],
            'Feltet må være "Omgjør", eller "Oppretthold"'
        ),
    omgjør: yup
        .object<OmgjørFormData>()
        .defined()
        .when('klageVurderingType', {
            is: KlageVurderingType.OMGJØR,
            then: yup.object({
                årsak: yup.string().oneOf(Object.values(OmgjørVedtakÅrsak)).required(),
                utfall: yup.string().oneOf(Object.values(OmgjørVedtakUtfall)).required(),
            }),
            otherwise: yup.object().nullable(),
        }),
    oppretthold: yup
        .object<HjemmelFormData>()
        .defined()
        .when('klageVurderingType', {
            is: KlageVurderingType.OPPRETTHOLD,
            then: yup.object<HjemmelFormData>({
                hjemmel: yup.array<OpprettholdVedtakHjemmel>().required(),
            }),
            otherwise: yup.object().nullable(),
        }),
    fritekstTilBrev: yup.string().required().typeError('Feltet må fylles ut'),
});

const VurderingAvKlage = (props: { sakId: string; klage: Klage }) => {
    const history = useHistory();
    const { formatMessage } = useI18n({ messages });

    const [lagreVurderingAvKlageStatus, lagreVurderingAvKlage] = useAsyncActionCreator(
        klageActions.lagreVurderingAvKlage
    );
    const [bekreftVurderingerStatus, bekreftVurderinger] = useAsyncActionCreator(klageActions.bekreftVurderinger);
    const [brevStatus, hentBrev] = useBrevForhåndsvisning(pdfApi.hentBrevutkastForKlage);

    const initialValues = {
        klageVurderingType: props.klage.vedtaksvurdering?.type ?? null,
        omgjør: {
            årsak: props.klage.vedtaksvurdering?.omgjør?.årsak ?? null,
            utfall: props.klage.vedtaksvurdering?.omgjør?.utfall ?? null,
        },
        oppretthold: {
            hjemmel: props.klage.vedtaksvurdering?.oppretthold?.hjemler ?? [],
        },
        fritekstTilBrev: props.klage.fritekstTilBrev,
    };

    const {
        handleSubmit,
        watch,
        control,
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
                          utfall: data.omgjør.utfall,
                      }
                    : null,
            oppretthold:
                data.klageVurderingType === KlageVurderingType.OPPRETTHOLD
                    ? {
                          hjemler: data.oppretthold.hjemmel,
                      }
                    : null,
            fritekstTilBrev: data.fritekstTilBrev,
        };
    };

    const onSeBrevClick = (data: VurderingAvKlageFormData) => {
        lagreVurderingAvKlage(lagOpprettholdApiBody(data), () => {
            hentBrev({ sakId: props.sakId, klageId: props.klage.id });
        });
    };

    const handleLagreVurderingAvKlageClick = (data: VurderingAvKlageFormData) => {
        if (eqVurderingAvKlageFormData.equals(data, initialValues)) {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
            return;
        }

        lagreVurderingAvKlage(lagOpprettholdApiBody(data), () => {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
        });
    };

    const handleBekreftOgFortsettSubmit = (data: VurderingAvKlageFormData) => {
        if (erKlageVurdertBekreftet(props.klage) && !isDirty) {
            history.push(
                Routes.klage.createURL({
                    sakId: props.sakId,
                    klageId: props.klage.id,
                    steg: KlageSteg.Oppsummering,
                })
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
                    history.push(
                        Routes.klage.createURL({
                            sakId: props.sakId,
                            klageId: props.klage.id,
                            steg: KlageSteg.Oppsummering,
                        })
                    );
                }
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
                                        {/*TODO: fjern false når vi har støtte for omgjør */}
                                        {false && (
                                            <Radio value={KlageVurderingType.OMGJØR}>
                                                {formatMessage(KlageVurderingType.OMGJØR)}
                                            </Radio>
                                        )}
                                        <Radio value={KlageVurderingType.OPPRETTHOLD}>
                                            {formatMessage(KlageVurderingType.OPPRETTHOLD)}
                                        </Radio>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        {watch('klageVurderingType') === KlageVurderingType.OMGJØR && (
                            <OmgjørVedtakForm control={control} />
                        )}
                        {watch('klageVurderingType') === KlageVurderingType.OPPRETTHOLD && (
                            <OpprettholdVedtakForm control={control} />
                        )}

                        <div className={styles.fritesktOgVisBrevContainer}>
                            <Controller
                                control={control}
                                name={'fritekstTilBrev'}
                                render={({ field, fieldState }) => (
                                    <Textarea
                                        {...field}
                                        label={
                                            <div className={styles.fritekstLabelOgHjelpeTekstContainer}>
                                                <Label>{formatMessage('form.fritekst.label')}</Label>
                                                <HelpText>
                                                    <Label className={styles.hjelpetekst}>
                                                        {formatMessage('form.fritekst.hjelpeTekst')}
                                                    </Label>
                                                </HelpText>
                                            </div>
                                        }
                                        value={field.value ?? ''}
                                        error={fieldState.error?.message}
                                    />
                                )}
                            />
                            <Button
                                type="button"
                                className={styles.seBrevButton}
                                variant="secondary"
                                loading={RemoteData.isPending(brevStatus)}
                                onClick={() => onSeBrevClick(watch())}
                            >
                                {formatMessage('knapp.seBrev')}
                            </Button>
                            {RemoteData.isFailure(brevStatus) && <ApiErrorAlert error={brevStatus.error} />}
                        </div>

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
                        {Object.values(OmgjørVedtakÅrsak).map((årsak) => (
                            <option value={årsak} key={årsak}>
                                {formatMessage(årsak)}
                            </option>
                        ))}
                    </Select>
                )}
            />
            <Controller
                control={props.control}
                name={'omgjør.utfall'}
                render={({ field, fieldState }) => (
                    <RadioGroup
                        legend=""
                        hideLegend
                        {...field}
                        error={fieldState.error?.message}
                        value={field.value ?? ''}
                    >
                        {Object.values(OmgjørVedtakUtfall).map((utfall) => (
                            <Radio value={utfall} key={utfall}>
                                {formatMessage(utfall)}
                            </Radio>
                        ))}
                    </RadioGroup>
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
                name={'oppretthold.hjemmel'}
                render={({ field, fieldState }) => (
                    <CheckboxGroup
                        {...field}
                        legend={formatMessage('form.opprettholdVedtak.hjemmel.label')}
                        value={[...(field.value ?? '')]}
                        error={fieldState.error?.message}
                    >
                        <div className={styles.hjemmelCheckboxgroup}>
                            {Object.values(OpprettholdVedtakHjemmel).map((hjemmel) => (
                                <Checkbox value={hjemmel} key={hjemmel}>
                                    {formatMessage(hjemmel)}
                                </Checkbox>
                            ))}
                        </div>
                    </CheckboxGroup>
                )}
            />
        </div>
    );
};

export default VurderingAvKlage;
