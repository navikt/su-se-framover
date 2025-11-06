import { TrashIcon } from '@navikt/aksel-icons';
import { Button, Panel } from '@navikt/ds-react';
import { ReactNode } from 'react';
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
import styles from './multiPeriodeVelger.module.less';
import messages from './multiPeriodeVelger-nb';

export type PartialName<T> = `${keyof T & string}.${number}`;

interface Props<T extends FieldValues, U> {
    className?: string;
    name: keyof T & string;
    controller: Control<T>;
    appendNyPeriode: () => U;
    periodeConfig: {
        minDate: Date;
        maxDate: Date;
        size?: 'medium' | 'small';
    };
    getChild: (nameAndIdx: PartialName<T>) => ReactNode;
    childrenOverDato?: boolean;
    //disse er for å kun opprettholde søknadsbehandling som den er. sjekk om det er greit å periodisere andre vilkår
    begrensTilEnPeriode?: boolean;
    skalIkkeKunneVelgePeriode?: boolean;
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
                                    value={field.value}
                                    onChange={(periode: NullablePeriode) => {
                                        update(idx, { ...watchedItem, periode: periode });
                                    }}
                                    minDate={props.periodeConfig.minDate}
                                    maxDate={props.periodeConfig.maxDate}
                                    error={fieldState.error as FieldErrors<NullablePeriode>}
                                    size={props.periodeConfig.size}
                                />
                            )}
                        />
                    );

                    return (
                        <li key={el.id}>
                            <Panel className={styles.periodePanel}>
                                <div className={styles.periodeOgSøppelbøtteContainer}>
                                    {props.childrenOverDato
                                        ? props.getChild(`${props.name}.${idx}`)
                                        : !props.skalIkkeKunneVelgePeriode && periodeInput}

                                    {!props.begrensTilEnPeriode && (
                                        <Button
                                            variant="secondary"
                                            type="button"
                                            onClick={() => remove(idx)}
                                            size="small"
                                            aria-label={formatMessage('knapp.fjernPeriode')}
                                        >
                                            <TrashIcon />
                                        </Button>
                                    )}
                                </div>
                                {!props.childrenOverDato
                                    ? props.getChild(`${props.name}.${idx}`)
                                    : !props.skalIkkeKunneVelgePeriode && periodeInput}
                            </Panel>
                        </li>
                    );
                })}
            </ul>
            {!props.begrensTilEnPeriode && (
                <div>
                    <Button
                        variant="secondary"
                        type="button"
                        size="small"
                        onClick={() => append(props.appendNyPeriode())}
                    >
                        {formatMessage('knapp.nyPeriode')}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MultiPeriodeVelger;
