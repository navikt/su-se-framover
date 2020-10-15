import { Checkbox, Input, Radio, RadioGruppe } from 'nav-frontend-skjema';
import React, { useEffect, useState } from 'react';

import { Nullable } from '~lib/types';

import { EPSFormData } from './Bo-og-opphold-i-norge';
import styles from './ektefelle-partner-samboer-form.module.less';
import { initialEPS } from './utils';

interface Props {
    onChange: (eps: EPSFormData) => void;
    value: Nullable<EPSFormData>;
}
const EktefellePartnerSamboer = ({ onChange, value }: Props) => {
    const [fnrErUkjent, setFnrErUkjent] = useState(false);

    return (
        <div>
            <FnrInput
                disabled={fnrErUkjent}
                fnr={value?.fnr ?? null}
                onFnrChange={(fnr) =>
                    onChange({
                        ...(value ?? initialEPS),
                        fnr,
                    })
                }
            />
            <Checkbox
                onChange={(e) => {
                    const { checked } = e.target;
                    setFnrErUkjent(checked);

                    onChange({
                        ...(value ?? initialEPS),
                        navn: null,
                        fødselsdato: null,
                        fnr: null,
                    });
                }}
                label="Vet ikke fødselsnummer"
            />

            {fnrErUkjent && (
                <div className={styles.ukjentFnr}>
                    <Input
                        value={value?.navn ?? ''}
                        label="Hva er navnet til ektefelle eller samboer?"
                        onChange={(e) => {
                            onChange({
                                ...(value ?? initialEPS),
                                navn: e.target.value,
                            });
                        }}
                    />
                    <Input
                        value={value?.fødselsdato ?? ''}
                        label="Hva er fødselsdatoen til ektefelle eller samboer?"
                        placeholder="DD.MM.ÅÅÅÅ"
                        bredde="S"
                        maxLength={10}
                        onChange={(e) => {
                            onChange({
                                ...(value ?? initialEPS),
                                fødselsdato: e.target.value,
                            });
                        }}
                    />
                </div>
            )}

            <div className={styles.ufør}>
                <RadioGruppe legend="Er ektefelle eller samboer ufør flyktning?">
                    <Radio
                        checked={Boolean(value?.erUførFlyktning)}
                        onChange={() =>
                            onChange({
                                ...(value ?? initialEPS),
                                erUførFlyktning: true,
                            })
                        }
                        label="Ja"
                        name="erUfør"
                    />
                    <Radio
                        checked={value?.erUførFlyktning === false}
                        onChange={() =>
                            onChange({
                                ...(value ?? initialEPS),
                                erUførFlyktning: false,
                            })
                        }
                        label="Nei"
                        name="erUfør"
                    />
                </RadioGruppe>
            </div>
        </div>
    );
};

interface FnrInputProps {
    disabled: boolean;
    fnr: Nullable<string>;
    onFnrChange: (fnr: string) => void;
}
const FnrInput = ({ disabled, fnr, onFnrChange }: FnrInputProps) => {
    // TODO AI: Finns en FnrInput-komponent från designbiblioteket.
    const [person, setPerson] = useState<string | null>(null);

    useEffect(() => {
        setPerson(null);
        if (fnr?.length === 11) {
            setPerson('Daniel Pesløs');
        }
    }, [fnr]);

    return (
        <div className={styles.fnrInput}>
            <Input
                onChange={(e) => onFnrChange(e.target.value)}
                value={fnr ?? ''}
                disabled={disabled}
                placeholder="11 siffrer"
                maxLength={11}
            />

            {!disabled && person && (
                <div className={styles.result}>
                    <GenderIcon />
                    <p>{person}</p>
                </div>
            )}
        </div>
    );
};
const GenderIcon = () => <div className={styles.genderIcon} />;

export default EktefellePartnerSamboer;
