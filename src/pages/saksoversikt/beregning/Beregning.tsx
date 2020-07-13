import React from 'react';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
import { Datovelger } from 'nav-datovelger';
import { useFormik } from 'formik';
import { Hovedknapp } from 'nav-frontend-knapper';
import yup from '~lib/validering';
import { startBeregning, Beregning } from '~api/behandlingApi';
import Styles from './beregning.module.less';
import { useI18n } from '~lib/hooks';
import { formatDateTime } from '~lib/dateUtils';

export enum Sats {
    Høy = 'Høy',
    Lav = 'Lav',
}
interface FormData {
    sats: Sats | undefined;
    startDato: string | undefined;
    sluttDato: string | undefined;
}
type Props = {
    sakId: string;
    behandlingId: string;
};
const Beregning = (props: Props) => {
    const { sakId, behandlingId } = props;

    const beregning: Beregning = {
        id: '1',
        opprettet: new Date().toISOString(),
        sats: Sats.Høy,
        startDato: new Date().toISOString(),
        sluttDato: new Date().toISOString(),
        månedsberegninger: [
            { id: '1', beløp: 100, fom: new Date().toISOString(), tom: new Date().toISOString() },
            { id: '2', beløp: 200, fom: new Date().toISOString(), tom: new Date().toISOString() },
            { id: '3', beløp: 300, fom: new Date().toISOString(), tom: new Date().toISOString() },
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
            startDato: undefined,
            sluttDato: undefined,
        },
        onSubmit: (values) => {
            const { sats, startDato, sluttDato: sluttDato } = values;
            if (!sats || !startDato || !sluttDato) return;
            startBeregning(sakId, behandlingId, {
                sats,
                startDato,
                sluttDato,
            });
        },
        validationSchema: yup.object<FormData>({
            sats: yup.string() as yup.Schema<Sats>,
            startDato: (yup.date() as unknown) as yup.Schema<string>,
            sluttDato: (yup.date() as unknown) as yup.Schema<string>,
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
                        name: 'startDato',
                        placeholder: 'dd.mm.åååå',
                    }}
                    valgtDato={formik.values.startDato}
                    onChange={(value) => formik.setValues({ ...formik.values, startDato: value })}
                />
                <Datovelger
                    input={{
                        name: 'sluttDato',
                        placeholder: 'dd.mm.åååå',
                    }}
                    valgtDato={formik.values.sluttDato}
                    onChange={(value) => formik.setValues({ ...formik.values, sluttDato: value })}
                />
                <Hovedknapp>Start beregning!</Hovedknapp>

                <div>
                    <InfoLinje tittel={'id:'} value={beregning.id} />
                    <InfoLinje tittel={'opprettet:'} value={formatDateTime(beregning.opprettet, intl)} />
                    <InfoLinje tittel={'sats:'} value={beregning.sats} />
                    <InfoLinje tittel={'Start dato:'} value={intl.formatDate(beregning.startDato)} />
                    <InfoLinje tittel={'Slutt dato:'} value={intl.formatDate(beregning.sluttDato)} />
                    {beregning.månedsberegninger.map((beregning) => (
                        <div key={beregning.id}>
                            <InfoLinje tittel={'id: '} value={beregning.id} />
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
