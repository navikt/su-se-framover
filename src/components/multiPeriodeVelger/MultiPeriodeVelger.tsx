import { Delete } from '@navikt/ds-icons';
import { Button, Panel } from '@navikt/ds-react';
import React from 'react';
import {
    Control,
    Controller,
    FieldArray,
    FieldArrayWithId,
    FieldErrors,
    FieldValues,
    Path,
    UseFieldArrayAppend,
    UseFieldArrayRemove,
    useWatch,
} from 'react-hook-form';

import { PeriodeForm } from '~src/components/formElements/FormElements';
import { useI18n } from '~src/lib/i18n';
import { NullablePeriode } from '~src/types/Periode';

import messages from './multiPeriodeVelger-nb';
import styles from './multiPeriodeVelger.module.less';

interface Props<T, U> {
    name: string;
    controller: Control<T>;
    fields: Array<FieldArrayWithId<T>>;
    append: UseFieldArrayAppend<T>;
    remove: UseFieldArrayRemove;
    index: number;
    update: (idx: number, data: U) => void;
    appendNyPeriode: () => U;
    periodeStuffs: {
        minFraOgMed: Date;
        maxTilOgMed: Date;
        error?: FieldErrors<NullablePeriode>;
        size?: 'S' | 'L';
    };
    children: React.ReactNode;
    childrenOverDato?: boolean;
}

const MultiPeriodeVelger = <T extends FieldValues, U extends FieldArray<T>>(props: Props<T, U>) => {
    const { formatMessage } = useI18n({ messages });

    const watch = useWatch({ name: props.name as Path<T>, control: props.controller });

    const periodeInput = (
        <Controller
            control={props.controller}
            name={`${name}.periode` as Path<T>}
            render={({ field, fieldState }) => (
                <PeriodeForm
                    {...field}
                    onChange={(periode: NullablePeriode) =>
                        props.update(props.index, { ...watch[props.index], periode: periode })
                    }
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
        <div>
            <Panel className={styles.periodePanel}>
                <div className={styles.periodeOgSøppelbøtteContainer}>
                    {props.childrenOverDato ? props.children : periodeInput}

                    <Button
                        variant="secondary"
                        type="button"
                        onClick={() => props.remove(props.index)}
                        size="small"
                        aria-label={formatMessage('knapp.fjernPeriode')}
                    >
                        <Delete />
                    </Button>
                </div>
                {!props.childrenOverDato ? props.children : periodeInput}
            </Panel>

            <div className={styles.nyPeriodeKnappContainer}>
                <Button
                    variant="secondary"
                    type="button"
                    size="small"
                    onClick={() => props.append(props.appendNyPeriode())}
                >
                    {formatMessage('knapp.nyPeriode')}
                </Button>
            </div>
        </div>
    );
};

export default MultiPeriodeVelger;
