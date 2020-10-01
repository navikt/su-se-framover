import { FormikErrors } from 'formik';
import { Normaltekst, Feilmelding } from 'nav-frontend-typografi';
import React from 'react';
import DatePicker from 'react-datepicker';
import { IntlShape } from 'react-intl';

import { FradragFormData } from '~pages/saksbehandling/steg/beregning/FradragInputs';
import { DelerAvPeriode } from '~types/Fradrag';

import styles from './fradragInputs.module.less';

const DelerAvPeriodeInputs = (props: {
    fraOgMedId: string;
    tilOgMedId: string;
    fradrag: FradragFormData;
    setFieldValue: (field: string, value: Date | [Date, Date] | null) => void;
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
                    name={props.fraOgMedId}
                    selected={props.fradrag.delerAvPeriode?.fraOgMed}
                    onChange={(e) => {
                        props.setFieldValue(props.fraOgMedId, e);
                    }}
                    dateFormat="MM/yyyy"
                    showMonthYearPicker
                    isClearable
                    selectsStart
                    startDate={props.fradrag.delerAvPeriode?.fraOgMed}
                    endDate={props.fradrag.delerAvPeriode?.tilOgMed}
                />
                {fraOgMedError && <Feilmelding>{fraOgMedError}</Feilmelding>}
            </div>
            <div>
                <Normaltekst className={styles.dateLabelTekst}>
                    {props.intl.formatMessage({ id: 'datovelger.tom.legend' })}
                </Normaltekst>
                <DatePicker
                    id={props.tilOgMedId}
                    name={props.tilOgMedId}
                    selected={props.fradrag.delerAvPeriode?.tilOgMed}
                    onChange={(e) => {
                        props.setFieldValue(props.tilOgMedId, e);
                    }}
                    dateFormat="MM/yyyy"
                    showMonthYearPicker
                    isClearable
                    selectsEnd
                    startDate={props.fradrag.delerAvPeriode?.fraOgMed}
                    endDate={props.fradrag.delerAvPeriode?.tilOgMed}
                    minDate={props.fradrag.delerAvPeriode?.fraOgMed}
                />
                {tilOgMedError && <Feilmelding>{tilOgMedError}</Feilmelding>}
            </div>
        </div>
    );
};

export default DelerAvPeriodeInputs;
