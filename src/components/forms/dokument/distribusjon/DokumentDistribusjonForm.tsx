import { BodyShort, Button, HelpText, TextField } from '@navikt/ds-react';
import { ArrayPath, Control, Controller, FieldArray, FieldValues, Path, useFieldArray } from 'react-hook-form';

import styles from './DokumentDistribusjonForm.module.less';

const DokumentDistribusjonForm = <T extends FieldValues>(props: { prependNames?: string; control: Control<T> }) => {
    return (
        <div className={styles.formInputsContainer}>
            <Adresselinjer control={props.control} prependNames={props.prependNames} />
            <div className={styles.postContainer}>
                <Controller
                    control={props.control}
                    name={`${props.prependNames ? `${props.prependNames}.postnummer` : 'postnummer'}` as Path<T>}
                    render={({ field, fieldState }) => (
                        <TextField
                            label={
                                <div className={styles.label}>
                                    <BodyShort>Postnummer</BodyShort>
                                    <HelpText>Postnummer blir ikke validert</HelpText>
                                </div>
                            }
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                        />
                    )}
                />
                <Controller
                    control={props.control}
                    name={`${props.prependNames ? `${props.prependNames}.poststed` : 'poststed'}` as Path<T>}
                    render={({ field, fieldState }) => (
                        <TextField
                            label={
                                <div className={styles.label}>
                                    <BodyShort>Poststed</BodyShort>
                                    <HelpText>Poststed blir ikke validert</HelpText>
                                </div>
                            }
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            </div>
        </div>
    );
};

const Adresselinjer = <T extends FieldValues>(props: { prependNames?: string; control: Control<T> }) => {
    const name = props.prependNames ? `${props.prependNames}.adresser` : 'adresser';

    const adresser = useFieldArray({
        control: props.control,
        name: name as ArrayPath<T>,
    });

    return (
        <div className={styles.adresselinjeComponentContainer}>
            {adresser.fields.map((el, idx) => (
                <Controller
                    key={el.id}
                    control={props.control}
                    name={`${name}.${idx}.adresselinje` as Path<T>}
                    render={({ field, fieldState }) => (
                        <TextField
                            {...field}
                            autoComplete="off"
                            onChange={field.onChange}
                            value={field.value ?? ''}
                            label={`Adresselinje ${idx + 1}`}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            ))}
            <div className={styles.adresselinjeButtons}>
                {adresser.fields.length < 3 && (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            adresser.append({ adresselinje: '' } as FieldArray<T>);
                        }}
                    >
                        +
                    </Button>
                )}
                {adresser.fields.length > 1 && (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            adresser.remove(adresser.fields.length - 1);
                        }}
                    >
                        -
                    </Button>
                )}
            </div>
        </div>
    );
};

export default DokumentDistribusjonForm;
