import { useMemo } from 'react';
import { FieldErrors } from 'react-hook-form';

import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import SkjemaelementFeilmelding from '~src/components/formElements/SkjemaelementFeilmelding';
import { FnrInput } from '~src/components/inputs/FnrInput/FnrInput';
import { EPSFormData } from '~src/features/søknad/types';
import { useI18n } from '~src/lib/i18n';
import { keyOf, Nullable } from '~src/lib/types';

import messages from './bo-og-opphold-i-norge-nb';
import styles from './ektefelle-partner-samboer.module.less';

interface Props {
    id: string;
    onChange: (eps: EPSFormData) => void;
    value: Nullable<EPSFormData>;
    feil?: FieldErrors<EPSFormData>;
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
                feil={props.feil?.fnr?.message}
                getHentetPerson={(person) => {
                    props.onChange({
                        ...epsFormData,
                        eps: person,
                        alder: person?.fødsel?.alder ?? null,
                    });
                }}
            />

            <div className={styles.ufør}>
                {erEpsUnder67 && (
                    <BooleanRadioGroup
                        name={`${props.id}.${keyOf<EPSFormData>('erUførFlyktning')}`}
                        legend={formatMessage('delerBoligMed.epsUførFlyktning')}
                        error={props.feil?.erUførFlyktning?.message}
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
