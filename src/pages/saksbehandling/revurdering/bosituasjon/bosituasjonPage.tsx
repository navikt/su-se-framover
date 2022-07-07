import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Delete } from '@navikt/ds-icons';
import { Button, Panel } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';
import { Control, Controller, FieldErrors, useFieldArray, useForm, UseFormWatch } from 'react-hook-form';

import { FnrInput } from '~src/components/FnrInput/FnrInput';
import { BooleanRadioGroup, PeriodeForm } from '~src/components/formElements/FormElements';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { lagreBosituasjonsgrunnlag } from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { MessageFormatter, useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { NullablePeriode, Periode } from '~src/types/Periode';
import { RevurderingStegProps } from '~src/types/Revurdering';
import * as DateUtils from '~src/utils/date/dateUtils';

import sharedMessages from '../revurdering-nb';
import sharedStyles from '../revurdering.module.less';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';
import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import messages from './bosituasjonForm-nb';
import styles from './bosituasjonForm.module.less';
import {
    BosituasjonFormData,
    BosituasjonFormItemData,
    bosituasjonFormSchema,
    bosituasjonTilFormItemData,
    nyBosituasjon,
} from './bosituasjonPageUtils';
import GjeldendeBosituasjon from './GjeldendeBosituasjon';

const BosituasjonPage = (props: RevurderingStegProps) => {
    const [status, lagre] = useAsyncActionCreator(lagreBosituasjonsgrunnlag);
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });

    const form = useForm<BosituasjonFormData>({
        defaultValues: {
            bosituasjoner:
                props.revurdering.grunnlagsdataOgVilkårsvurderinger.bosituasjon.map((b) =>
                    bosituasjonTilFormItemData(b)
                ) ?? [],
        },
        resolver: yupResolver(bosituasjonFormSchema),
    });

    const lagreBosituasjon = (data: BosituasjonFormData, onSuccess: () => void) =>
        lagre(
            {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                bosituasjoner: data.bosituasjoner.map((b) => ({
                    periode: {
                        fraOgMed: DateUtils.toIsoDateOnlyString(b.periode.fraOgMed!),
                        tilOgMed: DateUtils.toIsoDateOnlyString(b.periode.tilOgMed!),
                    },
                    epsFnr: b.harEPS ? b.epsFnr : null,
                    delerBolig: b.harEPS ? null : b.delerBolig,
                    erEPSUførFlyktning: b.harEPS && b.epsAlder && b.epsAlder < 67 ? b.erEPSUførFlyktning : null,
                })),
            },
            (res) => {
                if (res.feilmeldinger.length === 0) {
                    onSuccess();
                }
            }
        );

    const items = useFieldArray({
        control: form.control,
        name: 'bosituasjoner',
    });

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <FormWrapper
                        form={form}
                        save={lagreBosituasjon}
                        savingState={status}
                        avsluttUrl={props.avsluttUrl}
                        forrigeUrl={props.forrigeUrl}
                        nesteUrl={props.nesteUrl}
                        onTilbakeClickOverride={props.onTilbakeClickOverride}
                        className={classNames(sharedStyles.revurderingContainer, styles.container)}
                    >
                        <>
                            <ul className={styles.periodeliste}>
                                {items.fields.map((item, idx) => (
                                    <li key={item.id}>
                                        <BosituasjonFormItem
                                            controller={form.control}
                                            watch={form.watch}
                                            update={(idx: number, data: BosituasjonFormItemData) => {
                                                form.setValue(`bosituasjoner.${idx}`, data);
                                            }}
                                            data={item}
                                            index={idx}
                                            onDelete={() => items.remove(idx)}
                                            bosituasjonArrayLengde={items.fields.length}
                                            revurderingsperiode={{
                                                fraOgMed: props.revurdering.periode.fraOgMed,
                                                tilOgMed: props.revurdering.periode.tilOgMed,
                                            }}
                                            errors={form.formState.errors}
                                        />
                                    </li>
                                ))}
                            </ul>
                            <div className={styles.nyPeriodeKnappContainer}>
                                <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={() => items.append(nyBosituasjon(), { shouldFocus: true })}
                                >
                                    {formatMessage('form.ny.bosituasjon')}
                                </Button>
                            </div>

                            {RemoteData.isSuccess(status) && (
                                <UtfallSomIkkeStøttes feilmeldinger={status.value.feilmeldinger} />
                            )}
                        </>
                    </FormWrapper>
                ),
                right: (
                    <GjeldendeBosituasjon
                        bosituasjon={props.grunnlagsdataOgVilkårsvurderinger.bosituasjon}
                        formatMessage={formatMessage}
                    />
                ),
            }}
        </ToKolonner>
    );
};

