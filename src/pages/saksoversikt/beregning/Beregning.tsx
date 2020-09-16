import * as RemoteData from '@devexperts/remote-data-ts';
import { lastDayOfMonth } from 'date-fns';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { RadioPanelGruppe, Label, Feiloppsummering } from 'nav-frontend-skjema';
import { Innholdstittel, Feilmelding } from 'nav-frontend-typografi';
import React from 'react';
import DatePicker from 'react-datepicker';
import { Link, useHistory } from 'react-router-dom';

import messages from '~/features/beregning/beregning-nb';
import { FradragFormData, isValidFradrag, fradragSchema, FradragInputs } from '~features/beregning';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { toDateOrNull } from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes.ts';
import { trackEvent, startBeregning } from '~lib/tracking/trackingEvents';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Sak } from '~types/Sak';
import { Sats } from '~types/Sats';

import { SaksbehandlingMenyvalg } from '../types';

import styles from './beregning.module.less';
import VisBeregning from './VisBeregning';

interface FormData {
    sats: Sats | undefined;
    fom: Date | null;
    tom: Date | null;
    fradrag: FradragFormData[];
}

type Props = {
    sak: Sak;
};

const Beregning = (props: Props) => {
    const { sak } = props;
    const { behandlingId } = Routes.useRouteParams<typeof Routes.saksoversiktValgtBehandling>();

    const beregningStatus = useAppSelector((s) => s.sak.beregningStatus);

    const history = useHistory();
    const dispatch = useAppDispatch();
    const intl = useI18n({ messages });
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const behandling = sak.behandlinger.find((behandling) => behandling.id === behandlingId);
    if (!behandling) {
        return <AlertStripe type="feil"> en feil skjedde</AlertStripe>;
    }

    const formik = useFormik<FormData>({
        initialValues: {
            sats: behandling.beregning?.sats ?? undefined,
            fom: toDateOrNull(behandling.beregning?.fom) ?? null,
            tom: toDateOrNull(behandling.beregning?.tom) ?? null,
            fradrag: behandling.beregning?.fradrag ?? [],
        },
        onSubmit: (values) => {
            const { sats, fom, tom } = values;

            const fradrag = values.fradrag.filter(isValidFradrag);

            if (!sats || !fom || !tom || values.fradrag.length !== fradrag.length) {
                return;
            }

            trackEvent(
                startBeregning({
                    sakId: sak.id,
                    behandlingId,
                })
            );
            dispatch(
                sakSlice.startBeregning({
                    sakId: sak.id,
                    behandlingId,
                    sats,
                    fom,
                    tom: lastDayOfMonth(tom),
                    fradrag,
                })
            );
        },
        validationSchema: yup.object<FormData>({
            sats: yup.string().required() as yup.Schema<Sats>,
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
        validateOnChange: hasSubmitted,
    });
    const { errors } = formik;

    return (
        <div className={styles.container}>
            <div className={styles.beregningContainer}>
                {behandling.beregning && (
                    <div className={styles.visBeregning}>
                        <VisBeregning beregning={behandling.beregning} />
                    </div>
                )}

                <div>
                    <Innholdstittel className={styles.tittel}>Start ny beregning:</Innholdstittel>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            formik.handleSubmit();
                            setHasSubmitted(true);
                        }}
                    >
                        <div id="sats">
                            <RadioPanelGruppe
                                className={styles.sats}
                                name={intl.formatMessage({ id: 'input.sats.label' })}
                                legend={intl.formatMessage({ id: 'input.sats.label' })}
                                radios={[
                                    { label: intl.formatMessage({ id: 'input.sats.value.høy' }), value: Sats.Høy },
                                    { label: intl.formatMessage({ id: 'input.sats.value.lav' }), value: Sats.Lav },
                                ]}
                                checked={formik.values.sats}
                                onChange={(_, value) => formik.setValues({ ...formik.values, sats: value })}
                                feil={errors.sats}
                            />
                        </div>

                        <div className={styles.datovelgerContainer}>
                            <div className={styles.datovelger}>
                                <Label htmlFor="fom">{intl.formatMessage({ id: 'datovelger.fom.label' })}</Label>
                                <DatePicker
                                    id="fom"
                                    selected={formik.values.fom}
                                    onChange={(date) =>
                                        formik.setValues({
                                            ...formik.values,
                                            fom: Array.isArray(date) ? date[0] : date,
                                        })
                                    }
                                    dateFormat="MM/yyyy"
                                    showMonthYearPicker
                                    isClearable
                                    selectsStart
                                    startDate={formik.values.fom}
                                    endDate={formik.values.tom}
                                />
                                {formik.errors.fom && <Feilmelding>{formik.errors.fom}</Feilmelding>}
                            </div>
                            <div className={styles.datovelger}>
                                <Label htmlFor="tom">{intl.formatMessage({ id: 'datovelger.tom.label' })}</Label>
                                <DatePicker
                                    id="tom"
                                    selected={formik.values.tom}
                                    onChange={(date) =>
                                        formik.setValues({
                                            ...formik.values,
                                            tom: Array.isArray(date) ? date[0] : date,
                                        })
                                    }
                                    dateFormat="MM/yyyy"
                                    showMonthYearPicker
                                    isClearable
                                    selectsEnd
                                    startDate={formik.values.fom}
                                    endDate={formik.values.tom}
                                    minDate={formik.values.fom}
                                />
                                {formik.errors.tom && <Feilmelding>{formik.errors.tom}</Feilmelding>}
                            </div>
                        </div>
                        <FradragInputs
                            feltnavn="fradrag"
                            fradrag={formik.values.fradrag}
                            errors={formik.errors.fradrag}
                            intl={intl}
                            onChange={formik.handleChange}
                            onFjernClick={(index) => {
                                formik.setValues({
                                    ...formik.values,
                                    fradrag: formik.values.fradrag.filter((_, idx) => idx !== index),
                                });
                            }}
                            onLeggTilClick={() => {
                                formik.setValues({
                                    ...formik.values,
                                    fradrag: [...formik.values.fradrag, { beløp: null, beskrivelse: null, type: null }],
                                });
                            }}
                        />
                        <Feiloppsummering
                            className={styles.feiloppsummering}
                            tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                            feil={formikErrorsTilFeiloppsummering(formik.errors)}
                            hidden={!formikErrorsHarFeil(formik.errors)}
                        />
                        <Knapp className={styles.startBeregningKnapp} spinner={RemoteData.isPending(beregningStatus)}>
                            {intl.formatMessage({ id: 'knapp.startBeregning' })}
                        </Knapp>
                        {RemoteData.isFailure(beregningStatus) && (
                            <AlertStripe type="feil">{beregningStatus.error.message}</AlertStripe>
                        )}
                    </form>
                </div>
            </div>
            <div className={styles.navigeringContainer}>
                <Link
                    to={Routes.saksbehandlingVilkårsvurdering.createURL({
                        sakId: sak.id,
                        behandlingId: behandlingId,
                    })}
                    className="knapp"
                >
                    Tilbake
                </Link>
                <Hovedknapp
                    onClick={(e) => {
                        e.preventDefault();
                        if (
                            RemoteData.isSuccess(beregningStatus) ||
                            (behandling.beregning && RemoteData.isInitial(beregningStatus))
                        ) {
                            dispatch(
                                sakSlice.startSimulering({
                                    sakId: sak.id,
                                    behandlingId,
                                })
                            );
                            history.push(
                                Routes.saksoversiktValgtBehandling.createURL({
                                    sakId: sak.id,
                                    behandlingId: behandlingId,
                                    meny: SaksbehandlingMenyvalg.Vedtak,
                                })
                            );
                        }
                    }}
                >
                    {intl.formatMessage({ id: 'knapp.neste' })}
                </Hovedknapp>
            </div>
        </div>
    );
};

export default Beregning;
