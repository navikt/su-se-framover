import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Delete } from '@navikt/ds-icons';
import { Button, Heading, Panel, Select } from '@navikt/ds-react';
import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import DatePicker from '~src/components/datePicker/DatePicker';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { lagreOpplysningsplikt } from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { getDateErrorMessage } from '~src/lib/validering';
import { RevurderingBunnknapper } from '~src/pages/saksbehandling/revurdering/bunnknapper/RevurderingBunnknapper';
import * as sharedStyles from '~src/pages/saksbehandling/revurdering/revurdering.module.less';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import { OpplysningspliktBeksrivelse } from '~src/types/grunnlagsdataOgVilkårsvurderinger/opplysningsplikt/Opplysningsplikt';
import { RevurderingStegProps } from '~src/types/Revurdering';
import { parseIsoDateOnly, sluttenAvMåneden, toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import messages from './opplysningsplikt-nb';
import * as styles from './opplysningsplikt.module.less';
import { OpplysningspliktVilkårForm, schemaValidation } from './OpplysningspliktUtils';

const Opplysningsplikt = (props: RevurderingStegProps) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...messages } });
    const [status, lagre] = useAsyncActionCreator(lagreOpplysningsplikt);

    const vurderinger = props.revurdering.grunnlagsdataOgVilkårsvurderinger.opplysningsplikt?.vurderinger ?? [
        { periode: props.revurdering.periode, beskrivelse: undefined },
    ];

    const revurderingsperiode = {
        fraOgMed: new Date(props.revurdering.periode.fraOgMed),
        tilOgMed: new Date(props.revurdering.periode.tilOgMed),
    };

    const form = useForm<OpplysningspliktVilkårForm>({
        resolver: yupResolver(schemaValidation),
        defaultValues: {
            opplysningsplikt: vurderinger.map((vurdering) => ({
                periode: {
                    fraOgMed: parseIsoDateOnly(vurdering.periode.fraOgMed),
                    tilOgMed: parseIsoDateOnly(vurdering.periode.tilOgMed),
                },
                beskrivelse: vurdering.beskrivelse ?? null,
            })),
        },
    });

    const { fields, append, remove } = useFieldArray({
        name: 'opplysningsplikt',
        control: form.control,
    });

    const handleSubmit = async (form: OpplysningspliktVilkårForm, gåtil: 'neste' | 'avbryt') => {
        lagre(
            {
                id: props.revurdering.id,
                type: 'REVURDERING',
                data: form.opplysningsplikt.map((v) => ({
                    periode: {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        fraOgMed: toIsoDateOnlyString(v.periode.fraOgMed!),
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        tilOgMed: toIsoDateOnlyString(sluttenAvMåneden(v.periode.tilOgMed!)),
                    },
                    beskrivelse: v.beskrivelse,
                })),
            },
            () => navigate(gåtil === 'neste' ? props.nesteUrl : props.avsluttUrl)
        );
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <form
                        className={sharedStyles.revurderingContainer}
                        onSubmit={form.handleSubmit((values) => handleSubmit(values, 'neste'))}
                    >
                        {fields.map((opplysningsplikt, index) => (
                            <Panel border key={opplysningsplikt.id} className={styles.panel}>
                                <div className={styles.periodeOgSlett}>
                                    {fields.length > 1 && (
                                        <Button
                                            variant="secondary"
                                            className={styles.søppelbøtte}
                                            type="button"
                                            onClick={() => remove(index)}
                                            size="small"
                                            aria-label={formatMessage('periode.slett')}
                                        >
                                            <Delete />
                                        </Button>
                                    )}
                                    <div className={styles.periode}>
                                        <Controller
                                            control={form.control}
                                            name={`opplysningsplikt.${index}.periode.fraOgMed`}
                                            render={({ field, fieldState }) => (
                                                <DatePicker
                                                    className={styles.dato}
                                                    id={field.name}
                                                    label={formatMessage('datepicker.fom')}
                                                    dateFormat="MM/yyyy"
                                                    showMonthYearPicker
                                                    isClearable
                                                    autoComplete="off"
                                                    value={field.value}
                                                    onChange={(date: Date | null) => field.onChange(date)}
                                                    minDate={revurderingsperiode.fraOgMed}
                                                    maxDate={revurderingsperiode.tilOgMed}
                                                    feil={getDateErrorMessage(fieldState.error)}
                                                />
                                            )}
                                        />
                                        <Controller
                                            control={form.control}
                                            name={`opplysningsplikt.${index}.periode.tilOgMed`}
                                            render={({ field, fieldState }) => (
                                                <DatePicker
                                                    className={styles.dato}
                                                    id={field.name}
                                                    label={formatMessage('datepicker.tom')}
                                                    dateFormat="MM/yyyy"
                                                    showMonthYearPicker
                                                    isClearable
                                                    autoComplete="off"
                                                    value={field.value}
                                                    onChange={(date: Date | null) => field.onChange(date)}
                                                    minDate={revurderingsperiode.fraOgMed}
                                                    maxDate={revurderingsperiode.tilOgMed}
                                                    feil={getDateErrorMessage(fieldState.error)}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                                <Controller
                                    control={form.control}
                                    name={`opplysningsplikt.${index}.beskrivelse`}
                                    render={({ field, fieldState }) => (
                                        <Select
                                            className={styles.select}
                                            {...field}
                                            label={formatMessage('select.label')}
                                            value={field.value ?? ''}
                                            error={fieldState.error?.message}
                                        >
                                            <option value="">{formatMessage('select.defaultValue')}</option>
                                            {Object.values(OpplysningspliktBeksrivelse).map((beskrivelse) => (
                                                <option value={beskrivelse} key={beskrivelse}>
                                                    {formatMessage(beskrivelse)}
                                                </option>
                                            ))}
                                        </Select>
                                    )}
                                />
                            </Panel>
                        ))}
                        <Button
                            className={styles.nyPeriodeKnapp}
                            variant="secondary"
                            onClick={() =>
                                append({
                                    periode: { tilOgMed: null, fraOgMed: null },
                                    beskrivelse: null,
                                })
                            }
                            type={'button'}
                        >
                            {formatMessage('periode.ny')}
                        </Button>
                        {RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} />}
                        <RevurderingBunnknapper
                            tilbake={props.forrige}
                            loading={RemoteData.isPending(status)}
                            onLagreOgFortsettSenereClick={form.handleSubmit((values) => handleSubmit(values, 'avbryt'))}
                        />
                    </form>
                ),
                right: (
                    <div>
                        <Heading level="2" size="large" spacing>
                            {formatMessage('eksisterende.vedtakinfo.tittel')}
                        </Heading>
                    </div>
                ),
            }}
        </ToKolonner>
    );
};

export default Opplysningsplikt;
