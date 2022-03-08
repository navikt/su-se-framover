import { Delete } from '@navikt/ds-icons';
import { Button, Panel, Radio, RadioGroup, Textarea, TextField } from '@navikt/ds-react';
import classNames from 'classnames';
import { endOfMonth, startOfMonth } from 'date-fns';
import * as React from 'react';
import { Control, Controller, useWatch } from 'react-hook-form';
import { v4 as uuid } from 'uuid';

import DatePicker from '~components/datePicker/DatePicker';
import { useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';
import { getDateErrorMessage } from '~lib/validering';
import messages from '~pages/saksbehandling/revurdering/uførhet/uførhet-nb';
import styles from '~pages/saksbehandling/revurdering/uførhet/uførhet.module.less';
import { FormData, UføreperiodeFormData } from '~pages/saksbehandling/steg/uføre/types';
import { UføreResultat, VurderingsperiodeUføre } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import * as DateUtils from '~utils/date/dateUtils';

export const vurderingsperiodeTilFormData = (u: VurderingsperiodeUføre): UføreperiodeFormData => ({
    id: uuid(),
    fraOgMed: DateUtils.parseIsoDateOnly(u.periode.fraOgMed),
    tilOgMed: DateUtils.parseIsoDateOnly(u.periode.tilOgMed),
    uføregrad: u.grunnlag?.uføregrad.toString() ?? '',
    forventetInntekt: u.grunnlag?.forventetInntekt.toString() ?? '',
    begrunnelse: u.begrunnelse,
    oppfylt: u.resultat,
});

interface Props {
    item: UføreperiodeFormData;
    index: number;
    control: Control<FormData>;
    resetUføregradEllerForventetInntekt: (index: number, field: 'uføregrad' | 'forventetInntekt') => void;
    minDate: Nullable<Date>;
    maxDate: Nullable<Date>;
    onRemoveClick?: () => void;
    kanVelgeUføresakTilBehandling: boolean;
}

export const UføreperiodeForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    const value = useWatch({ control: props.control, name: `grunnlag.${props.index}` as `grunnlag.0` });

    return (
        <Panel className={styles.periodeContainer} border>
            <div className={styles.horizontal}>
                <div className={classNames(styles.horizontal, styles.periodeInputContainer)}>
                    <Controller
                        name={`grunnlag.${props.index}.fraOgMed`}
                        control={props.control}
                        defaultValue={props.item.fraOgMed}
                        render={({ field, fieldState }) => (
                            <DatePicker
                                id={field.name}
                                label={formatMessage('input.fom.label')}
                                feil={getDateErrorMessage(fieldState.error)}
                                {...field}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                isClearable
                                autoComplete="off"
                                minDate={props.minDate}
                                maxDate={props.maxDate}
                                onChange={(date: Nullable<Date>) => field.onChange(date ? startOfMonth(date) : null)}
                            />
                        )}
                    />
                    <Controller
                        name={`grunnlag.${props.index}.tilOgMed`}
                        control={props.control}
                        defaultValue={props.item.tilOgMed}
                        render={({ field, fieldState }) => (
                            <DatePicker
                                label={formatMessage('input.tom.label')}
                                id={field.name}
                                feil={getDateErrorMessage(fieldState.error)}
                                {...field}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                isClearable
                                autoComplete="off"
                                minDate={props.minDate}
                                maxDate={props.maxDate}
                                onChange={(date: Date) => field.onChange(date ? endOfMonth(date) : date)}
                            />
                        )}
                    />
                </div>
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
            <Controller
                control={props.control}
                name={`grunnlag.${props.index}.oppfylt`}
                defaultValue={props.item.oppfylt}
                render={({ field, fieldState }) => (
                    <RadioGroup
                        legend={formatMessage('input.erVilkårOppfylt.label')}
                        error={fieldState.error?.message}
                        {...field}
                        value={field.value ?? ''}
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
            {value.oppfylt === UføreResultat.VilkårOppfylt && (
                <div className={styles.horizontal}>
                    <Controller
                        control={props.control}
                        name={`grunnlag.${props.index}.uføregrad`}
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
                        name={`grunnlag.${props.index}.forventetInntekt`}
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
            <Controller
                control={props.control}
                name={`grunnlag.${props.index}.begrunnelse`}
                render={({ field, fieldState }) => (
                    <Textarea
                        label={formatMessage('gjeldende.begrunnelse')}
                        error={fieldState.error?.message}
                        {...field}
                        value={field.value ?? ''}
                        description={formatMessage('input.begrunnelse.description')}
                    />
                )}
            />
        </Panel>
    );
};
