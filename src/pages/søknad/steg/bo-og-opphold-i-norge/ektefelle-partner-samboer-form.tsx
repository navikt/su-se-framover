import { Checkbox, Input, Radio, RadioGruppe } from 'nav-frontend-skjema';
import React, { useState } from 'react';

import styles from './ektefelle-partner-samboer-form.module.less';

const EktefellePartnerSamboer = () => {
    const [fnrErUkjent, setFnrErUkjent] = useState(false);

    return (
        <div>
            <FnrInput disabled={fnrErUkjent} />
            <Checkbox onChange={(e) => setFnrErUkjent(e.target.checked)} label="Vet ikke" />

            {fnrErUkjent ? null : null}

            <div className={styles.ufør}>
                <RadioGruppe legend="Er ektefelle eller samboer ufør flyktning?">
                    <Radio label={'Ja'} name="sitteplass" />
                    <Radio label={'Nei'} name="sitteplass" />
                </RadioGruppe>
            </div>
        </div>
    );
};

interface FnrInputProps {
    disabled: boolean;
}
const FnrInput = ({ disabled }: FnrInputProps) => (
    <div className={styles.fnrInput}>
        <Input disabled={disabled} placeholder="11 siffrer" />

        {!disabled && (
            <div className={styles.result}>
                <GenderIcon />
                <p>Daniel Pesløs</p>
            </div>
        )}
    </div>
);
const GenderIcon = () => <div className={styles.genderIcon} />;

export default EktefellePartnerSamboer;
