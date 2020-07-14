import React from 'react';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
import { Datovelger } from 'nav-datovelger';
import { useFormik } from 'formik';
import { Hovedknapp } from 'nav-frontend-knapper';
import yup from '~lib/validering';
import { Beregning } from '~api/behandlingApi';
import Styles from './beregning.module.less';
import { useI18n } from '~lib/hooks';
import { formatDateTime } from '~lib/dateUtils';
import { useAppDispatch } from '~redux/Store';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { Sak } from '~api/sakApi';
import AlertStripe from 'nav-frontend-alertstriper';

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
    const dispatch = useAppDispatch();
    const behandling = sak.behandlinger.find((behandling) => behandling.id === behandlingId);
    if (!behandling) {
        return <AlertStripe type="feil"> en feil skjedde</AlertStripe>;
    }

    const InfoLinje = (props: { tittel: string; value: string | number }) => (
        <div className={Styles.infolinje}>
            <span>{props.tittel}</span>
            <span>{props.value}</span>
        </div>
    );

    const intl = useI18n({ messages: {} });

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
            sats: yup.string() as yup.Schema<Sats>,
            fom: (yup.date() as unknown) as yup.Schema<string>,
            tom: (yup.date() as unknown) as yup.Schema<string>,
        }),
    });

    return (
        <div>
            <form onSubmit={formik.handleSubmit}>
                <RadioPanelGruppe
                    name="sats"
                    legend="sats"
                    radios={[
                        { label: 'høy', value: Sats.Høy },
                        { label: 'lav', value: Sats.Lav },
                    ]}
                    checked={formik.values.sats}
                    onChange={(_, value) => formik.setValues({ ...formik.values, sats: value })}
                />
                <Datovelger
                    input={{
                        name: 'fom',
                        placeholder: 'dd.mm.åååå',
                    }}
                    valgtDato={formik.values.fom}
                    onChange={(value) => formik.setValues({ ...formik.values, fom: value })}
                />
                <Datovelger
                    input={{
                        name: 'tom',
                        placeholder: 'dd.mm.åååå',
                    }}
                    valgtDato={formik.values.tom}
                    onChange={(value) => formik.setValues({ ...formik.values, tom: value })}
                />
                <Hovedknapp>Start beregning!</Hovedknapp>

                {behandling.beregning && (
                    <div>
                        <InfoLinje tittel={'id:'} value={behandling.beregning.id} />
                        <InfoLinje tittel={'opprettet:'} value={formatDateTime(behandling.beregning.opprettet, intl)} />
                        <InfoLinje tittel={'sats:'} value={behandling.beregning.sats} />
                        <InfoLinje tittel={'Start dato:'} value={intl.formatDate(behandling.beregning.fom)} />
                        <InfoLinje tittel={'Slutt dato:'} value={intl.formatDate(behandling.beregning.tom)} />
                        {behandling.beregning.månedsberegninger.map((beregning) => (
                            <div key={beregning.id}>
                                <InfoLinje tittel={'id: '} value={beregning.id} />
                                <InfoLinje tittel={'sats: '} value={beregning.sats} />
                                <InfoLinje
                                    tittel={`${intl.formatDate(beregning.fom)} - ${intl.formatDate(beregning.tom)}`}
                                    value={beregning.beløp}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </form>
        </div>
    );
};

export default Beregning;
