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

export enum Sats {
    Høy = 'Høy',
    Lav = 'Lav',
}
interface FormData {
    sats: Sats | undefined;
    fom: string | undefined;
    tom: string | undefined;
}
type Props = {
    sakId: string;
    behandlingId: string;
};
const Beregning = (props: Props) => {
    const dispatch = useAppDispatch();

    const { sakId, behandlingId } = props;

    const beregning: Beregning = {
        id: '1',
        opprettet: new Date().toISOString(),
        sats: Sats.Høy,
        fom: new Date().toISOString(),
        tom: new Date().toISOString(),
        månedsberegninger: [
            { id: '1', sats: Sats.Høy, beløp: 100, fom: new Date().toISOString(), tom: new Date().toISOString() },
            { id: '2', sats: Sats.Høy, beløp: 200, fom: new Date().toISOString(), tom: new Date().toISOString() },
            { id: '3', sats: Sats.Høy, beløp: 300, fom: new Date().toISOString(), tom: new Date().toISOString() },
        ],
    };

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
            dispatch(sakSlice.startBeregning({ sakId, behandlingId, sats, fom, tom }));
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

                <div>
                    <InfoLinje tittel={'id:'} value={beregning.id} />
                    <InfoLinje tittel={'opprettet:'} value={formatDateTime(beregning.opprettet, intl)} />
                    <InfoLinje tittel={'sats:'} value={beregning.sats} />
                    <InfoLinje tittel={'Start dato:'} value={intl.formatDate(beregning.fom)} />
                    <InfoLinje tittel={'Slutt dato:'} value={intl.formatDate(beregning.tom)} />
                    {beregning.månedsberegninger.map((beregning) => (
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
            </form>
        </div>
    );
};

export default Beregning;
