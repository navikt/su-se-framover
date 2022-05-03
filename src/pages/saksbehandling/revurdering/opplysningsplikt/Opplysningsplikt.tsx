import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Delete } from '@navikt/ds-icons';
import { Button, Heading, Panel } from '@navikt/ds-react';
import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import DatePicker from '~src/components/datePicker/DatePicker';
import { Utenlandsoppsummering } from '~src/components/revurdering/oppsummering/utenlandsopphold/Utenlandsoppsummering';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { lagreOpplysningsplikt } from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import yup, { getDateErrorMessage } from '~src/lib/validering';
import { RevurderingBunnknapper } from '~src/pages/saksbehandling/revurdering/bunnknapper/RevurderingBunnknapper';
import revurderingmessages, { stegmessages } from '~src/pages/saksbehandling/revurdering/revurdering-nb';
import * as sharedStyles from '~src/pages/saksbehandling/revurdering/revurdering.module.less';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import { RevurderingStegProps } from '~src/types/Revurdering';
import { parseIsoDateOnly, sluttenAvMåneden, toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import messages from './opplysningsplikt-nb';
import * as styles from './opplysningsplikt.module.less';

interface OpplysningspliktVilkårForm {
    opplysningsplikt: VurderingsperioderOpplysinngspliktFormData[];
}

interface VurderingsperioderOpplysinngspliktFormData {
    periode: {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    };
    beskrivelse: Nullable<string>;
}

const schemaValidation = yup.object<OpplysningspliktVilkårForm>({
    opplysningsplikt: yup
        .array<VurderingsperioderOpplysinngspliktFormData>(
            yup
                .object<VurderingsperioderOpplysinngspliktFormData>({
                    beskrivelse: yup.string().nullable().defined(),
                    periode: yup
                        .object({
                            fraOgMed: yup.date().required().typeError('Dato må fylles inn'),
                            tilOgMed: yup.date().required().typeError('Dato må fylles inn'),
                        })
                        .required(),
                })
                .required()
        )
        .min(1)
        .required(),
});

const Opplysningsplikt = (props: RevurderingStegProps) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...stegmessages, ...revurderingmessages } });
    const navigate = useNavigate();
    const vurderinger = props.revurdering.grunnlagsdataOgVilkårsvurderinger.opplysningsplikt?.vurderinger ?? [
        { periode: props.revurdering.periode, beskrivelse: undefined },
    ];
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
    const [status, lagre] = useAsyncActionCreator(lagreOpplysningsplikt);

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

    const { fields, append, remove } = useFieldArray({
        name: 'opplysningsplikt',
        control: form.control,
    });

    const revurderingsperiode = {
        fraOgMed: new Date(props.revurdering.periode.fraOgMed),
        tilOgMed: new Date(props.revurdering.periode.tilOgMed),
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <form
                        className={sharedStyles.revurderingContainer}
                        onSubmit={form.handleSubmit((values) => handleSubmit(values, 'neste'))}
                    >
                        {fields.map((periode, index) => (
                            <Panel border key={periode.id} className={styles.panel}>
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
                                {/* <Controller
                                    control={form.control}
                                    name={`opplysningsplikt.${index}.status`}
                                    render={({ field, fieldState }) => (
                                        <RadioGroup
                                            legend={formatMessage('radiobutton.tittel')}
                                            error={fieldState.error?.message}
                                            className={styles.radioGroup}
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                            name={field.name}
                                        >
                                            <Radio
                                                value={Utenlandsoppholdstatus.SkalVæreMerEnn90DagerIUtlandet}
                                                ref={field.ref}
                                            >
                                                {formatMessage('radiobutton.utenlands')}
                                            </Radio>
                                            <Radio value={Utenlandsoppholdstatus.SkalHoldeSegINorge}>
                                                {formatMessage('radiobutton.innenlands')}
                                            </Radio>
                                        </RadioGroup>
                                    )}
                                />
                                <Controller
                                    control={form.control}
                                    name={`opplysningsplikt.${index}.begrunnelse`}
                                    render={({ field: { value, ...field }, fieldState }) => (
                                        <Textarea
                                            label={formatMessage('input.begrunnelse.tittel')}
                                            error={fieldState.error?.message}
                                            value={value ?? ''}
                                            {...field}
                                            description={formatMessage('revurdering.begrunnelse.description')}
                                        />
                                    )}
                                /> */}
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
                        {props.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold && (
                            <Utenlandsoppsummering
                                utenlandsopphold={props.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold}
                            />
                        )}
                    </div>
                ),
            }}
        </ToKolonner>
    );
};

export default Opplysningsplikt;
