import fnrValidator from '@navikt/fnrvalidator';
import AlertStripe from 'nav-frontend-alertstriper';
import { Input, Radio, RadioGruppe } from 'nav-frontend-skjema';
import React, { useEffect, useState } from 'react';

import * as personApi from '~api/personApi';
import { Person } from '~api/personApi';
import { KjønnKvinne, KjønnMann, KjønnUkjent } from '~assets/Icons';
import { showName } from '~features/person/personUtils';
import { EPSFormData } from '~features/søknad/types';
import { Nullable } from '~lib/types';

import { useI18n } from '../../../../lib/hooks';

import messages from './bo-og-opphold-i-norge-nb';
import styles from './ektefelle-partner-samboer.module.less';

interface Props {
    id: string;
    onChange: (eps: EPSFormData) => void;
    value: Nullable<EPSFormData>;
    feil?: string;
}
const EktefellePartnerSamboer = (props: Props) => {
    const epsFormData = props.value ?? { fnr: null, erUførFlyktning: null };

    const intl = useI18n({ messages });

    return (
        <div id={props.id} tabIndex={-1}>
            <FnrInput
                fnr={epsFormData.fnr}
                onFnrChange={(fnr) => {
                    props.onChange({
                        ...epsFormData,
                        fnr,
                    });
                }}
                feil={props.feil}
                autoComplete="off"
            />

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
    fnr: Nullable<string>;
    onFnrChange: (fnr: string) => void;
    feil?: React.ReactNode;
    autoComplete?: string;
}
const FnrInput = ({ fnr, onFnrChange, feil, autoComplete }: FnrInputProps) => {
    const [person, setPerson] = useState<Person | null>(null);
    const [harIkkeTilgang, setHarIkkeTilgang] = useState<boolean>(false);
    const intl = useI18n({ messages });

    async function fetchPerson(fødselsnummer: string) {
        setHarIkkeTilgang(false);
        const res = await personApi.fetchPerson(fødselsnummer);
        if (res.status === 'error' && res.error.statusCode === 403) {
            setHarIkkeTilgang(true);
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
                maxLength={11}
                feil={feil}
                autoComplete={autoComplete}
            />

            {person && (
                <div className={styles.result}>
                    <GenderIcon kjønn={person.kjønn} />
                    <p className={styles.name}>{showName(person.navn)}</p>
                </div>
            )}
            {harIkkeTilgang && (
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
