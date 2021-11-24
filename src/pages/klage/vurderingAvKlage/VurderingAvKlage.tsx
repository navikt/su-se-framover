import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Checkbox, CheckboxGroup, Radio, Loader, RadioGroup, Select, Textarea } from '@navikt/ds-react';
import React from 'react';
import { Control, Controller, useForm } from 'react-hook-form';

import * as pdfApi from '~api/pdfApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as klageActions from '~features/klage/klageActions';
import { useAsyncActionCreator, useBrevForhåndsvisning } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { KlageSteg } from '~pages/saksbehandling/types';
import {
    Klage,
    OmgjørVedtakUtfall,
    OmgjørVedtakÅrsak,
    OpprettholdVedtakHjemmel,
    KlageVurderingType,
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
    fritekst: Nullable<string>;
}

const schema = yup.object<VurderingAvKlageFormData>({
    klageVurderingType: yup
        .string()
        .defined()
        .oneOf([KlageVurderingType.OMGJØR, KlageVurderingType.OPPRETTHOLD], 'Feltet må fylles ut'),
    omgjør: yup
        .object<OmgjørFormData>()
        .defined()
        .when('KlageVurderingType', {
            is: KlageVurderingType.OMGJØR,
            then: yup.object({
                årsak: yup.string().oneOf(Object.values(OmgjørVedtakÅrsak)).typeError('Feltet må fylles ut'),
                utfall: yup.string().oneOf(Object.values(OmgjørVedtakUtfall)).typeError('Feltet må fylles ut'),
            }),
            otherwise: yup.object(),
        }),
    oppretthold: yup
        .object<HjemmelFormData>()
        .defined()
        .when('KlageVurderingType', {
            is: KlageVurderingType.OPPRETTHOLD,
            then: yup.object({
                hjemmel: yup.array().of(yup.string()).required(),
            }),
            otherwise: yup.object(),
        }),
    fritekst: yup.string().nullable().defined(),
});

const VurderingAvKlage = (props: { sakId: string; klage: Klage }) => {
    const { formatMessage } = useI18n({ messages });

    const [lagreVurderingAvKlageStatus, lagreVurderingAvKlage] = useAsyncActionCreator(
        klageActions.lagreVurderingAvKlage
    );
    const [brevStatus, hentBrev] = useBrevForhåndsvisning(pdfApi.hentBrevutkastForOppretthold);

    const { handleSubmit, watch, control } = useForm<VurderingAvKlageFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            klageVurderingType: null,
            omgjør: {
                årsak: null,
                utfall: null,
            },
            oppretthold: {
                hjemmel: [],
            },
            fritekst: null,
        },
    });

    const handleVurderingAvKlageSubmit = (data: VurderingAvKlageFormData) => {
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
                fritekstTilBrev: data.fritekst,
            },
            () => {
                console.log('success!');
            }
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
                                            {formatMessage('form.klageVurderingType.omgjørVedtak')}
                                        </Radio>
                                        <Radio value={KlageVurderingType.OPPRETTHOLD}>
                                            {formatMessage('form.klageVurderingType.opprettholdVedtak')}
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
                                name={'fritekst'}
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
                                onClick={() => hentBrev({ sakId: props.sakId, klageId: props.klage.id })}
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
                            <Button>{formatMessage('knapp.neste')}</Button>
                        </div>
                        {RemoteData.isFailure(lagreVurderingAvKlageStatus) && (
                            <ApiErrorAlert error={lagreVurderingAvKlageStatus.error} />
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
