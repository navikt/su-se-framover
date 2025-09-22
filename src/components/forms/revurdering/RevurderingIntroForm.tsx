import { Alert, Checkbox, CheckboxGroup, Heading, Select, Textarea } from '@navikt/ds-react';
import { useEffect } from 'react';
import { Controller, FieldErrors } from 'react-hook-form';
import { useOutletContext } from 'react-router-dom';

import { PeriodeForm } from '~src/components/formElements/FormElements';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext.ts';
import { useI18n } from '~src/lib/i18n';
import { keyOf } from '~src/lib/types';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { NullablePeriode } from '~src/types/Periode';
import {
    erOmgjøring,
    gyldigeÅrsaker,
    InformasjonSomRevurderes,
    OmgjøringsGrunn,
    OpprettetRevurderingÅrsak,
} from '~src/types/Revurdering';
import { Sakstype } from '~src/types/Sak.ts';

import messages from './RevurderingIntroForm-nb';
import styles from './RevurderingIntroForm.module.less';
import { RevurderingIntroFormData, RevurderingIntroFormProps } from './RevurderingIntroFormUtils';

export const kreverKlageId = (årsak: OpprettetRevurderingÅrsak | null) => {
    return årsak && årsak !== OpprettetRevurderingÅrsak.OMGJØRING_EGET_TILTAK && erOmgjøring(årsak);
};

const RevurderingIntroForm = (props: RevurderingIntroFormProps) => {
    const { formatMessage } = useI18n({ messages });
    const { form } = props;

    const { sak } = useOutletContext<SaksoversiktContext>();

    const informasjonSomRevurderes = () => {
        const infoSomRevurderes = Object.values(InformasjonSomRevurderes);
        if (sak.sakstype === Sakstype.Alder) {
            return infoSomRevurderes.filter(
                (info) => info !== InformasjonSomRevurderes.Uførhet && info !== InformasjonSomRevurderes.Flyktning,
            );
        }
        return infoSomRevurderes.filter(
            (info) =>
                info !== InformasjonSomRevurderes.Familiegjenforening && info !== InformasjonSomRevurderes.Pensjon,
        );
    };

    const revurderingsÅrsak = form.watch('årsak');

    useEffect(() => {
        form.clearErrors();
    }, [revurderingsÅrsak]);

    return (
        <FormWrapper {...props}>
            <>
                <Heading level="2" size="small">
                    {formatMessage('periode.overskrift')}
                </Heading>
                <div className={styles.formInputContainer}>
                    <div className={styles.periodeOgÅrsakContainer}>
                        <Controller
                            control={form.control}
                            name={'periode'}
                            render={({ field }) => (
                                <PeriodeForm
                                    value={field.value}
                                    onChange={field.onChange}
                                    minDate={props.minOgMaxPeriode.fraOgMed}
                                    maxDate={props.minOgMaxPeriode.tilOgMed}
                                    error={form.formState.errors.periode as FieldErrors<NullablePeriode>}
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
                    </div>

                    {erOmgjøring(revurderingsÅrsak) && (
                        <>
                            <Controller
                                control={form.control}
                                name={'omgjøringGrunn'}
                                render={({ field: { value, ...field }, fieldState }) => (
                                    <Select
                                        id={field.name}
                                        label={formatMessage('input.omgjøringsgrunn.label')}
                                        error={fieldState.error?.message}
                                        value={value ?? ''}
                                        {...field}
                                    >
                                        <option value="" disabled>
                                            {formatMessage('input.omgjøringsgrunn.value')}
                                        </option>
                                        {Object.values(OmgjøringsGrunn).map((grunn) => (
                                            <option value={grunn} key={grunn}>
                                                {formatMessage(grunn)}
                                            </option>
                                        ))}
                                    </Select>
                                )}
                            />
                        </>
                    )}
                    {kreverKlageId(revurderingsÅrsak) && (
                        <>
                            {sak.klager.length > 0 ? (
                                <Controller
                                    control={form.control}
                                    name={'klageId'}
                                    render={({ field: { value, ...field }, fieldState }) => (
                                        <Select
                                            id={field.name}
                                            label={formatMessage('klage.knyttet.mot')}
                                            error={fieldState.error?.message}
                                            value={value ?? ''}
                                            {...field}
                                        >
                                            <option value="" disabled>
                                                {formatMessage('klage.mottattdato')}
                                            </option>
                                            {sak.klager.map((klage) => (
                                                <option value={klage.id} key={klage.id}>
                                                    {klage.datoKlageMottatt}
                                                </option>
                                            ))}
                                        </Select>
                                    )}
                                />
                            ) : (
                                <Alert variant="warning">
                                    Finner ingen klager å knytte klageomgjøringen mot, dette er påkrevd for å få
                                    opprettet en klageomgjøring
                                </Alert>
                            )}
                        </>
                    )}

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
                                        {informasjonSomRevurderes().map((i, idx) => (
                                            <Checkbox
                                                key={i}
                                                id={
                                                    idx === 0
                                                        ? keyOf<RevurderingIntroFormData>('informasjonSomRevurderes')
                                                        : undefined
                                                }
                                                value={i}
                                            >
                                                {formatMessage(i)}
                                            </Checkbox>
                                        ))}
                                    </div>
                                </CheckboxGroup>
                                <div>
                                    {field.value.includes(InformasjonSomRevurderes.Bosituasjon) && (
                                        <Alert variant="info">{formatMessage('info.bosituasjon')}</Alert>
                                    )}
                                </div>
                            </>
                        )}
                    />

                    <div className={styles.begrunnelseContainer}>
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
                </div>
            </>
        </FormWrapper>
    );
};

export default RevurderingIntroForm;
