import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Delete } from '@navikt/ds-icons';
import { Button, Heading, Panel, Radio, RadioGroup } from '@navikt/ds-react';
import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { PeriodeForm } from '~src/components/formElements/FormElements';
import { Utenlandsoppsummering } from '~src/components/revurdering/oppsummering/utenlandsopphold/Utenlandsoppsummering';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { lagreUtenlandsopphold } from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { Navigasjonsknapper } from '~src/pages/saksbehandling/bunnknapper/Navigasjonsknapper';
import revurderingmessages, { stegmessages } from '~src/pages/saksbehandling/revurdering/revurdering-nb';
import * as sharedStyles from '~src/pages/saksbehandling/revurdering/revurdering.module.less';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import { Utenlandsoppholdstatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { NullablePeriode } from '~src/types/Periode';
import { RevurderingStegProps } from '~src/types/Revurdering';
import { parseIsoDateOnly, sluttenAvMåneden, toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import messages from './utenlandsopphold-nb';
import * as styles from './utenlandsopphold.module.less';

interface UtenlandsoppholdForm {
    utenlandsopphold: UtenlandsoppholdFormData[];
}

interface UtenlandsoppholdFormData {
    status?: Utenlandsoppholdstatus;
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
    const navigate = useNavigate();
    const vurderinger = props.revurdering.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold?.vurderinger ?? [
        { status: undefined, begrunnelse: null, periode: props.revurdering.periode },
    ];
    const form = useForm<UtenlandsoppholdForm>({
        resolver: yupResolver(schemaValidation),
        defaultValues: {
            utenlandsopphold: vurderinger.map((vurdering) => ({
                status: vurdering.status,
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
                    status: vurdering.status!,
                    periode: {
                        fraOgMed: toIsoDateOnlyString(vurdering.periode.fraOgMed!),
                        tilOgMed: toIsoDateOnlyString(sluttenAvMåneden(vurdering.periode.tilOgMed!)),
                    },
                })),
            },
            () => navigate(gåtil === 'neste' ? props.nesteUrl : props.avsluttUrl)
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
                        {fields.map((utenlandsopphold, index) => (
                            <Panel border key={utenlandsopphold.id} className={styles.panel}>
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

                                    <PeriodeForm
                                        name={`utenlandsopphold.${index}.periode`}
                                        value={utenlandsopphold.periode}
                                        onChange={(periode: NullablePeriode) =>
                                            form.setValue(`utenlandsopphold.${index}.periode`, periode)
                                        }
                                        error={form.formState.errors.utenlandsopphold?.[index].periode}
                                        minDate={{
                                            fraOgMed: revurderingsperiode.fraOgMed,
                                            tilOgMed: revurderingsperiode.tilOgMed,
                                        }}
                                        maxDate={{
                                            fraOgMed: revurderingsperiode.fraOgMed,
                                            tilOgMed: revurderingsperiode.tilOgMed,
                                        }}
                                        size="S"
                                    />
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
                            </Panel>
                        ))}
                        <Button
                            className={styles.nyPeriodeKnapp}
                            variant="secondary"
                            onClick={() =>
                                append({
                                    status: undefined,
                                    periode: { tilOgMed: null, fraOgMed: null },
                                })
                            }
                            type={'button'}
                        >
                            Ny periode for utenlandsopphold
                        </Button>
                        {RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} />}
                        <Navigasjonsknapper
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

export default Utenlandsopphold;
