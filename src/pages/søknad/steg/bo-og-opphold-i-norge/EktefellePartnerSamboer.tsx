import { FormikErrors } from 'formik';
import React, { useMemo } from 'react';

import { FnrInput } from '~src/components/FnrInput/FnrInput';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import SkjemaelementFeilmelding from '~src/components/formElements/SkjemaelementFeilmelding';
import { EPSFormData } from '~src/features/søknad/types';
import { useI18n } from '~src/lib/i18n';
import { keyOf, Nullable } from '~src/lib/types';

import messages from './bo-og-opphold-i-norge-nb';
import * as styles from './ektefelle-partner-samboer.module.less';

interface Props {
    id: string;
    onChange: (eps: EPSFormData) => void;
    value: Nullable<EPSFormData>;
    feil?: FormikErrors<EPSFormData>;
}
const EktefellePartnerSamboer = (props: Props) => {
    const epsFormData: EPSFormData = props.value ?? {
        fnr: null,
        alder: null,
        erUførFlyktning: null,
        eps: null,
    };

    const { formatMessage } = useI18n({ messages });

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
                getHentetPerson={(person) => {
                    props.onChange({
                        ...epsFormData,
                        eps: person,
                        alder: person?.alder ?? null,
                    });
                }}
            />

            <div className={styles.ufør}>
                {erEpsUnder67 && (
                    <BooleanRadioGroup
                        name={`${props.id}.${keyOf<EPSFormData>('erUførFlyktning')}`}
                        legend={formatMessage('delerBoligMed.epsUførFlyktning')}
                        error={props.feil?.erUførFlyktning}
                        value={epsFormData.erUførFlyktning}
                        onChange={(val) => {
                            props.onChange({ ...epsFormData, erUførFlyktning: val });
                        }}
                    />
                )}
            </div>
            {typeof props.feil === 'string' && (
                <SkjemaelementFeilmelding>
                    {formatMessage('ektefelleEllerSamboer.feil.felteneMåFyllesUt')}
                </SkjemaelementFeilmelding>
            )}
        </div>
    );
};

export default EktefellePartnerSamboer;
