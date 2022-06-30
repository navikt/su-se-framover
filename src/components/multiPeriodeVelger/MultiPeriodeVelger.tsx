import { Delete } from '@navikt/ds-icons';
import { Button, Panel } from '@navikt/ds-react';
import React from 'react';
import {
    ArrayPath,
    Control,
    Controller,
    FieldArray,
    FieldErrors,
    FieldValues,
    Path,
    useFieldArray,
    useWatch,
} from 'react-hook-form';

import { PeriodeForm } from '~src/components/formElements/FormElements';
import { useI18n } from '~src/lib/i18n';
import { NullablePeriode } from '~src/types/Periode';

import messages from './multiPeriodeVelger-nb';
import styles from './multiPeriodeVelger.module.less';

interface Props<T, U> {
    className?: string;
    name: string;
    controller: Control<T>;
    appendNyPeriode: () => U;
    periodeStuffs: {
        minFraOgMed: Date;
        maxTilOgMed: Date;
        size?: 'S' | 'L';
    };
    barn: (idx: number) => React.ReactNode;
    childrenOverDato?: boolean;
}

const MultiPeriodeVelger = <T extends FieldValues, U extends FieldArray<T>>(props: Props<T, U>) => {
    const { formatMessage } = useI18n({ messages });

    const { fields, append, remove, update } = useFieldArray({
        name: props.name as ArrayPath<T>,
        control: props.controller,
    });

    const watch = useWatch({ name: props.name as Path<T>, control: props.controller });

    return (
        <div className={props.className}>
            <ul>
                {fields.map((el, idx) => {
                    const watchedItem = watch[idx];
                    const periodeInput = (
                        <Controller
                            control={props.controller}
                            name={`${props.name}.${idx}.periode` as Path<T>}
                            render={({ field, fieldState }) => (
                                <PeriodeForm
                                    name={`${props.name}.${idx}.periode`}
                                    value={field.value}
                                    onChange={(periode: NullablePeriode) => {
                                        update(idx, { ...watchedItem, periode: periode });
                                    }}
                                    minDate={{
                                        fraOgMed: props.periodeStuffs.minFraOgMed,
                                        tilOgMed: props.periodeStuffs.maxTilOgMed,
                                    }}
                                    maxDate={{
                                        fraOgMed: props.periodeStuffs.minFraOgMed,
                                        tilOgMed: props.periodeStuffs.maxTilOgMed,
                                    }}
                                    error={fieldState.error as FieldErrors<NullablePeriode>}
                                    size={props.periodeStuffs.size}
                                />
                            )}
                        />
                    );

                    return (
                        <li key={el.id}>
                            <Panel className={styles.periodePanel}>
                                <div className={styles.periodeOgSøppelbøtteContainer}>
                                    {props.childrenOverDato ? props.barn(idx) : periodeInput}

                                    <Button
                                        variant="secondary"
                                        type="button"
                                        onClick={() => remove(idx)}
                                        size="small"
                                        aria-label={formatMessage('knapp.fjernPeriode')}
                                    >
                                        <Delete />
                                    </Button>
                                </div>
                                {!props.childrenOverDato ? props.barn(idx) : periodeInput}
                            </Panel>
                        </li>
                    );
                })}
            </ul>
            <div className={styles.nyPeriodeKnappContainer}>
                <Button variant="secondary" type="button" size="small" onClick={() => append(props.appendNyPeriode())}>
                    {formatMessage('knapp.nyPeriode')}
                </Button>
            </div>
        </div>
    );
};

export default MultiPeriodeVelger;
