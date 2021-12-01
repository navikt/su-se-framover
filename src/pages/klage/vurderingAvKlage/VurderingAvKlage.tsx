import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Checkbox, CheckboxGroup, Radio, Loader, RadioGroup, Select, Textarea } from '@navikt/ds-react';
import { struct } from 'fp-ts/Eq';
import * as A from 'fp-ts/lib/Array';
import * as S from 'fp-ts/string';
import React from 'react';
import { Control, Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';

import * as pdfApi from '~api/pdfApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as klageActions from '~features/klage/klageActions';
import { useAsyncActionCreator, useBrevForhåndsvisning } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { eqNullable, Nullable } from '~lib/types';
import { KlageSteg } from '~pages/saksbehandling/types';
import {
    Klage,
    OmgjørVedtakUtfall,
    OmgjørVedtakÅrsak,
    OpprettholdVedtakHjemmel,
    KlageVurderingType,
    KlageStatus,
} from '~types/Klage';

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

/* const schema = yup.object<VurderingAvKlageFormData>({
    klageVurderingType: yup.string().required().oneOf([KlageVurderingType.OMGJØR, KlageVurderingType.OPPRETTHOLD]),
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
    fritekstTilBrev: yup.string().nullable().defined(),
});*/

const VurderingAvKlage = (props: { sakId: string; klage: Klage }) => {
    const history = useHistory();
    const { formatMessage } = useI18n({ messages });

    const [lagreVurderingAvKlageStatus, lagreVurderingAvKlage] = useAsyncActionCreator(
        klageActions.lagreVurderingAvKlage
    );
    const [bekreftVurderingerStatus, bekreftVurderinger] = useAsyncActionCreator(klageActions.bekreftVurderinger);
    const [brevStatus, hentBrev] = useBrevForhåndsvisning(pdfApi.hentBrevutkastForOppretthold);

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
        formState: { isDirty, isSubmitSuccessful },
        reset,
        ...form
    } = useForm<VurderingAvKlageFormData>({
        //resolver: yupResolver(schema),
        defaultValues: initialValues,
    });

    const handleVurderingAvKlageSubmit = (data: VurderingAvKlageFormData) => {
        if (eqVurderingAvKlageFormData.equals(data, initialValues)) {
            return;
        }

        lagreVurderingAvKlage(
            {
                sakId: props.sakId,
                klageId: props.klage.id,
                //valdiering sikrer at feltet ikke er null
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                omgjør:
                    data.klageVurderingType === KlageVurderingType.OMGJØR
                        ? {
                              årsak: data.omgjør.årsak!,
                              utfall: data.omgjør.utfall!,
                          }
                        : null,
                oppretthold:
                    data.klageVurderingType === KlageVurderingType.OPPRETTHOLD
                        ? {
                              hjemler: data.oppretthold.hjemmel!,
                          }
                        : null,
                /* eslint-enable @typescript-eslint/no-non-null-assertion */
                fritekstTilBrev: data.fritekstTilBrev,
            },
            (klage) => {
                //vi resetter formet, slik at tilstandssjekken til isDirty, og isSubmitSuccessful har den nye dataen
                reset({
                    klageVurderingType: klage.vedtaksvurdering?.type ?? null,
                    omgjør: {
                        årsak: klage.vedtaksvurdering?.omgjør?.årsak ?? null,
                        utfall: klage.vedtaksvurdering?.omgjør?.utfall ?? null,
                    },
                    oppretthold: {
                        hjemmel: klage.vedtaksvurdering?.oppretthold?.hjemler ?? [],
                    },
                    fritekstTilBrev: klage.fritekstTilBrev,
                });
            }
        );
    };

    const handleBekreftOgFortsettClick = () => {
        if (props.klage.status === KlageStatus.VURDERT_BEKREFTET) {
            history.push(
                Routes.klage.createURL({
                    sakId: props.sakId,
                    klageId: props.klage.id,
                    steg: KlageSteg.Oppsummering,
                })
            );
            return;
        }

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
    };

    const iGyldigTilstandForÅBekrefteOgFortsette = () => {
        return (
            (props.klage.status !== KlageStatus.VURDERT_UTFYLT &&
                props.klage.status !== KlageStatus.VURDERT_BEKREFTET) ||
            (isDirty && !isSubmitSuccessful)
        );
    };

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <form onSubmit={handleSubmit(handleVurderingAvKlageSubmit)}>
                        <div className={styles.vedtakHandlingContainer}>
                            <Controller
                                control={control}
                                name={'klageVurderingType'}
                                render={({ field, fieldState }) => (
                                    <RadioGroup
                                        {...field}
                                        legend={formatMessage('form.klageVurderingType.legend')}
                                        error={fieldState.error?.message}
                                        value={field.value ?? undefined}
                                    >
                                        <Radio value={KlageVurderingType.OMGJØR}>
                                            {formatMessage(KlageVurderingType.OMGJØR)}
                                        </Radio>
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
                                        label={formatMessage('form.fritekst.label')}
                                        value={field.value ?? ''}
                                        error={fieldState.error?.message}
                                    />
                                )}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    const values = form.getValues();

                                    hentBrev({
                                        sakId: props.sakId,
                                        klageId: props.klage.id,
                                        fritekst: values.fritekstTilBrev ?? '',
                                        hjemler: values.oppretthold.hjemmel,
                                    });
                                }}
                            >
                                {formatMessage('knapp.seBrev')}
                                {RemoteData.isPending(brevStatus) && <Loader />}
                            </Button>
                        </div>

                        <div className={styles.knapperContainer}>
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
                            <Button variant="secondary">
                                {formatMessage('knapp.lagre')}
                                {RemoteData.isPending(lagreVurderingAvKlageStatus) && <Loader />}
                            </Button>
                            <Button
                                type="button"
                                disabled={iGyldigTilstandForÅBekrefteOgFortsette()}
                                onClick={() => handleBekreftOgFortsettClick()}
                            >
                                {formatMessage('knapp.bekreftOgFortsett')}
                                {RemoteData.isPending(bekreftVurderingerStatus) && <Loader />}
                            </Button>
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
                        <option value="">{formatMessage('form.omgjørVedtak.årsak.velgÅrsak')}</option>
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
                        value={field.value ?? undefined}
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
