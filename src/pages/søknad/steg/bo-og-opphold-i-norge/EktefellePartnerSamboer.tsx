import * as RemoteData from '@devexperts/remote-data-ts';
import { useState } from 'react';
import { FieldErrors } from 'react-hook-form';

import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import SkjemaelementFeilmelding from '~src/components/formElements/SkjemaelementFeilmelding';
import { FnrInput } from '~src/components/inputs/FnrInput/FnrInput';
import { EPSFormData } from '~src/features/søknad/types';
import { useI18n } from '~src/lib/i18n';
import { keyOf, Nullable } from '~src/lib/types';
import { Person } from '~src/types/Person';

import messages from './bo-og-opphold-i-norge-nb';
import styles from './ektefelle-partner-samboer.module.less';

interface Props {
    id: string;
    onChange: (eps: EPSFormData) => void;
    value: Nullable<EPSFormData>;
    feil?: FieldErrors<EPSFormData>;
}
const EktefellePartnerSamboer = (props: Props) => {
    const [eps, setEps] = useState<Nullable<Person>>(null);
    const epsFormData: EPSFormData = props.value ?? {
        fnr: null,
        erUførFlyktning: null,
    };

    const { formatMessage } = useI18n({ messages });

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
                    setEps(person);
                }}
                getPersonStatus={(res) => {
                    if (RemoteData.isSuccess(res)) {
                        setEps(res.value);
                    } else {
                        setEps(null);
                    }
                }}
            />

            <div className={styles.ufør}>
                {eps !== null && (
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
