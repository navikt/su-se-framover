import * as RemoteData from '@devexperts/remote-data-ts';
import fnrValidator from '@navikt/fnrvalidator';
import { FormikErrors } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Input, Radio, RadioGruppe, SkjemaelementFeilmelding } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useEffect, useState, useMemo } from 'react';

import { ApiError } from '~api/apiClient';
import * as personApi from '~api/personApi';
import { Person } from '~api/personApi';
import { Personkort } from '~components/Personkort';
import { EPSFormData } from '~features/søknad/types';
import { useI18n } from '~lib/hooks';
import { keyOf, Nullable } from '~lib/types';

import messages from './bo-og-opphold-i-norge-nb';
import styles from './ektefelle-partner-samboer.module.less';

interface Props {
    id: string;
    onChange: (eps: EPSFormData) => void;
    value: Nullable<EPSFormData>;
    feil?: FormikErrors<EPSFormData>;
}
const EktefellePartnerSamboer = (props: Props) => {
    const epsFormData: EPSFormData = props.value ?? { fnr: null, alder: null, erUførFlyktning: null };

    const intl = useI18n({ messages });

    const erEpsUnder67 = useMemo(() => {
        return epsFormData.alder && epsFormData.alder < 67;
    }, [epsFormData.fnr, epsFormData.alder]);

    return (
        <div>
            <FnrInput
                inputId={`${props.id}.${keyOf<EPSFormData>('fnr')}`}
                fnr={epsFormData.fnr}
                onFnrChange={(fnr) => {
                    props.onChange({
                        ...epsFormData,
                        fnr,
                    });
                }}
                feil={props.feil?.fnr}
                autoComplete="off"
                onAlderChange={(alder) => {
                    props.onChange({
                        ...epsFormData,
                        alder: alder,
                    });
                }}
            />

            <div className={styles.ufør}>
                {erEpsUnder67 && (
                    <RadioGruppe
                        legend={intl.formatMessage({ id: 'input.ektefelleEllerSamboerUførFlyktning.label' })}
                        feil={props.feil?.erUførFlyktning}
                    >
                        <Radio
                            id={`${props.id}.${keyOf<EPSFormData>('erUførFlyktning')}`}
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
                )}
            </div>
            {typeof props.feil === 'string' && (
                <SkjemaelementFeilmelding>
                    {intl.formatMessage({ id: 'ektefelleEllerSamboer.feil.felteneMåFyllesUt' })}
                </SkjemaelementFeilmelding>
            )}
        </div>
    );
};

interface FnrInputProps {
    inputId: string;
    fnr: Nullable<string>;
    onFnrChange: (fnr: string) => void;
    feil?: React.ReactNode;
    autoComplete?: string;
    onAlderChange: (alder: Nullable<number>) => void;
}
const FnrInput = ({ inputId, fnr, onFnrChange, feil, autoComplete, onAlderChange }: FnrInputProps) => {
    const [person, setPerson] = useState<RemoteData.RemoteData<ApiError, Person>>(RemoteData.initial);
    const [harIkkeTilgang, setHarIkkeTilgang] = useState<boolean>(false);
    const intl = useI18n({ messages });

    async function fetchPerson(fødselsnummer: string) {
        setHarIkkeTilgang(false);
        setPerson(RemoteData.pending);
        const res = await personApi.fetchPerson(fødselsnummer);

        if (res.status === 'error') {
            if (res.error.statusCode === 403) {
                setHarIkkeTilgang(true);
            } else {
                setPerson(RemoteData.failure(res.error));
            }
        }

        if (res.status === 'ok') {
            setPerson(RemoteData.success(res.data));
            onAlderChange(res.data.alder);
        }
    }

    useEffect(() => {
        setPerson(RemoteData.initial);
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
                id={inputId}
                label={intl.formatMessage({ id: 'input.ektefelleEllerSamboerFnr.label' })}
                description={intl.formatMessage({ id: 'input.ektefelleEllerSamboerFnrDescription.label' })}
                onChange={(e) => onFnrChange(e.target.value)}
                value={fnr ?? ''}
                maxLength={11}
                feil={feil}
                autoComplete={autoComplete}
            />

            {RemoteData.isPending(person) && <NavFrontendSpinner />}
            {RemoteData.isSuccess(person) && (
                <div className={styles.personkort}>
                    <Personkort person={person.value} />
                </div>
            )}
            {RemoteData.isFailure(person) && (
                <div>
                    <AlertStripe type="feil">
                        {intl.formatMessage({ id: 'ektefelleEllerSamboer.feil.kunneIkkeSøkePerson' })}
                    </AlertStripe>
                </div>
            )}
            {harIkkeTilgang && (
                <div>
                    <AlertStripe type="feil">
                        {intl.formatMessage({ id: 'ektefelleEllerSamboer.feil.ikkeTilgang' })}
                    </AlertStripe>
                </div>
            )}
        </div>
    );
};

export default EktefellePartnerSamboer;
