import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Checkbox, CheckboxGroup, Heading, Select, Textarea } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { PeriodeForm } from '~src/components/formElements/FormElements';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { keyOf, Nullable } from '~src/lib/types';
import yup, { hookFormErrorsTilFeiloppsummering, validerPeriodeTomEtterFom } from '~src/lib/validering';
import sharedMessages from '~src/pages/saksbehandling/revurdering/revurdering-nb';
import { FormValues } from '~src/pages/saksbehandling/revurdering/revurderingIntro/RevurderingIntroPage';
import {
    gyldigeÅrsaker,
    InformasjonSomRevurderes,
    InformasjonsRevurdering,
    OpprettetRevurdering,
    OpprettetRevurderingGrunn,
} from '~src/types/Revurdering';

import { Navigasjonsknapper } from '../../bunnknapper/Navigasjonsknapper';
import * as sharedStyles from '../revurdering.module.less';

import messages, { informasjonSomRevurderes } from './revurderingIntro-nb';
import * as styles from './revurderingIntro.module.less';

interface OpprettRevurderingFormData extends Omit<FormValues, 'periode' | 'årsak' | 'begrunnelse'> {
    periode: {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    };
    årsak: Nullable<OpprettetRevurderingGrunn>;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<OpprettRevurderingFormData>({
    periode: validerPeriodeTomEtterFom,
    årsak: yup.mixed<OpprettetRevurderingGrunn>().nullable().required(),
    begrunnelse: yup.string().nullable().required(),
    informasjonSomRevurderes: yup
        .array<InformasjonSomRevurderes>(
            yup.mixed<InformasjonSomRevurderes>().oneOf(Object.values(InformasjonSomRevurderes))
        )
        .min(1, 'Du må velge minst en ting å revurdere')
        .required(),
});

interface RevurderingIntroFormProps {
    save: (arg: FormValues, goTo: 'neste' | 'avbryt') => void;
    tilbakeUrl: string;
    revurdering?: InformasjonsRevurdering;
    periodeConfig: {
        fraOgMed: {
            min: Date;
            max: Date;
        };
        tilOgMed: {
            max: Date;
        };
    };
    opprettRevurderingStatus: ApiResult<OpprettetRevurdering>;
    oppdaterRevurderingStatus: ApiResult<OpprettetRevurdering>;
}

const getInitialÅrsak = (årsak: OpprettetRevurderingGrunn | null | undefined) =>
    !årsak || årsak == OpprettetRevurderingGrunn.MIGRERT ? null : årsak;

const RevurderingIntroForm = (props: RevurderingIntroFormProps) => {
    const { formatMessage } = useI18n({
        messages: { ...messages, ...informasjonSomRevurderes, ...sharedMessages },
    });
    const form = useForm<OpprettRevurderingFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            periode: {
                fraOgMed: props.revurdering?.periode?.fraOgMed
                    ? DateFns.parseISO(props.revurdering.periode.fraOgMed)
                    : null,
                tilOgMed: props.revurdering?.periode.tilOgMed
                    ? DateFns.parseISO(props.revurdering.periode.tilOgMed)
                    : props.periodeConfig.tilOgMed.max,
            },
            årsak: getInitialÅrsak(props.revurdering?.årsak),
            begrunnelse: props.revurdering?.begrunnelse ?? null,
            informasjonSomRevurderes: props.revurdering
                ? (Object.keys(props.revurdering.informasjonSomRevurderes) as InformasjonSomRevurderes[])
                : [],
        },
    });

    const formToSubmit = (values: OpprettRevurderingFormData) => ({
        periode: {
            fraOgMed: values.periode.fraOgMed!,
            tilOgMed: values.periode.tilOgMed!,
        },
        årsak: values.årsak!,
        informasjonSomRevurderes: values.informasjonSomRevurderes,
        begrunnelse: values.begrunnelse!,
    });

    return (
        <form
            className={sharedStyles.revurderingContainer}
            onSubmit={form.handleSubmit((values) => props.save(formToSubmit(values), 'neste'))}
        >
            <div className={sharedStyles.mainContentContainer}>
                <Heading level="2" size="small">
                    {formatMessage('periode.overskrift')}
                </Heading>
                <div className={styles.formInputContainer}>
                    <Controller
                        control={form.control}
                        name={'periode'}
                        render={({ field }) => (
                            <PeriodeForm
                                name={field.name}
                                value={field.value}
                                onChange={field.onChange}
                                minDate={{
                                    fraOgMed: props.periodeConfig.fraOgMed.min,
                                    tilOgMed: form.watch('periode.fraOgMed'),
                                }}
                                maxDate={{
                                    fraOgMed: props.periodeConfig.fraOgMed.max,
                                    tilOgMed: props.periodeConfig.tilOgMed.max,
                                }}
                                error={form.formState.errors.periode}
                                disableTom
                            />
                        )}
                    />

                    <Controller
                        control={form.control}
                        name={'årsak'}
                        render={({ field: { value, ...field }, fieldState }) => (
                            <Select
                                id={field.name}
                                label={formatMessage('input.årsak.label')}
                                error={fieldState.error?.message}
                                value={value ?? ''}
                                {...field}
                            >
                                <option value="" disabled>
                                    {formatMessage('input.årsak.value.default')}
                                </option>
                                {gyldigeÅrsaker.map((grunn) => (
                                    <option value={grunn} key={grunn}>
                                        {formatMessage(grunn)}
                                    </option>
                                ))}
                            </Select>
                        )}
                    />

                    <Controller
                        control={form.control}
                        name={'informasjonSomRevurderes'}
                        render={({ field, fieldState }) => (
                            <>
                                <CheckboxGroup
                                    legend={formatMessage('input.informasjonSomRevurderes.label')}
                                    error={fieldState.error?.message}
                                    {...field}
                                >
                                    <div className={styles.informasjonSomRevurderesCheckboxContainer}>
                                        {Object.values(InformasjonSomRevurderes).map((i, idx) => (
                                            <Checkbox
                                                key={i}
                                                id={
                                                    idx === 0
                                                        ? keyOf<FormValues>('informasjonSomRevurderes')
                                                        : undefined
                                                }
                                                value={i}
                                            >
                                                {formatMessage(i)}
                                            </Checkbox>
                                        ))}
                                    </div>
                                </CheckboxGroup>
                                <div className={styles.informasjonsContainer}>
                                    {field.value.includes(InformasjonSomRevurderes.Bosituasjon) && (
                                        <Alert variant="info">{formatMessage('info.bosituasjon')}</Alert>
                                    )}
                                </div>
                            </>
                        )}
                    />

                    <Controller
                        control={form.control}
                        name={'begrunnelse'}
                        render={({ field: { value, ...field }, fieldState }) => (
                            <Textarea
                                id={field.name}
                                label={formatMessage('input.begrunnelse.label')}
                                error={fieldState.error?.message}
                                value={value ?? ''}
                                {...field}
                                description={formatMessage('revurdering.begrunnelse.description')}
                            />
                        )}
                    />
                </div>
                <Feiloppsummering
                    tittel={formatMessage('feiloppsummering.title')}
                    hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                    feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                />

                {RemoteData.isFailure(props.opprettRevurderingStatus) && (
                    <ApiErrorAlert error={props.opprettRevurderingStatus.error} />
                )}
                {RemoteData.isFailure(props.oppdaterRevurderingStatus) && (
                    <ApiErrorAlert error={props.oppdaterRevurderingStatus.error} />
                )}
                <Navigasjonsknapper
                    tilbake={{ url: props.tilbakeUrl }}
                    onLagreOgFortsettSenereClick={form.handleSubmit((values) =>
                        props.save(formToSubmit(values), 'avbryt')
                    )}
                    loading={
                        RemoteData.isPending(props.opprettRevurderingStatus) ||
                        RemoteData.isPending(props.oppdaterRevurderingStatus)
                    }
                />
            </div>
        </form>
    );
};

export default RevurderingIntroForm;
