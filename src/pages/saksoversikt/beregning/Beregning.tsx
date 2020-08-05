import * as RemoteData from '@devexperts/remote-data-ts';
import { lastDayOfMonth } from 'date-fns';
import { useFormik, FormikErrors } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import { RadioPanelGruppe, Label, Feiloppsummering, Select, Input, SkjemaGruppe } from 'nav-frontend-skjema';
import { Innholdstittel, Feilmelding } from 'nav-frontend-typografi';
import React from 'react';
import DatePicker from 'react-datepicker';
import { IntlShape } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { Beregning, Fradragstype, Sats, Fradrag } from '~api/behandlingApi';
import { Sak } from '~api/sakApi';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/hooks';
import * as routes from '~lib/routes.ts';
import { trackEvent, startBeregning } from '~lib/tracking/trackingEvents';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import { SaksbehandlingMenyvalg } from '../types';

import messages from './beregning-nb';
import styles from './beregning.module.less';
import VisBeregning from './VisBeregning';

interface FradragFormData {
    type: Nullable<Fradragstype>;
    beløp: Nullable<number>;
    beskrivelse: Nullable<string>;
}

interface FormData {
    sats: Sats | undefined;
    fom: Date | null;
    tom: Date | null;
    fradrag: FradragFormData[];
}

type Props = {
    sak: Sak;
    behandlingId: string;
};

const fradragSchema = yup.object<FradragFormData>({
    beløp: yup.number().typeError('Beløp må være et tall').required(),
    beskrivelse: yup.string().defined().default(null),
    type: yup.string().defined().oneOf(Object.values(Fradragstype), 'Du må velge en fradragstype'),
});

const isValidFradrag = (f: FradragFormData): f is Fradrag => fradragSchema.isValidSync(f);

const fradragstypeResourceId = (f: Fradragstype): string => {
    switch (f) {
        case Fradragstype.Uføretrygd:
            return 'fradrag.type.uføre';
        case Fradragstype.Barnetillegg:
            return 'fradrag.type.barnetillegg';
        case Fradragstype.Arbeidsinntekt:
            return 'fradrag.type.arbeidsinntekt';
        case Fradragstype.Pensjon:
            return 'fradrag.type.pensjon';
        case Fradragstype.Kapitalinntekt:
            return 'fradrag.type.kapitalinntekt';
        case Fradragstype.AndreYtelser:
            return 'fradrag.type.andreytelser';
    }
};

const FradragInputs = (props: {
    fradrag: Array<FradragFormData>;
    feltnavn: string;
    errors: string | string[] | FormikErrors<FradragFormData>[] | undefined;
    intl: IntlShape;
    onChange: (e: React.ChangeEvent<unknown>) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
}) => {
    return (
        <div className={styles.fradragContainer}>
            {typeof props.errors === 'string' && props.errors}
            {props.fradrag.map((fradrag, index) => {
                const errorForLinje = Array.isArray(props.errors) ? props.errors[index] : null;
                const name = `${props.feltnavn}[${index}]`;
                const typeId = `${name}.type`;
                const belopId = `${name}.beløp`;
                const beskrivelseId = `${name}.beskrivelse`;

                return (
                    <Panel key={index} border className={styles.fradragItemContainer}>
                        <SkjemaGruppe legend={`Fradrag ${index + 1}`}>
                            <div className={styles.fradragTypeOgBelopContainer}>
                                <Select
                                    label={props.intl.formatMessage({ id: 'input.fradragstype.label' })}
                                    onChange={props.onChange}
                                    id={typeId}
                                    name={typeId}
                                    value={fradrag.type?.toString() ?? ''}
                                    feil={
                                        errorForLinje && typeof errorForLinje === 'object'
                                            ? errorForLinje.type
                                            : undefined
                                    }
                                    className={styles.fradragtype}
                                >
                                    <option value="">
                                        {props.intl.formatMessage({ id: 'input.fradragstype.emptyLabel' })}
                                    </option>
                                    {Object.values(Fradragstype).map((f) => (
                                        <option value={f} key={f}>
                                            {props.intl.formatMessage({ id: fradragstypeResourceId(f) })}
                                        </option>
                                    ))}
                                </Select>
                                <Input
                                    label={props.intl.formatMessage({ id: 'input.fradragsbeløp.label' })}
                                    id={belopId}
                                    name={belopId}
                                    onChange={props.onChange}
                                    inputMode="decimal"
                                    value={fradrag.beløp ?? ''}
                                    feil={
                                        errorForLinje && typeof errorForLinje === 'object'
                                            ? errorForLinje.beløp
                                            : undefined
                                    }
                                />
                            </div>
                            <Input
                                label={props.intl.formatMessage({ id: 'input.fradragsbeskrivelse.label' })}
                                id={beskrivelseId}
                                name={beskrivelseId}
                                onChange={props.onChange}
                                value={fradrag.beskrivelse ?? ''}
                                feil={
                                    errorForLinje && typeof errorForLinje === 'object'
                                        ? errorForLinje.beskrivelse
                                        : undefined
                                }
                            />
                            <Knapp onClick={() => props.onFjernClick(index)} htmlType="button">
                                {props.intl.formatMessage({ id: 'knapp.fradrag.fjern' })}
                            </Knapp>
                            {errorForLinje && typeof errorForLinje === 'string' && errorForLinje}
                        </SkjemaGruppe>
                    </Panel>
                );
            })}
            <div>
                <Knapp onClick={() => props.onLeggTilClick()} htmlType="button">
                    {props.intl.formatMessage({ id: 'knapp.fradrag.leggtil' })}
                </Knapp>
            </div>
        </div>
    );
};

const Beregning = (props: Props) => {
    const { sak, behandlingId } = props;
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
            sats: undefined,
            fom: null,
            tom: null,
            fradrag: [],
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
                    return fom < tom;
                }),
            fradrag: yup.array(fradragSchema.required()).defined(),
        }),
        validateOnChange: hasSubmitted,
    });
    const { errors } = formik;

    return (
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
                                onChange={(date) => formik.setValues({ ...formik.values, fom: date })}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                            />
                            {formik.errors.fom && <Feilmelding>{formik.errors.fom}</Feilmelding>}
                        </div>
                        <div className={styles.datovelger}>
                            <Label htmlFor="tom">{intl.formatMessage({ id: 'datovelger.tom.label' })}</Label>
                            <DatePicker
                                id="tom"
                                selected={formik.values.tom}
                                onChange={(date) => formik.setValues({ ...formik.values, tom: date })}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
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
                    <Hovedknapp
                        onClick={(e) => {
                            e.preventDefault();
                            if (RemoteData.isSuccess(beregningStatus)) {
                                history.push(
                                    routes.saksoversikt.createURL({
                                        sakId: sak.id,
                                        behandlingId: behandlingId,
                                        meny: SaksbehandlingMenyvalg.Vedtak,
                                    })
                                );
                            } else if (behandling.beregning) {
                                history.push(
                                    routes.saksoversikt.createURL({
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
                    {RemoteData.isFailure(beregningStatus) && (
                        <AlertStripe type="feil">{beregningStatus.error.message}</AlertStripe>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Beregning;