export const BosituasjonFormItem = (props: {
    controller: Control<BosituasjonFormData>;
    watch: UseFormWatch<BosituasjonFormData>;
    update: (idx: number, data: BosituasjonFormItemData) => void;
    data: BosituasjonFormItemData;
    index: number;
    bosituasjonArrayLengde: number;
    revurderingsperiode: Periode<string>;
    onDelete: () => void;
    errors: FieldErrors<BosituasjonFormData>;
}) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });
    const watch = props.watch().bosituasjoner[props.index];

    const revurderingsperiode = {
        fraOgMed: new Date(props.revurderingsperiode.fraOgMed),
        tilOgMed: new Date(props.revurderingsperiode.tilOgMed),
    };

    return (
        <Panel className={styles.formItemContainer} border>
            <div className={styles.periodeContainer}>
                <PeriodeForm
                    name={`bosituasjoner.${props.index}.periode`}
                    value={watch.periode}
                    onChange={(periode: NullablePeriode) => props.update(props.index, { ...watch, periode: periode })}
                    error={props.errors?.bosituasjoner?.[props.index]?.periode}
                    minDate={{
                        fraOgMed: revurderingsperiode.fraOgMed,
                        tilOgMed: revurderingsperiode.tilOgMed,
                    }}
                    maxDate={{
                        fraOgMed: revurderingsperiode.fraOgMed,
                        tilOgMed: revurderingsperiode.tilOgMed,
                    }}
                />
                {props.onDelete && props.bosituasjonArrayLengde > 1 && (
                    <Button
                        variant="secondary"
                        className={styles.slettknapp}
                        onClick={props.onDelete}
                        size="small"
                        aria-label={formatMessage('form.fjern.bosituasjon')}
                    >
                        <Delete />
                    </Button>
                )}
            </div>

            <div className={styles.formItemInputContainer}>
                <Controller
                    control={props.controller}
                    name={`bosituasjoner.${props.index}.harEPS`}
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('form.harSøkerEPS')}
                            error={fieldState.error?.message}
                            {...field}
                        />
                    )}
                />
                {watch.harEPS && (
                    <BosituasjonFormItemEps
                        formControl={props.controller}
                        index={props.index}
                        setEpsAlder={(alder: Nullable<number>) => {
                            props.update(props.index, {
                                ...watch,
                                epsAlder: alder,
                            });
                        }}
                        epsAlder={watch.epsAlder}
                        formatMessage={formatMessage}
                    />
                )}
                {watch.harEPS === false && (
                    <Controller
                        control={props.controller}
                        name={`bosituasjoner.${props.index}.delerBolig`}
                        render={({ field, fieldState }) => (
                            <BooleanRadioGroup
                                legend={formatMessage('form.delerBolig')}
                                error={fieldState.error?.message}
                                {...field}
                            />
                        )}
                    />
                )}
            </div>
        </Panel>
    );
};

const BosituasjonFormItemEps = (props: {
    formControl: Control<BosituasjonFormData>;
    index: number;
    setEpsAlder: (alder: Nullable<number>) => void;
    epsAlder: Nullable<number>;
    formatMessage: MessageFormatter<typeof messages>;
}) => (
    <div className={styles.epsFormContainer}>
        <Controller
            control={props.formControl}
            name={`bosituasjoner.${props.index}.epsFnr`}
            render={({ field, fieldState }) => (
                <FnrInput
                    label={props.formatMessage('form.epsFnr')}
                    inputId="epsFnr"
                    name={`bosituasjoner.${props.index}.epsFnr`}
                    onFnrChange={field.onChange}
                    fnr={field.value ?? ''}
                    feil={fieldState.error?.message}
                    getHentetPerson={(person) => {
                        props.setEpsAlder(person?.alder ?? null);
                    }}
                />
            )}
        />
        {props.epsAlder && props.epsAlder < 67 && (
            <Controller
                control={props.formControl}
                name={`bosituasjoner.${props.index}.erEPSUførFlyktning`}
                render={({ field, fieldState }) => (
                    <BooleanRadioGroup
                        legend={props.formatMessage('form.erEPSUførFlyktning')}
                        error={fieldState.error?.message}
                        {...field}
                    />
                )}
            />
        )}
    </div>
);

export default BosituasjonPage;
