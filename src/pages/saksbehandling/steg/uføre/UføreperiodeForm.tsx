import { Delete } from '@navikt/ds-icons';
import { Button, Panel, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import * as React from 'react';
import { Control, Controller, FieldErrors, UseFormSetValue, useWatch } from 'react-hook-form';
import { v4 as uuid } from 'uuid';

import { PeriodeForm } from '~src/components/formElements/FormElements';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { FormData, UføreperiodeFormData } from '~src/pages/saksbehandling/steg/uføre/types';
import { UføreResultat, VurderingsperiodeUføre } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import * as DateUtils from '~src/utils/date/dateUtils';

import messages from './uførhet-nb';
import * as styles from './uførhet.module.less';

export const vurderingsperiodeTilFormData = (u: VurderingsperiodeUføre): UføreperiodeFormData => ({
    id: uuid(),
    fraOgMed: DateUtils.parseIsoDateOnly(u.periode.fraOgMed),
    tilOgMed: DateUtils.parseIsoDateOnly(u.periode.tilOgMed),
    uføregrad: u.grunnlag?.uføregrad.toString() ?? '',
    forventetInntekt: u.grunnlag?.forventetInntekt.toString() ?? '',
    oppfylt: u.resultat,
});

interface Props {
    item: UføreperiodeFormData;
    index: number;
    control: Control<FormData>;
    resetUføregradOgForventetInntekt: () => void;
    minDate: Nullable<Date>;
    maxDate: Nullable<Date>;
    onRemoveClick?: () => void;
    kanVelgeUføresakTilBehandling: boolean;
    setValue: UseFormSetValue<FormData>;
    errors: FieldErrors<FormData>;
}

export const UføreperiodeForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });

    const uføreName = `grunnlag.${props.index}` as const;
    const value = useWatch({ control: props.control, name: uføreName });

    return (
        <Panel className={styles.periodeContainer} border>
            <div className={styles.horizontal}>
                <Controller
                    control={props.control}
                    name={`${uføreName}.oppfylt`}
                    defaultValue={props.item.oppfylt}
                    render={({ field, fieldState }) => (
                        <RadioGroup
                            legend={formatMessage('input.erVilkårOppfylt.label')}
                            error={fieldState.error?.message}
                            {...field}
                            value={field.value ?? ''}
                            onChange={(val) => {
                                field.onChange(val);
                                props.resetUføregradOgForventetInntekt();
                            }}
                        >
                            <Radio id={field.name} value={UføreResultat.VilkårOppfylt} ref={field.ref}>
                                {formatMessage('radio.label.ja')}
                            </Radio>
                            <Radio value={UføreResultat.VilkårIkkeOppfylt}>{formatMessage('radio.label.nei')}</Radio>
                            {props.kanVelgeUføresakTilBehandling && (
                                <Radio value={UføreResultat.HarUføresakTilBehandling}>
                                    {formatMessage('radio.label.uføresakTilBehandling')}
                                </Radio>
                            )}
                        </RadioGroup>
                    )}
                />
                {props.onRemoveClick && (
                    <Button
                        variant="secondary"
                        className={styles.slettknapp}
                        onClick={props.onRemoveClick}
                        size="small"
                        aria-label={formatMessage('input.fjernPeriode.label')}
                    >
                        <Delete />
                    </Button>
                )}
            </div>

            {value.oppfylt === UføreResultat.VilkårOppfylt && (
                <div className={styles.horizontal}>
                    <Controller
                        control={props.control}
                        name={`${uføreName}.uføregrad`}
                        defaultValue={props.item.uføregrad ?? ''}
                        render={({ field, fieldState }) => (
                            <TextField
                                id={field.name}
                                label={formatMessage('input.uføregrad.label')}
                                error={fieldState.error?.message}
                                {...field}
                            />
                        )}
                    />
                    <Controller
                        control={props.control}
                        name={`${uføreName}.forventetInntekt`}
                        defaultValue={props.item.forventetInntekt ?? ''}
                        render={({ field, fieldState }) => (
                            <TextField
                                id={field.name}
                                label={formatMessage('input.forventetInntekt.label')}
                                error={fieldState.error?.message}
                                {...field}
                            />
                        )}
                    />
                </div>
            )}

            <PeriodeForm
                fraOgMed={{
                    id: `${uføreName}.periode.fraOgMed`,
                    value: value.fraOgMed,
                    minDate: props.minDate,
                    maxDate: props.maxDate,
                    setFraOgMed: (date: Nullable<Date>) => {
                        props.setValue(`${uføreName}.fraOgMed`, date);
                    },
                    error: props.errors?.grunnlag?.[props.index]?.fraOgMed,
                }}
                tilOgMed={{
                    id: `${uføreName}.periode.tilOgMed`,
                    value: value.tilOgMed,
                    minDate: props.minDate,
                    maxDate: props.maxDate,
                    setTilOgMed: (date: Nullable<Date>) => {
                        props.setValue(`${uføreName}.tilOgMed`, date);
                    },
                    error: props.errors?.grunnlag?.[props.index]?.tilOgMed,
                }}
            />
        </Panel>
    );
};
