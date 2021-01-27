import * as RemoteData from '@devexperts/remote-data-ts';
import * as DateFns from 'date-fns';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Innholdstittel, Ingress, Feilmelding } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Link } from 'react-router-dom';

import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppSelector } from '~redux/Store';
import { Periode } from '~types/Fradrag';

import messages from '../revurdering-nb';
import sharedStyles from '../revurdering.module.less';

import styles from './valgAvPeriode.module.less';

interface ValgAvPeriodeFormData {
    fraOgMed: Nullable<Date>;
    tilOgMed: Nullable<Date>;
}

const schema = yup.object<ValgAvPeriodeFormData>({
    fraOgMed: yup.date().nullable().required(),
    tilOgMed: yup.date().nullable().required(),
});

const ValgAvPeriode = (props: {
    sakId: string;
    førsteUtbetalingISak: Date;
    sisteUtbetalingISak: Date;
    periode: Nullable<Periode>;
    opprettRevurderingHvisPeriodenErGyldig: (periode: Periode) => void;
}) => {
    const intl = useI18n({ messages });
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const opprettRevurderingStatus = useAppSelector((state) => state.revurdering.opprettRevurderingStatus);

    const formik = useFormik<ValgAvPeriodeFormData>({
        initialValues: {
            fraOgMed: props.periode?.fraOgMed ?? null,
            tilOgMed: props.periode?.tilOgMed ?? null,
        },
        async onSubmit({ fraOgMed, tilOgMed }) {
            if (fraOgMed && tilOgMed) {
                props.opprettRevurderingHvisPeriodenErGyldig({ fraOgMed, tilOgMed });
            }
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });
    const periode =
        formik.values.fraOgMed && formik.values.tilOgMed
            ? {
                  fraOgMed: formik.values.fraOgMed,
                  tilOgMed: formik.values.tilOgMed,
              }
            : null;

    return (
        <form
            className={sharedStyles.revurderingContainer}
            onSubmit={(e) => {
                setHasSubmitted(true);
                formik.handleSubmit(e);
            }}
        >
            <Innholdstittel className={sharedStyles.tittel}>
                {intl.formatMessage({ id: 'revurdering.tittel' })}
            </Innholdstittel>
            <div className={sharedStyles.mainContentContainer}>
                <Ingress>{intl.formatMessage({ id: 'periode.overskrift' })}</Ingress>
                <div className={styles.periodeContainer}>
                    <div className={styles.datoContainerWrapper}>
                        <div className={styles.datoContainer}>
                            <label htmlFor="fom">{intl.formatMessage({ id: 'datovelger.fom.legend' })}</label>
                            <DatePicker
                                id="fom"
                                selected={formik.values.fraOgMed}
                                onChange={(date) => {
                                    formik.setValues((v) => ({
                                        ...v,
                                        fraOgMed: Array.isArray(date) ? date[0] : date,
                                    }));
                                }}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                isClearable
                                selectsEnd
                                startDate={periode?.fraOgMed}
                                endDate={periode?.tilOgMed}
                                minDate={props.førsteUtbetalingISak}
                                maxDate={props.sisteUtbetalingISak}
                                autoComplete="off"
                            />
                            {formik.errors.fraOgMed && <Feilmelding>{formik.errors.fraOgMed}</Feilmelding>}
                        </div>
                        <div className={styles.datoContainer}>
                            <label htmlFor="tom">{intl.formatMessage({ id: 'datovelger.tom.legend' })}</label>
                            <DatePicker
                                id="tom"
                                selected={formik.values.tilOgMed}
                                onChange={(date) => {
                                    formik.setValues((v) => ({
                                        ...v,
                                        tilOgMed: Array.isArray(date)
                                            ? DateFns.lastDayOfMonth(date[0])
                                            : date !== null
                                            ? DateFns.lastDayOfMonth(date)
                                            : date,
                                    }));
                                }}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                isClearable
                                selectsEnd
                                startDate={formik.values.fraOgMed}
                                endDate={formik.values.tilOgMed}
                                minDate={formik.values.fraOgMed}
                                maxDate={props.sisteUtbetalingISak}
                                autoComplete="off"
                            />
                            {formik.errors.tilOgMed && <Feilmelding>{formik.errors.tilOgMed}</Feilmelding>}
                        </div>
                    </div>
                </div>
                <div className={sharedStyles.knappContainer}>
                    <Link className="knapp" to={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}>
                        {intl.formatMessage({ id: 'knapp.avslutt' })}
                    </Link>
                    <Hovedknapp>{intl.formatMessage({ id: 'knapp.neste' })}</Hovedknapp>
                </div>
                {/* TODO AI: Check error-meldinger */}
                {hasSubmitted && RemoteData.isFailure(opprettRevurderingStatus) && (
                    <AlertStripe type="feil">{opprettRevurderingStatus.error.body?.message}</AlertStripe>
                )}
            </div>
        </form>
    );
};

export default ValgAvPeriode;
