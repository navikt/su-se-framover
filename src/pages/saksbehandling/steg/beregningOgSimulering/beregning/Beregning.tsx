import * as RemoteData from '@devexperts/remote-data-ts';
import { addMonths, lastDayOfMonth } from 'date-fns';
import { useFormik } from 'formik';
import { pipe } from 'fp-ts/lib/function';
import AlertStripe, { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import { Feiloppsummering } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Undertittel, Feilmelding } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useHistory } from 'react-router-dom';

import { erBeregnetAvslag } from '~features/behandling/behandlingUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { toDateOrNull } from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import {
    FradragFormData,
    isValidFradrag,
    fradragSchema,
    FradragInputs,
} from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/FradragInputs';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Fradragstype, FradragTilhører } from '~types/Fradrag';

import BeregningFaktablokk from '../../faktablokk/faktablokker/BeregningFaktablokk';
import sharedI18n from '../../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../../types';
import { Vurdering, Vurderingknapper } from '../../Vurdering';

import messages from './beregning-nb';
import styles from './beregning.module.less';
import { erIGyldigStatusForÅKunneBeregne } from './beregningUtils';
import VisBeregning from './VisBeregning';

interface FormData {
    fom: Nullable<Date>;
    tom: Nullable<Date>;
    fradrag: FradragFormData[];
}

