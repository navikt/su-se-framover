import { Checkbox, Input, Radio, RadioGruppe } from 'nav-frontend-skjema';
import React, { useEffect, useState } from 'react';

import * as personApi from '~api/personApi';
import { Person } from '~api/personApi';
import { KjønnKvinne, KjønnMann, KjønnUkjent } from '~assets/Icons';
import { showName } from '~features/person/personUtils';
import { Nullable } from '~lib/types';

import { EPSFormData } from './Bo-og-opphold-i-norge';
import styles from './ektefelle-partner-samboer.module.less';
import { initialEPS } from './utils';

interface Props {
    onChange: (eps: EPSFormData) => void;
    value: Nullable<EPSFormData>;
}
const EktefellePartnerSamboer = ({ onChange, value = initialEPS }: Props) => {
    const [fnrErUkjent, setFnrErUkjent] = useState(false);

    return (
        <div>
            <FnrInput
                disabled={fnrErUkjent}
                fnr={value?.fnr ?? null}
                onFnrChange={(fnr) => {
                    onChange({
                        ...(value ?? initialEPS),
                        fnr,
                    });
                }}
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
    const [person, setPerson] = useState<Person | null>(null);

    async function fetchPerson(fødselsnummer: string) {
        const res = await personApi.fetchPerson(fødselsnummer);
        if (res.status === 'ok') {
            setPerson(res.data);
        }
    }

    useEffect(() => {
        setPerson(null);
        if (fnr?.length === 11) fetchPerson(fnr);
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
                    <GenderIcon kjønn={person.kjønn} />
                    <p>{showName(person)}</p>
                </div>
            )}
        </div>
    );
};

const GenderIcon = ({ kjønn }: { kjønn: Nullable<personApi.Kjønn> }) => {
    if (kjønn === personApi.Kjønn.Mann) {
        return <KjønnMann />;
    } else if (kjønn === personApi.Kjønn.Kvinne) {
        return <KjønnKvinne />;
    } else {
        return <KjønnUkjent />;
    }
};

export default EktefellePartnerSamboer;
