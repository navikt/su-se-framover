import { FormikErrors } from 'formik';
import { Radio, RadioGruppe, SkjemaelementFeilmelding } from 'nav-frontend-skjema';
import React, { useMemo } from 'react';

import { FnrInput } from '~components/FnrInput/FnrInput';
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

    const { intl } = useI18n({ messages });

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
                        legend={intl.formatMessage({ id: 'delerBolig.epsUførFlyktning' })}
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

export default EktefellePartnerSamboer;
