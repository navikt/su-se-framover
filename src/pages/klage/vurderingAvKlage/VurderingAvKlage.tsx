import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Checkbox, CheckboxGroup, Heading, Radio, RadioGroup, Select, Textarea } from '@navikt/ds-react';
import React from 'react';
import { Control, Controller, useForm } from 'react-hook-form';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
//import * as pdfApi from '~api/pdfApi';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import * as klageActions from '~features/klage/klageActions';
import { useAsyncActionCreator /* useBrevForhåndsvisning */ } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { KlageSteg } from '~pages/saksbehandling/types';
import { Klage } from '~types/Klage';
import { Sak } from '~types/Sak';

import { OmgjørVedtakGunst, OmgjørVedtakÅrsak, OpprettholdVedtakHjemmel } from '../klageUtils';

import messages from './VurderingAvKlage-nb';
import styles from './vurderingAvKlage.module.less';

enum vedtakVurdering {
    OMGJØR = 'omgjør_vedtak',
    OPPRETTHOLD = 'oppretthold_vedtak',
}

interface OmgjørFormData {
    årsak: Nullable<OmgjørVedtakÅrsak>;
    utfall: Nullable<OmgjørVedtakGunst>;
}

interface HjemmelFormData {
    hjemmel: OpprettholdVedtakHjemmel[];
}

interface VurderingAvKlageFormData {
    vedtakHandling: Nullable<vedtakVurdering>;
    omgjør: OmgjørFormData;
    oppretthold: HjemmelFormData;
    fritekst: Nullable<string>;
}

const schema = yup.object<VurderingAvKlageFormData>({
    vedtakHandling: yup
        .string()
        .defined()
        .oneOf([vedtakVurdering.OMGJØR, vedtakVurdering.OPPRETTHOLD], 'Feltet må fylles ut'),
    omgjør: yup
        .object<OmgjørFormData>()
        .defined()
        .when('vedtakHandling', {
            is: vedtakVurdering.OMGJØR,
            then: yup.object({
                årsak: yup.string().oneOf(Object.values(OmgjørVedtakÅrsak)).typeError('Feltet må fylles ut'),
                utfall: yup.string().oneOf(Object.values(OmgjørVedtakGunst)).typeError('Feltet må fylles ut'),
            }),
            otherwise: yup.object(),
        }),
    oppretthold: yup
        .object<HjemmelFormData>()
        .defined()
        .when('vedtakHandling', {
            is: vedtakVurdering.OPPRETTHOLD,
            then: yup.object({
                hjemmel: yup.array().of(yup.string()).required(),
            }),
            otherwise: yup.object(),
        }),
    fritekst: yup.string().nullable().defined(),
});

const VurderingAvKlage = (props: { sak: Sak; klage: Klage }) => {
    const { formatMessage } = useI18n({ messages });

    const [lagreVurderingAvKlageStatus, lagreVurderingAvKlage] = useAsyncActionCreator(
        klageActions.lagreVurderingAvKlage
    );
    //const [brevStatus, hentBrev] = useBrevForhåndsvisning(pdfApi);

    const { handleSubmit, watch, control } = useForm<VurderingAvKlageFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            vedtakHandling: null,
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
                sakId: props.sak.id,
                klageId: props.klage.id,
                //valdiering sikrer at feltet ikke er null
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                omgjør:
                    data.vedtakHandling === vedtakVurdering.OMGJØR
                        ? {
                              årsak: data.omgjør.årsak!,
                              utfall: data.omgjør.utfall!,
                          }
                        : null,
                oppretthold:
                    data.vedtakHandling === vedtakVurdering.OPPRETTHOLD
                        ? {
                              hjemmel: data.oppretthold.hjemmel!,
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
        <form onSubmit={handleSubmit(handleVurderingAvKlageSubmit)}>
            <Heading size="medium">{formatMessage('page.tittel')}</Heading>
            <div className={styles.vedtakHandlingContainer}>
                <Controller
                    control={control}
                    name={'vedtakHandling'}
                    render={({ field, fieldState }) => (
                        <RadioGroup
                            {...field}
                            legend={formatMessage('form.vedtakHandling.legend')}
                            error={fieldState.error?.message}
                            value={field.value ?? undefined}
                        >
                            <Radio value={vedtakVurdering.OMGJØR}>
                                {formatMessage('form.vedtakHandling.omgjørVedtak')}
                            </Radio>
                            <Radio value={vedtakVurdering.OPPRETTHOLD}>
                                {formatMessage('form.vedtakHandling.opprettholdVedtak')}
                            </Radio>
                        </RadioGroup>
                    )}
                />
            </div>

            {watch('vedtakHandling') === vedtakVurdering.OMGJØR && <OmgjørVedtakForm control={control} />}
            {watch('vedtakHandling') === vedtakVurdering.OPPRETTHOLD && <OpprettholdVedtakForm control={control} />}

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
                <Button variant="secondary">{formatMessage('knapp.seBrev')}</Button>
            </div>

            <div className={styles.knapperContainer}>
                <LinkAsButton
                    variant="secondary"
                    href={Routes.klage.createURL({
                        sakId: props.sak.id,
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
                        {Object.values(OmgjørVedtakGunst).map((gunst) => (
                            <Radio value={gunst} key={gunst}>
                                {formatMessage(gunst)}
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
