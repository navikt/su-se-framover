import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Delete } from '@navikt/ds-icons';
import { Button, Panel, Select } from '@navikt/ds-react';
import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { PeriodeForm } from '~src/components/formElements/FormElements';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { lagreOpplysningsplikt } from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { RevurderingBunnknapper } from '~src/pages/saksbehandling/revurdering/bunnknapper/RevurderingBunnknapper';
import * as sharedStyles from '~src/pages/saksbehandling/revurdering/revurdering.module.less';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import { OpplysningspliktBeksrivelse } from '~src/types/grunnlagsdataOgVilkårsvurderinger/opplysningsplikt/Opplysningsplikt';
import { RevurderingStegProps } from '~src/types/Revurdering';
import { parseIsoDateOnly, sluttenAvMåneden, toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import GjeldendeOpplysningsplikt from './GjeldendeOpplysningsplikt';
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

    const handleSubmit = async (form: OpplysningspliktVilkårForm, navigateUrl: string) => {
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
            (res) => {
                if (res.feilmeldinger.length === 0) {
                    navigate(navigateUrl);
                }
            }
        );
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <form
                        className={sharedStyles.revurderingContainer}
                        onSubmit={form.handleSubmit((values) => handleSubmit(values, props.nesteUrl))}
                    >
                        {fields.map((opplysningsplikt, index) => (
                            <Panel border key={opplysningsplikt.id} className={styles.panel}>
                                <div className={styles.vurderingOgSøppelbøtteContainer}>
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
                                </div>

                                <PeriodeForm
                                    fraOgMed={{
                                        id: `opplysningsplikt.${index}.periode.fraOgMed`,
                                        value: opplysningsplikt.periode.fraOgMed,
                                        minDate: revurderingsperiode.fraOgMed,
                                        maxDate: revurderingsperiode.tilOgMed,
                                        setFraOgMed: (date: Nullable<Date>) => {
                                            form.setValue(`opplysningsplikt.${index}.periode.fraOgMed`, date);
                                        },
                                        error: form.formState.errors.opplysningsplikt?.[index].periode?.fraOgMed,
                                        size: 'S',
                                    }}
                                    tilOgMed={{
                                        id: `opplysningsplikt.${index}.periode.tilOgMed`,
                                        value: opplysningsplikt.periode.tilOgMed,
                                        minDate: revurderingsperiode.fraOgMed,
                                        maxDate: revurderingsperiode.tilOgMed,
                                        setTilOgMed: (date: Nullable<Date>) => {
                                            form.setValue(`opplysningsplikt.${index}.periode.tilOgMed`, date);
                                        },
                                        error: form.formState.errors.opplysningsplikt?.[index].periode?.tilOgMed,
                                        size: 'S',
                                    }}
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
                        {RemoteData.isSuccess(status) && (
                            <UtfallSomIkkeStøttes feilmeldinger={status.value.feilmeldinger} />
                        )}
                        <RevurderingBunnknapper
                            tilbake={props.forrige}
                            loading={RemoteData.isPending(status)}
                            onLagreOgFortsettSenereClick={form.handleSubmit((values) =>
                                handleSubmit(values, props.avsluttUrl)
                            )}
                        />
                    </form>
                ),
                right: (
                    <GjeldendeOpplysningsplikt
                        opplysningsplikter={props.grunnlagsdataOgVilkårsvurderinger.opplysningsplikt?.vurderinger}
                    />
                ),
            }}
        </ToKolonner>
    );
};

export default Opplysningsplikt;
