import React from 'react';
import { RadioPanelGruppe, Label, Feiloppsummering } from 'nav-frontend-skjema';
import { Datovelger } from 'nav-datovelger';
import { useFormik } from 'formik';
import { Hovedknapp } from 'nav-frontend-knapper';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { Beregning } from '~api/behandlingApi';
import styles from './beregning.module.less';
import { useI18n } from '~lib/hooks';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { Sak } from '~api/sakApi';
import AlertStripe from 'nav-frontend-alertstriper';
import messages from './beregning-nb';
import VisBeregning from './VisBeregning';
import { Innholdstittel } from 'nav-frontend-typografi';
import * as RemoteData from '@devexperts/remote-data-ts';

export enum Sats {
    Høy = 'HØY',
    Lav = 'LAV',
}

interface FormData {
    sats: Sats | undefined;
    fom: string | undefined;
    tom: string | undefined;
}

type Props = {
    sak: Sak;
    behandlingId: string;
};

const Beregning = (props: Props) => {
    const { sak, behandlingId } = props;
    const beregningStatus = useAppSelector((s) => s.sak.beregningStatus);

    const dispatch = useAppDispatch();
    const intl = useI18n({ messages });
    const behandling = sak.behandlinger.find((behandling) => behandling.id === behandlingId);
    if (!behandling) {
        return <AlertStripe type="feil"> en feil skjedde</AlertStripe>;
    }

    const formik = useFormik<FormData>({
        initialValues: {
            sats: undefined,
            fom: undefined,
            tom: undefined,
        },
        onSubmit: (values) => {
            const { sats, fom, tom } = values;
            if (!sats || !fom || !tom) return;
            dispatch(sakSlice.startBeregning({ sakId: sak.id, behandlingId, sats, fom, tom }));
        },
        validationSchema: yup.object<FormData>({
            sats: yup.string().required() as yup.Schema<Sats>,
            fom: (yup.date().required() as unknown) as yup.Schema<string>,
            tom: (yup.date().required() as unknown) as yup.Schema<string>,
        }),
    });
    const { errors } = formik;

    return (
        <div className={styles.beregningContainer}>
            {behandling.beregning && <VisBeregning beregning={behandling.beregning} />}

            <div>
                <Innholdstittel>Start ny beregning:</Innholdstittel>
                <form onSubmit={formik.handleSubmit}>
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

                    <div className={styles.datovelgerContainer}>
                        <div className={styles.datovelger}>
                            <Label htmlFor="beregningInputFom">
                                {intl.formatMessage({ id: 'datovelger.fom.label' })}
                            </Label>
                            <Datovelger
                                input={{
                                    id: 'beregningInputFom',
                                    name: 'fom',
                                    placeholder: 'dd.mm.åååå',
                                }}
                                valgtDato={formik.values.fom}
                                datoErGyldig={!errors.fom}
                                onChange={(value) => formik.setValues({ ...formik.values, fom: value })}
                            />
                        </div>
                        <div className={styles.datovelger}>
                            <Label htmlFor="beregningInputTom">
                                {intl.formatMessage({ id: 'datovelger.tom.label' })}
                            </Label>
                            <Datovelger
                                input={{
                                    id: 'beregningInputTom',
                                    name: 'tom',
                                    placeholder: 'dd.mm.åååå',
                                }}
                                valgtDato={formik.values.tom}
                                datoErGyldig={!errors.tom}
                                onChange={(value) => formik.setValues({ ...formik.values, tom: value })}
                            />
                        </div>
                    </div>
                    <Feiloppsummering
                        className={styles.marginBottom}
                        tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                        feil={formikErrorsTilFeiloppsummering(formik.errors)}
                        hidden={!formikErrorsHarFeil(formik.errors)}
                    />
                    <Hovedknapp spinner={RemoteData.isPending(beregningStatus)}>
                        {intl.formatMessage({ id: 'knapp.startBeregning' })}
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
