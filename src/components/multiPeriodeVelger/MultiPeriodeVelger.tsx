import { Delete } from '@navikt/ds-icons';
import { Button, Panel } from '@navikt/ds-react';
import React from 'react';
import {
    ArrayPath,
    Control,
    FieldArray,
    FieldErrors,
    FieldValues,
    UnpackNestedValue,
    useFieldArray,
    UseFormWatch,
} from 'react-hook-form';

import { PeriodeForm } from '~src/components/formElements/FormElements';
import { useI18n } from '~src/lib/i18n';
import { NullablePeriode } from '~src/types/Periode';

import messages from './multiPeriodeVelger-nb';
import styles from './multiPeriodeVelger.module.less';

interface Props<T, U> {
    name: ArrayPath<T>;
    controller: Control<T>;
    watch: UseFormWatch<T>;
    update: (idx: number, data: U) => void;
    appendNyPeriode: () => U;
    periodeStuffs: {
        minFraOgMed: Date;
        maxTilOgMed: Date;
        error?: FieldErrors<NullablePeriode>;
        size?: 'S' | 'L';
    };
    children: React.ReactNode;
}

const MultiPeriodeVelger = <
    T extends FieldValues,
    U extends
        | Partial<UnpackNestedValue<FieldArray<T, ArrayPath<T>>>>
        | Array<Partial<UnpackNestedValue<FieldArray<T, ArrayPath<T>>>>>
>(
    props: Props<T, U>
) => {
    const { formatMessage } = useI18n({ messages });

    const { fields, append, remove } = useFieldArray<T>({
        name: props.name,
        control: props.controller,
    });
    const watch = props.watch();

    return (
        <ul>
            {fields.map((item, index) => {
                return (
                    <li key={item.id}>
                        <Panel className={styles.periodePanel}>
                            <div className={styles.periodeOgSøppelbøtteContainer}>
                                <PeriodeForm
                                    name={`${props.name}.${index}.periode`}
                                    value={watch[props.name][index].periode}
                                    onChange={(periode: NullablePeriode) =>
                                        props.update(index, { ...watch[props.name][index], periode: periode })
                                    }
                                    minDate={{
                                        fraOgMed: props.periodeStuffs.minFraOgMed,
                                        tilOgMed: props.periodeStuffs.maxTilOgMed,
                                    }}
                                    maxDate={{
                                        fraOgMed: props.periodeStuffs.minFraOgMed,
                                        tilOgMed: props.periodeStuffs.maxTilOgMed,
                                    }}
                                    error={props.periodeStuffs.error}
                                    size={props.periodeStuffs.size}
                                />
                                <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={() => remove(index)}
                                    size="small"
                                    aria-label={formatMessage('knapp.fjernPeriode')}
                                >
                                    <Delete />
                                </Button>
                            </div>
                            {props.children}
                        </Panel>
                    </li>
                );
            })}
            <div className={styles.nyPeriodeKnappContainer}>
                <Button variant="secondary" type="button" size="small" onClick={() => append(props.appendNyPeriode())}>
                    {formatMessage('knapp.nyPeriode')}
                </Button>
            </div>
        </ul>
    );
};

export default MultiPeriodeVelger;
