import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Delete } from '@navikt/ds-icons';
import { Button, Heading, Panel, Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import DatePicker from '~components/datePicker/DatePicker';
import { Utenlandsoppsummering } from '~components/revurdering/oppsummering/utenlandsopphold/Utenlandsoppsummering';
import ToKolonner from '~components/toKolonner/ToKolonner';
import { lagreUtenlandsopphold } from '~features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';
import yup, { getDateErrorMessage } from '~lib/validering';
import { RevurderingBunnknapper } from '~pages/saksbehandling/revurdering/bunnknapper/RevurderingBunnknapper';
import revurderingmessages, { stegmessages } from '~pages/saksbehandling/revurdering/revurdering-nb';
import sharedStyles from '~pages/saksbehandling/revurdering/revurdering.module.less';
import RevurderingsperiodeHeader from '~pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import { Utenlandsoppholdstatus } from '~types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { RevurderingStegProps } from '~types/Revurdering';
import { parseIsoDateOnly, sluttenAvMåneden, toIsoDateOnlyString } from '~utils/date/dateUtils';

import messages from './utenlandsopphold-nb';
import styles from './utenlandsopphold.module.less';

interface UtenlandsoppholdForm {
    utenlandsopphold: UtenlandsoppholdFormData[];
}

interface UtenlandsoppholdFormData {
    status?: Utenlandsoppholdstatus;
    begrunnelse: Nullable<string>;
    periode: {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    };
}

const schemaValidation = yup.object<UtenlandsoppholdForm>({
    utenlandsopphold: yup
        .array<UtenlandsoppholdFormData>(
            yup
                .object<UtenlandsoppholdFormData>({
                    status: yup.mixed<Utenlandsoppholdstatus>().oneOf(Object.values(Utenlandsoppholdstatus)).required(),
                    begrunnelse: yup.string().nullable().defined(),
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

const Utenlandsopphold = (props: RevurderingStegProps) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...stegmessages, ...revurderingmessages } });
    const history = useHistory();
    const vurderinger = props.revurdering.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold?.vurderinger ?? [
        { status: undefined, begrunnelse: null, periode: props.revurdering.periode },
    ];
    const form = useForm<UtenlandsoppholdForm>({
        resolver: yupResolver(schemaValidation),
        defaultValues: {
            utenlandsopphold: vurderinger.map((vurdering) => ({
                status: vurdering.status,
                begrunnelse: vurdering.begrunnelse ?? null,
                periode: {
                    fraOgMed: parseIsoDateOnly(vurdering.periode.fraOgMed),
                    tilOgMed: parseIsoDateOnly(vurdering.periode.tilOgMed),
                },
            })),
        },
    });
    const [status, lagre] = useAsyncActionCreator(lagreUtenlandsopphold);

    const handleSubmit = async (form: UtenlandsoppholdForm, gåtil: 'neste' | 'avbryt') => {
        lagre(
            {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                utenlandsopphold: form.utenlandsopphold.map((vurdering) => ({
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    status: vurdering.status!,
                    begrunnelse: vurdering.begrunnelse,
                    periode: {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        fraOgMed: toIsoDateOnlyString(vurdering.periode.fraOgMed!),
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        tilOgMed: toIsoDateOnlyString(sluttenAvMåneden(vurdering.periode.tilOgMed!)),
                    },
                })),
            },
            () => history.push(gåtil === 'neste' ? props.nesteUrl : props.avsluttUrl)
        );
    };

    const { fields, append, remove } = useFieldArray({
        name: 'utenlandsopphold',
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
                                            name={`utenlandsopphold.${index}.periode.fraOgMed`}
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
                                            name={`utenlandsopphold.${index}.periode.tilOgMed`}
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
                                    name={`utenlandsopphold.${index}.status`}
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
                                    name={`utenlandsopphold.${index}.begrunnelse`}
                                    render={({ field: { value, ...field }, fieldState }) => (
                                        <Textarea
                                            label={formatMessage('input.begrunnelse.tittel')}
                                            error={fieldState.error?.message}
                                            value={value ?? ''}
                                            {...field}
                                        />
                                    )}
                                />
                            </Panel>
                        ))}
                        <Button
                            className={styles.nyPeriodeKnapp}
                            variant="secondary"
                            onClick={() =>
                                append({
                                    status: undefined,
                                    periode: { tilOgMed: null, fraOgMed: null },
                                    begrunnelse: null,
                                })
                            }
                            type={'button'}
                        >
                            Ny periode for utenlandsopphold
                        </Button>
                        {RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} />}
                        <RevurderingBunnknapper
                            tilbakeUrl={props.forrigeUrl}
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

export default Utenlandsopphold;
