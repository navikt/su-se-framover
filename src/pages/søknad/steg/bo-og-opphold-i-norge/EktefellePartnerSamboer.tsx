import { Checkbox, Input, Radio, RadioGruppe } from 'nav-frontend-skjema';
import React, { useEffect, useState } from 'react';

import * as personApi from '~api/personApi';
import { Person } from '~api/personApi';
import { KjønnKvinne, KjønnMann, KjønnUkjent } from '~assets/Icons';
import { showName } from '~features/person/personUtils';
import { isValidDayMonthYearFormat } from '~lib/dateUtils';
import { Nullable } from '~lib/types';

import { EPSFormData } from './Bo-og-opphold-i-norge';
import styles from './ektefelle-partner-samboer.module.less';
import { initialEPS } from './utils';

interface Props {
    onChange: (eps: EPSFormData) => void;
    value: Nullable<EPSFormData>;
    feil?: string;
}
const EktefellePartnerSamboer = (props: Props) => {
    const [fnrErUkjent, setFnrErUkjent] = useState(false);
    const EPSFormData = props.value ?? initialEPS;

    return (
        <div>
            <FnrInput
                disabled={fnrErUkjent}
                fnr={EPSFormData.fnr}
                onFnrChange={(fnr) => {
                    props.onChange({
                        ...EPSFormData,
                        fnr,
                    });
                }}
                feil={!fnrErUkjent && props.feil}
            />
            <Checkbox
                onChange={(e) => {
                    const { checked } = e.target;
                    setFnrErUkjent(checked);

                    props.onChange({
                        ...EPSFormData,
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
                        value={EPSFormData.navn ?? ''}
                        label="Hva er navnet til ektefelle eller samboer?"
                        onChange={(e) => {
                            props.onChange({
                                ...EPSFormData,
                                navn: e.target.value,
                            });
                        }}
                        feil={!EPSFormData.navn && props.feil}
                    />
                    <Input
                        value={EPSFormData.fødselsdato ?? ''}
                        label="Hva er fødselsdatoen til ektefelle eller samboer?"
                        placeholder="DD.MM.ÅÅÅÅ"
                        bredde="S"
                        maxLength={10}
                        onChange={(e) => {
                            props.onChange({
                                ...EPSFormData,
                                fødselsdato: e.target.value,
                            });
                        }}
                        feil={!isValidDayMonthYearFormat(EPSFormData.fødselsdato) && props.feil}
                    />
                </div>
            )}

            <div className={styles.ufør}>
                <RadioGruppe
                    legend="Er ektefelle eller samboer ufør flyktning?"
                    feil={EPSFormData.erUførFlyktning === null && props.feil}
                >
                    <Radio
                        checked={Boolean(EPSFormData.erUførFlyktning)}
                        onChange={() =>
                            props.onChange({
                                ...EPSFormData,
                                erUførFlyktning: true,
                            })
                        }
                        label="Ja"
                        name="erUfør"
                    />
                    <Radio
                        checked={EPSFormData.erUførFlyktning === false}
                        onChange={() =>
                            props.onChange({
                                ...EPSFormData,
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
    feil?: React.ReactNode;
}
const FnrInput = ({ disabled, fnr, onFnrChange, feil }: FnrInputProps) => {
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
                placeholder="11 siffer"
                maxLength={11}
                feil={feil}
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