const Beregning = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [needsBeregning, setNeedsBeregning] = useState(false);

    const { beregningStatus, simuleringStatus } = useAppSelector((state) => state.sak);
    const FradragUtenomForventetInntekt = (props.behandling.beregning?.fradrag ?? []).filter(
        (f) => f.type !== Fradragstype.ForventetInntekt
    );

    if (!erIGyldigStatusForÅKunneBeregne(props.behandling)) {
        return <div>Behandlingen er ikke ferdig.</div>;
    }

    const startBeregning = (values: FormData) => {
        if (!values.fom || !values.tom || !props.behandling.behandlingsinformasjon.utledetSats) {
            return;
        }

        const fradrag = values.fradrag.filter(isValidFradrag);
        if (fradrag.length !== values.fradrag.length) {
            return;
        }

        dispatch(
            sakSlice.startBeregning({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                sats: props.behandling.behandlingsinformasjon.utledetSats,
                fom: values.fom,
                tom: lastDayOfMonth(values.tom),
                fradrag: values.fradrag.map((f) => ({
                    //valdiering sikrer at feltet ikke er null
                    /* eslint-disable @typescript-eslint/no-non-null-assertion */
                    periode:
                        f.periode?.fraOgMed && f.periode.tilOgMed
                            ? { fraOgMed: f.periode.fraOgMed, tilOgMed: f.periode.tilOgMed }
                            : null,
                    beløp: parseInt(f.beløp!, 10),
                    type: f.type!,
                    utenlandskInntekt: f.fraUtland
                        ? {
                              beløpIUtenlandskValuta: parseInt(f.utenlandskInntekt.beløpIUtenlandskValuta),
                              valuta: f.utenlandskInntekt.valuta,
                              kurs: Number.parseFloat(f.utenlandskInntekt.kurs),
                          }
                        : null,
                    tilhører: f.tilhørerEPS ? FradragTilhører.EPS : FradragTilhører.Bruker,
                    /* eslint-enable @typescript-eslint/no-non-null-assertion */
                })),
            })
        );
    };

    const handleLagreOgFortsettSenere = (values: FormData) => {
        startBeregning(values);
        if (RemoteData.isSuccess(beregningStatus)) {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
        }
    };

    const handleSave = async (nesteUrl: string) => {
        if (
            RemoteData.isSuccess(beregningStatus) ||
            (props.behandling.beregning && RemoteData.isInitial(beregningStatus))
        ) {
            if (erBeregnetAvslag(props.behandling)) {
                history.push(nesteUrl);
                return;
            }

            const res = await dispatch(
                sakSlice.startSimulering({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                })
            );

            if (sakSlice.startSimulering.fulfilled.match(res)) {
                history.push(nesteUrl);
            }
        } else {
            setNeedsBeregning(true);
        }
    };

    const byttDato = (keyNavn: keyof Pick<FormData, 'fom' | 'tom'>, dato: Date | [Date, Date] | null) => {
        const maybeDate = Array.isArray(dato) ? dato[0] : dato;
        if (keyNavn === 'fom' && formik.values.tom == null && maybeDate != null) {
            formik.setValues({
                ...formik.values,
                ['fom']: maybeDate,
                ['tom']: addMonths(maybeDate, 11),
            });
        } else {
            formik.setValues({
                ...formik.values,
                [keyNavn]: maybeDate,
            });
        }
    };

    const formik = useFormik<FormData>({
        initialValues: {
            fom: toDateOrNull(props.behandling.beregning?.fraOgMed),
            tom: toDateOrNull(props.behandling.beregning?.tilOgMed),
            fradrag: FradragUtenomForventetInntekt.map((f) => ({
                periode: f.periode,
                fraUtland: f.utenlandskInntekt !== null,
                beløp: f.beløp.toString(),
                utenlandskInntekt: {
                    beløpIUtenlandskValuta: f.utenlandskInntekt?.beløpIUtenlandskValuta.toString() ?? '',
                    valuta: f.utenlandskInntekt?.valuta.toString() ?? '',
                    kurs: f.utenlandskInntekt?.kurs.toString() ?? '',
                },
                type: f.type,
                tilhørerEPS: f.tilhører === FradragTilhører.EPS,
            })),
        },
        onSubmit(values) {
            startBeregning(values);
        },
        validationSchema: yup.object<FormData>({
            fom: yup.date().nullable().required(),
            tom: yup
                .date()
                .nullable()
                .required()
                .test('isAfterFom', 'Sluttdato må være etter startdato', function (tom) {
                    const { fom } = this.parent;
                    if (!tom || !fom) {
                        return false;
                    }

                    return fom <= tom;
                }),
            fradrag: yup.array(fradragSchema.required()).defined(),
        }),
        validateOnChange: false,
    });
    const history = useHistory();

    return (
        <Vurdering tittel={intl.formatMessage({ id: 'page.tittel' })}>
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            formik.handleSubmit(e);
                        }}
                    >
                        <Undertittel>Periode</Undertittel>
                        <div className={styles.container}>
                            <div className={styles.datoContainer}>
                                <label htmlFor="fom">{intl.formatMessage({ id: 'datovelger.fom.legend' })}</label>
                                <DatePicker
                                    id="fom"
                                    selected={formik.values.fom}
                                    onChange={(dato) => byttDato('fom', dato)}
                                    dateFormat="MM/yyyy"
                                    showMonthYearPicker
                                    isClearable
                                    selectsEnd
                                    startDate={formik.values.fom}
                                    endDate={formik.values.tom}
                                    minDate={new Date(2021, 0)}
                                    autoComplete="off"
                                />
                                {formik.errors.fom && <Feilmelding>{formik.errors.fom}</Feilmelding>}
                            </div>
                            <div className={styles.datoContainer}>
                                <label htmlFor="tom">{intl.formatMessage({ id: 'datovelger.tom.legend' })}</label>
                                <DatePicker
                                    id="tom"
                                    selected={formik.values.tom}
                                    onChange={(dato) => byttDato('tom', dato)}
                                    dateFormat="MM/yyyy"
                                    showMonthYearPicker
                                    isClearable
                                    selectsEnd
                                    startDate={formik.values.fom}
                                    endDate={formik.values.tom}
                                    minDate={new Date(2021, 0)}
                                    autoComplete="off"
                                />
                                {formik.errors.tom && <Feilmelding>{formik.errors.tom}</Feilmelding>}
                            </div>
                        </div>

                        <Undertittel>Fradrag</Undertittel>
                        <div className={styles.container}>
                            <FradragInputs
                                harEps={props.behandling.behandlingsinformasjon.ektefelle !== null}
                                feltnavn="fradrag"
                                fradrag={formik.values.fradrag}
                                errors={formik.errors.fradrag}
                                intl={intl}
                                onChange={formik.handleChange}
                                onFradragChange={(index, value) => {
                                    formik.setFieldValue(`fradrag[${index}]`, value);
                                }}
                                onFjernClick={(index) => {
                                    formik.setValues((v) => ({
                                        ...v,
                                        fradrag: formik.values.fradrag.filter((_, idx) => idx !== index),
                                    }));
                                }}
                                beregningsDato={
                                    formik.values.fom &&
                                    formik.values.tom && {
                                        fom: formik.values.fom,
                                        tom: formik.values.tom,
                                    }
                                }
                                onLeggTilClick={() => {
                                    formik.setValues({
                                        ...formik.values,
                                        fradrag: [
                                            ...formik.values.fradrag,
                                            {
                                                periode: null,
                                                beløp: null,
                                                type: null,
                                                fraUtland: false,
                                                utenlandskInntekt: {
                                                    beløpIUtenlandskValuta: '',
                                                    valuta: '',
                                                    kurs: '',
                                                },
                                                tilhørerEPS: false,
                                            },
                                        ],
                                    });
                                }}
                            />
                        </div>
                        <Undertittel>
                            Beregning{' '}
                            {props.behandling.beregning
                                ? `${intl.formatDate(props.behandling.beregning.fraOgMed)}-
                            ${intl.formatDate(props.behandling.beregning.tilOgMed)}`
                                : ''}
                        </Undertittel>
                        <div className={styles.beregningsContainer}>
                            {props.behandling.beregning && (
                                <VisBeregning
                                    beregning={props.behandling.beregning}
                                    forventetinntekt={
                                        props.behandling.behandlingsinformasjon.uførhet?.forventetInntekt ?? 0
                                    }
                                />
                            )}
                            {formik.errors && (
                                <Feiloppsummering
                                    feil={formikErrorsTilFeiloppsummering(formik.errors)}
                                    tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                                    hidden={!formikErrorsHarFeil(formik.errors)}
                                />
                            )}
                            <Knapp htmlType="submit" spinner={RemoteData.isPending(beregningStatus)} mini>
                                {props.behandling.beregning
                                    ? intl.formatMessage({ id: 'knapp.startNyBeregning' })
                                    : intl.formatMessage({ id: 'knapp.startBeregning' })}
                            </Knapp>
                        </div>

                        {RemoteData.isFailure(beregningStatus) && (
                            <AlertStripeFeil>
                                <p>{intl.formatMessage({ id: 'alert.feil.beregningFeilet' })}</p>
                                <p>{beregningStatus.error.body?.message || ''}</p>
                            </AlertStripeFeil>
                        )}
                        {needsBeregning && !props.behandling.beregning && (
                            <AlertStripe type="advarsel">
                                {intl.formatMessage({ id: 'alert.advarsel.kjørBeregningFørst' })}
                            </AlertStripe>
                        )}
                        {pipe(
                            simuleringStatus,
                            RemoteData.fold(
                                () => null,
                                () => (
                                    <NavFrontendSpinner>
                                        {intl.formatMessage({ id: 'display.simulerer' })}
                                    </NavFrontendSpinner>
                                ),
                                () => (
                                    <AlertStripe type="feil">
                                        {intl.formatMessage({ id: 'alert.feil.simuleringFeilet' })}
                                    </AlertStripe>
                                ),
                                () => null
                            )
                        )}
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onNesteClick={() => {
                                handleSave(props.nesteUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                formik.validateForm().then((res) => {
                                    if (Object.keys(res).length === 0) {
                                        handleLagreOgFortsettSenere(formik.values);
                                    }
                                });
                            }}
                        />
                    </form>
                ),
                right: <BeregningFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </Vurdering>
    );
};

export default Beregning;
