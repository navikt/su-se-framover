import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Checkbox, CheckboxGroup, Heading, Label, Select, Textarea } from '@navikt/ds-react';
import classNames from 'classnames';
import * as DateFns from 'date-fns';
import React from 'react';
import DatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';

import { ApiError } from '~src/api/apiClient';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import SkjemaelementFeilmelding from '~src/components/formElements/SkjemaelementFeilmelding';
import { useI18n } from '~src/lib/i18n';
import { keyOf, Nullable } from '~src/lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import sharedMessages, { opprettetRevurderingGrunn } from '~src/pages/saksbehandling/revurdering/revurdering-nb';
import { FormValues } from '~src/pages/saksbehandling/revurdering/revurderingIntro/RevurderingIntroPage';
import {
    gyldigeÅrsaker,
    InformasjonSomRevurderes,
    InformasjonsRevurdering,
    OpprettetRevurderingGrunn,
} from '~src/types/Revurdering';

import { Navigasjonsknapper } from '../bunnknapper/Navigasjonsknapper';
import * as sharedStyles from '../revurdering.module.less';

import messages, { informasjonSomRevurderes } from './revurderingIntro-nb';
import * as styles from './revurderingIntro.module.less';

interface OpprettRevurderingFormData extends Omit<FormValues, 'fraOgMed' | 'årsak' | 'begrunnelse'> {
    fraOgMed: Nullable<Date>;
    årsak: Nullable<OpprettetRevurderingGrunn>;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<OpprettRevurderingFormData>({
    fraOgMed: yup.date().nullable().required(),
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
    minFraOgMed: Date;
    maxFraOgMed: Date;
    opprettRevurderingStatus: RemoteData.RemoteData<ApiError, null>;
    oppdaterRevurderingStatus: RemoteData.RemoteData<ApiError, null>;
}

const getInitialÅrsak = (årsak: OpprettetRevurderingGrunn | null | undefined) =>
    !årsak || årsak == OpprettetRevurderingGrunn.MIGRERT ? null : årsak;

const RevurderingIntroForm = (props: RevurderingIntroFormProps) => {
    const { formatMessage } = useI18n({
        messages: { ...messages, ...opprettetRevurderingGrunn, ...informasjonSomRevurderes, ...sharedMessages },
    });
    const form = useForm<OpprettRevurderingFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            fraOgMed: props.revurdering?.periode?.fraOgMed
                ? DateFns.parseISO(props.revurdering.periode.fraOgMed)
                : null,
            årsak: getInitialÅrsak(props.revurdering?.årsak),
            begrunnelse: props.revurdering?.begrunnelse ?? null,
            informasjonSomRevurderes: props.revurdering
                ? (Object.keys(props.revurdering.informasjonSomRevurderes) as InformasjonSomRevurderes[])
                : [],
        },
    });

    const formToSubmit = (values: OpprettRevurderingFormData) => ({
        fraOgMed: values.fraOgMed!,
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
                <div className={styles.periodeContainer}>
                    <div className={classNames(styles.datoContainerWrapper)}>
                        <div className={styles.datoContainer}>
                            <Label as="label" htmlFor="fom">
                                {formatMessage('datovelger.fom.legend')}
                            </Label>
                            <span>
                                <Controller
                                    control={form.control}
                                    name="fraOgMed"
                                    render={({ field, fieldState }) => (
                                        <>
                                            <DatePicker
                                                id={field.name}
                                                ariaInvalid={fieldState.error?.message ? 'true' : undefined}
                                                selected={field.value}
                                                onChange={(date) =>
                                                    field.onChange(Array.isArray(date) ? date[0] : date)
                                                }
                                                dateFormat="MM/yyyy"
                                                showMonthYearPicker
                                                isClearable
                                                selectsEnd
                                                startDate={field.value}
                                                minDate={props.minFraOgMed}
                                                maxDate={props.maxFraOgMed}
                                                autoComplete="off"
                                            />
                                            {fieldState.error?.message && (
                                                <SkjemaelementFeilmelding>
                                                    {fieldState.error?.message}
                                                </SkjemaelementFeilmelding>
                                            )}
                                        </>
                                    )}
                                />
                            </span>
                        </div>
                    </div>
                    <div className={styles.selectContainer}>
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
                    </div>

                    <div className={styles.årsakForRevurderingContainer}>
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
                                    </CheckboxGroup>
                                    <div className={styles.informasjonsContainer}>
                                        {field.value.includes(InformasjonSomRevurderes.Bosituasjon) && (
                                            <Alert variant="info">{formatMessage('info.bosituasjon')}</Alert>
                                        )}
                                    </div>
                                </>
                            )}
                        />
                    </div>

                    <div className={styles.begrunnelsesContainer}>
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
                </div>
                {RemoteData.isFailure(props.opprettRevurderingStatus) && (
                    <ApiErrorAlert error={props.opprettRevurderingStatus.error} />
                )}
                {RemoteData.isFailure(props.oppdaterRevurderingStatus) && (
                    <ApiErrorAlert error={props.oppdaterRevurderingStatus.error} />
                )}
                <Navigasjonsknapper
                    tilbake={{ url: props.tilbakeUrl, visModal: false }}
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
