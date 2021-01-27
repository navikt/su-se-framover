import * as DateFns from 'date-fns';
import { useFormik } from 'formik';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Feilmelding, Ingress, Innholdstittel } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Link, useHistory } from 'react-router-dom';

import * as revurderingSlice from '~features/revurdering/revurdering.slice';
import * as DateUtils from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { RevurderingSteg } from '~pages/saksbehandling/types';
import { useAppDispatch } from '~redux/Store';
import { Behandling, Behandlingsstatus } from '~types/Behandling';
import { OpprettetRevurdering } from '~types/Revurdering';
import { Sak } from '~types/Sak';

import messages from '../revurdering-nb';
import sharedStyles from '../revurdering.module.less';

import styles from './valgAvPeriode.module.less';

interface ValgAvPeriodeFormData {
    fom: Nullable<Date>;
    tom: Nullable<Date>;
}

const schema = yup.object<ValgAvPeriodeFormData>({
    fom: yup.date().nullable().required(),
    tom: yup.date().nullable().required(),
});

const ValgAvPeriode = (props: {
    //TODO: fjern sak
    sak: Sak;
    sakId: string;
    innvilgedeBehandlinger: Behandling[];
    leggTilVerdi: (asd: OpprettetRevurdering) => void;
    førsteUtbetalingISak: Date;
    sisteUtbetalingISak: Date;
    periode: { fraOgMed: Nullable<Date>; TilOgMed: Nullable<Date> };
    byttDato: (fom: Date | [Date, Date] | null, tom: Date | [Date, Date] | null) => void;
}) => {
    const intl = useI18n({ messages });
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const history = useHistory();
    const dispatch = useAppDispatch();

    const formik = useFormik<ValgAvPeriodeFormData>({
        initialValues: {
            fom: props.periode.fraOgMed,
            tom: props.periode.TilOgMed,
        },
        async onSubmit(values) {
            if (!values.fom || !values.tom) {
                return;
            }
            if (
                erPeriodeInnenforEnStønadsperiode(values.fom, values.tom) &&
                erPeriodenFremoverITid({ fom: values.fom, tom: values.tom })
            ) {
                props.byttDato(values.fom, values.tom);
                const response = await dispatch(
                    revurderingSlice.opprettRevurdering({
                        sakId: props.sakId,
                        periode: {
                            fom: values.fom,
                            tom: values.tom,
                        },
                    })
                );

                if (revurderingSlice.opprettRevurdering.fulfilled.match(response)) {
                    props.leggTilVerdi(response.payload);

                    history.push(
                        Routes.revurderValgtSak.createURL({
                            sakId: props.sakId,
                            steg: RevurderingSteg.EndringAvFradrag,
                        })
                    );
                }
            }
            return;
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const erPeriodenFremoverITid = (periode: { fom: Nullable<Date>; tom: Nullable<Date> }) => {
        if (!periode.fom || !periode.tom) return false;
        if (DateFns.isBefore(periode.fom, DateFns.lastDayOfMonth(new Date()))) return false;
        if (DateFns.isBefore(periode.tom, periode.fom)) return false;
        return true;
    };

    const erPeriodeInnenforEnStønadsperiode = (fom: Nullable<Date>, tom: Nullable<Date>) => {
        if (!fom || !tom) {
            return false;
        }
        const antallBehandlingerInnenforPeriode = props.innvilgedeBehandlinger.filter((b) => {
            /* eslint-disable @typescript-eslint/no-non-null-assertion */
            //Innvilgede behandlinger har alltid en beregning
            return (
                (DateFns.isBefore(DateFns.parseISO(b.beregning!.fraOgMed), fom) ||
                    DateFns.isEqual(DateFns.parseISO(b.beregning!.fraOgMed), fom)) &&
                (DateFns.isAfter(DateFns.parseISO(b.beregning!.tilOgMed), tom) ||
                    DateFns.isEqual(DateFns.parseISO(b.beregning!.tilOgMed), tom))
            );
            /* eslint-enable @typescript-eslint/no-non-null-assertion */
        });
        return antallBehandlingerInnenforPeriode.length === 1;
    };

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
                                selected={formik.values.fom}
                                onChange={(date) => {
                                    formik.setValues((v) => ({
                                        ...v,
                                        fom: Array.isArray(date) ? date[0] : date,
                                    }));
                                }}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                isClearable
                                selectsEnd
                                startDate={formik.values.fom}
                                endDate={formik.values.tom}
                                minDate={props.førsteUtbetalingISak}
                                maxDate={props.sisteUtbetalingISak}
                                autoComplete="off"
                            />
                            {formik.errors.fom && <Feilmelding>{formik.errors.fom}</Feilmelding>}
                        </div>
                        <div className={styles.datoContainer}>
                            <label htmlFor="tom">{intl.formatMessage({ id: 'datovelger.tom.legend' })}</label>
                            <DatePicker
                                id="tom"
                                selected={formik.values.tom}
                                onChange={(date) => {
                                    formik.setValues((v) => ({
                                        ...v,
                                        tom: Array.isArray(date)
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
                                startDate={formik.values.fom}
                                endDate={formik.values.tom}
                                minDate={formik.values.fom}
                                maxDate={props.sisteUtbetalingISak}
                                autoComplete="off"
                            />
                            {formik.errors.tom && <Feilmelding>{formik.errors.tom}</Feilmelding>}
                        </div>
                    </div>
                    {hasSubmitted && !erPeriodeInnenforEnStønadsperiode(formik.values.fom, formik.values.tom) && (
                        <Feilmelding>
                            {intl.formatMessage({ id: 'periode.feilmelding.erInnenforFlerePerioder' })}
                        </Feilmelding>
                    )}
                    {hasSubmitted && !erPeriodenFremoverITid({ fom: formik.values.fom, tom: formik.values.tom }) && (
                        <Feilmelding>
                            {intl.formatMessage({ id: 'periode.feilmelding.erIkkeFremoverITid' })}
                        </Feilmelding>
                    )}
                </div>
                <div className={sharedStyles.knappContainer}>
                    <Link className="knapp" to={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}>
                        {intl.formatMessage({ id: 'knapp.avslutt' })}
                    </Link>
                    <Hovedknapp>{intl.formatMessage({ id: 'knapp.neste' })}</Hovedknapp>
                </div>
                {props.sak.behandlinger
                    .filter((b) => {
                        return b.status === Behandlingsstatus.IVERKSATT_INNVILGET;
                    })
                    .map((b) => (
                        <p key={b.id}>
                            {DateUtils.formatMonthYear(b.beregning?.fraOgMed ?? '', intl)} -{' '}
                            {DateUtils.formatMonthYear(b.beregning?.tilOgMed ?? '', intl)}
                        </p>
                    ))}
            </div>
        </form>
    );
};

export default ValgAvPeriode;
