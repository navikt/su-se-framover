import { FormikErrors } from 'formik';
import { Normaltekst, Feilmelding } from 'nav-frontend-typografi';
import React from 'react';
import DatePicker from 'react-datepicker';
import { IntlShape } from 'react-intl';

import { FradragFormData } from '~features/beregning';
import { DelerAvPeriode } from '~types/Fradrag';

import styles from './beregning.module.less';

const DelerAvPeriodeInputs = (props: {
    fraOgMedId: string;
    tilOgMedId: string;
    fradrag: FradragFormData;
    periodeChanger: (
        keyNavn: keyof Pick<DelerAvPeriode, 'fraOgMed' | 'tilOgMed'>,
        dato: Date | [Date, Date] | null,
        index: number,
        fradrag: Array<FradragFormData>
    ) => void;
    fradragsArray: FradragFormData[];
    index: number;
    delerAvPeriodeErrors: FormikErrors<DelerAvPeriode> | undefined;
    intl: IntlShape;
}) => {
    const fraOgMedError = props.delerAvPeriodeErrors?.fraOgMed;
    const tilOgMedError = props.delerAvPeriodeErrors?.tilOgMed;

    return (
        <div className={styles.delerAvPeriodeContainer}>
            <div>
                <Normaltekst className={styles.dateLabelTekst}>
                    {props.intl.formatMessage({ id: 'datovelger.fom.legend' })}
                </Normaltekst>
                <DatePicker
                    id={props.fraOgMedId}
                    selected={props.fradrag.delerAvPeriodeData?.fraOgMed}
                    onChange={(dato) => props.periodeChanger('fraOgMed', dato, props.index, props.fradragsArray)}
                    dateFormat="MM/yyyy"
                    showMonthYearPicker
                    isClearable
                    selectsEnd
                    startDate={props.fradrag.delerAvPeriodeData?.fraOgMed}
                    endDate={props.fradrag.delerAvPeriodeData?.tilOgMed}
                    minDate={props.fradrag.delerAvPeriodeData?.fraOgMed}
                />
                <Feilmelding>{fraOgMedError ?? ''}</Feilmelding>
            </div>
            <div>
                <Normaltekst className={styles.dateLabelTekst}>
                    {props.intl.formatMessage({ id: 'datovelger.tom.legend' })}
                </Normaltekst>
                <DatePicker
                    id={props.tilOgMedId}
                    selected={props.fradrag.delerAvPeriodeData?.tilOgMed}
                    onChange={(dato) => props.periodeChanger('tilOgMed', dato, props.index, props.fradragsArray)}
                    dateFormat="MM/yyyy"
                    showMonthYearPicker
                    isClearable
                    selectsEnd
                    startDate={props.fradrag.delerAvPeriodeData?.fraOgMed}
                    endDate={props.fradrag.delerAvPeriodeData?.tilOgMed}
                    minDate={props.fradrag.delerAvPeriodeData?.fraOgMed}
                />
                <Feilmelding>{tilOgMedError ?? ''}</Feilmelding>
            </div>
        </div>
    );
};

export default DelerAvPeriodeInputs;
