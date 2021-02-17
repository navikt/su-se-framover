import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Ingress, Innholdstittel, Feilmelding } from 'nav-frontend-typografi';
import React, { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import { useHistory, Link } from 'react-router-dom';

import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { finnSisteUtbetalingsdato } from '~pages/saksbehandling/sakintro/Utbetalinger';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Sak } from '~types/Sak';

import { RevurderingSteg } from '../../types';
import messages from '../revurdering-nb';
import sharedStyles from '../revurdering.module.less';
import styles from '../valgAvPeriode/valgAvPeriode.module.less'; //TODO

interface OpprettRevurderingFormData {
    fraOgMed: Nullable<Date>;
}

const schema = yup.object<OpprettRevurderingFormData>({
    fraOgMed: yup.date().nullable().required(),
});

const opprettRevurdering = (props: { sak: Sak }) => {
    const history = useHistory();

    const dispatch = useAppDispatch();

    const intl = useI18n({ messages });
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const opprettRevurderingStatus = useAppSelector((state) => state.sak.opprettRevurderingStatus);

    const opprettRevurdering = async (fraOgMed: Date) => {
        const response = await dispatch(
            sakSlice.opprettRevurdering({
                sakId: props.sak.id,
                fraOgMed,
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
        },
        async onSubmit({ fraOgMed }) {
            if (fraOgMed) {
                opprettRevurdering(fraOgMed);
            }
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const periode = formik.values.fraOgMed ? { fraOgMed: formik.values.fraOgMed } : null;

    const sisteUtbetalingsDato = useMemo<Date>(() => finnSisteUtbetalingsdato(props.sak.utbetalinger), [
        props.sak.utbetalinger,
    ]);

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
                                minDate={new Date(props.sak.utbetalinger[0].fraOgMed)}
                                maxDate={sisteUtbetalingsDato}
                                autoComplete="off"
                            />
                            {formik.errors.fraOgMed && <Feilmelding>{formik.errors.fraOgMed}</Feilmelding>}
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
