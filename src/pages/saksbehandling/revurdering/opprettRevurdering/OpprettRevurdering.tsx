import * as RemoteData from '@devexperts/remote-data-ts';
import * as DateFns from 'date-fns';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Ingress, Innholdstittel, Feilmelding } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useHistory, Link } from 'react-router-dom';

import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Periode } from '~types/Fradrag';
import { Sak } from '~types/Sak';

import { RevurderingSteg } from '../../types';
import messages from '../revurdering-nb';
import sharedStyles from '../revurdering.module.less';
import styles from '../valgAvPeriode/valgAvPeriode.module.less'; //TODO

interface OpprettRevurderingFormData {
    fraOgMed: Nullable<Date>;
    tilOgMed: Nullable<Date>;
}

const schema = yup.object<OpprettRevurderingFormData>({
    fraOgMed: yup.date().nullable().required(),
    tilOgMed: yup.date().nullable().required(),
});

const opprettRevurdering = (props: { sak: Sak }) => {
    const history = useHistory();

    const dispatch = useAppDispatch();

    const intl = useI18n({ messages });
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const opprettRevurderingStatus = useAppSelector((state) => state.sak.opprettRevurderingStatus);

    const opprettRevurdering = async (periode: Periode) => {
        const response = await dispatch(
            sakSlice.opprettRevurdering({
                sakId: props.sak.id,
                periode: periode,
            })
        );

        if (sakSlice.opprettRevurdering.fulfilled.match(response)) {
            history.push(
                Routes.revurderValgtRevurdering.createURL({
                    sakId: props.sak.id,
                    steg: RevurderingSteg.EndringAvFradrag,
                    revurderingId: response.payload.id,
                })
            );
        }
    };

    const formik = useFormik<OpprettRevurderingFormData>({
        initialValues: {
            fraOgMed: null,
            tilOgMed: null,
        },
        async onSubmit({ fraOgMed, tilOgMed }) {
            if (fraOgMed && tilOgMed) {
                opprettRevurdering({ fraOgMed, tilOgMed });
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
                                minDate={new Date(props.sak.utbetalinger[0].fraOgMed)}
                                maxDate={new Date(props.sak.utbetalinger[props.sak.utbetalinger.length - 1].tilOgMed)}
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
                                maxDate={new Date(props.sak.utbetalinger[props.sak.utbetalinger.length - 1].tilOgMed)}
                                autoComplete="off"
                            />
                            {formik.errors.tilOgMed && <Feilmelding>{formik.errors.tilOgMed}</Feilmelding>}
                        </div>
                    </div>
                </div>
                {hasSubmitted && RemoteData.isFailure(opprettRevurderingStatus) && (
                    <AlertStripe type="feil" className={sharedStyles.alertstripe}>
                        {opprettRevurderingStatus.error.body?.message}
                    </AlertStripe>
                )}
                <div className={sharedStyles.knappContainer}>
                    <Link className="knapp" to={Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })}>
                        {intl.formatMessage({ id: 'knapp.avslutt' })}
                    </Link>
                    <Hovedknapp spinner={RemoteData.isPending(opprettRevurderingStatus)}>
                        {intl.formatMessage({ id: 'knapp.neste' })}
                    </Hovedknapp>
                </div>
            </div>
        </form>
    );
};

export default opprettRevurdering;
