import fnrValidator from '@navikt/fnrvalidator';
import AlertStripe from 'nav-frontend-alertstriper';
import { Checkbox, Input, Radio, RadioGruppe } from 'nav-frontend-skjema';
import React, { useEffect, useState } from 'react';

import * as personApi from '~api/personApi';
import { Person } from '~api/personApi';
import { KjønnKvinne, KjønnMann, KjønnUkjent } from '~assets/Icons';
import { showName } from '~features/person/personUtils';
import { EPSFormData } from '~features/søknad/types';
import { isValidDayMonthYearFormat } from '~lib/dateUtils';
import { Nullable } from '~lib/types';

import { useI18n } from '../../../../lib/hooks';

import messages from './bo-og-opphold-i-norge-nb';
import styles from './ektefelle-partner-samboer.module.less';
import { initialEPS } from './utils';

interface Props {
    onChange: (eps: EPSFormData) => void;
    value: Nullable<EPSFormData>;
    feil?: string;
}
const EktefellePartnerSamboer = (props: Props) => {
<<<<<<< HEAD
    const [fnrErUkjent, setFnrErUkjent] = useState(false);
    const epsFormData = props.value ?? initialEPS;
=======
    const EPSFormData = props.value ?? initialEPS;
    const [fnrErUkjent, setFnrErUkjent] = useState(Boolean(EPSFormData.fødselsdato && EPSFormData.navn));
>>>>>>> Fix initialvalues for prefilled eps info in søknad

    const intl = useI18n({ messages });

    return (
        <div>
            <FnrInput
                disabled={fnrErUkjent}
                fnr={epsFormData.fnr}
                onFnrChange={(fnr) => {
                    props.onChange({
                        ...epsFormData,
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
                        ...epsFormData,
                        navn: null,
                        fødselsdato: null,
                        fnr: null,
                    });
                }}
                checked={fnrErUkjent}
                label="Vet ikke fødselsnummer"
            />

            {fnrErUkjent && (
                <div className={styles.ukjentFnr}>
                    <Input
                        value={epsFormData.navn ?? ''}
                        label={intl.formatMessage({ id: 'input.ektefelleEllerSamboerNavn.label' })}
                        onChange={(e) => {
                            props.onChange({
                                ...epsFormData,
                                navn: e.target.value,
                            });
                        }}
                        feil={!epsFormData.navn && props.feil}
                    />
                    <Input
                        value={epsFormData.fødselsdato ?? ''}
                        label={intl.formatMessage({ id: 'input.ektefelleEllerSamboerFødselsdato.label' })}
                        description="DD.MM.ÅÅÅÅ"
                        bredde="S"
                        maxLength={10}
                        onChange={(e) => {
                            props.onChange({
                                ...epsFormData,
                                fødselsdato: e.target.value,
                            });
                        }}
                        feil={!isValidDayMonthYearFormat(epsFormData.fødselsdato) && props.feil}
                    />
                </div>
            )}

            <div className={styles.ufør}>
                <RadioGruppe
                    legend={intl.formatMessage({ id: 'input.ektefelleEllerSamboerUførFlyktning.label' })}
                    feil={epsFormData.erUførFlyktning === null && props.feil}
                >
                    <Radio
                        checked={Boolean(epsFormData.erUførFlyktning)}
                        onChange={() =>
                            props.onChange({
                                ...epsFormData,
                                erUførFlyktning: true,
                            })
                        }
                        label="Ja"
                        name="erUfør"
                    />
                    <Radio
                        checked={epsFormData.erUførFlyktning === false}
                        onChange={() =>
                            props.onChange({
                                ...epsFormData,
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
    const [isForbidden, setIsForbidden] = useState<boolean>(false);
    const intl = useI18n({ messages });

    async function fetchPerson(fødselsnummer: string) {
        setIsForbidden(false);
        const res = await personApi.fetchPerson(fødselsnummer);
        if (res.status === 'error' && res.error.statusCode === 403) {
            setIsForbidden(true);
        }
        if (res.status === 'ok') {
            setPerson(res.data);
        }
    }

    useEffect(() => {
        setPerson(null);
        if (fnr?.length === 11) {
            const validateFnr = fnrValidator.fnr(fnr);
            if (validateFnr.status === 'valid') {
                fetchPerson(fnr);
            }
        }
    }, [fnr]);

    return (
        <div className={styles.fnrInput}>
            <Input
                label={intl.formatMessage({ id: 'input.ektefelleEllerSamboerFnr.label' })}
                description={intl.formatMessage({ id: 'input.ektefelleEllerSamboerFnrDescription.label' })}
                onChange={(e) => onFnrChange(e.target.value)}
                value={fnr ?? ''}
                disabled={disabled}
                maxLength={11}
                feil={feil}
            />

            {!disabled && person && (
                <div className={styles.result}>
                    <GenderIcon kjønn={person.kjønn} />
                    <p className={styles.name}>{showName(person)}</p>
                </div>
            )}
            {!disabled && isForbidden && (
                <div>
                    <AlertStripe type="feil"> Du har ikke tilgang til å se informasjon om denne brukeren </AlertStripe>
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
