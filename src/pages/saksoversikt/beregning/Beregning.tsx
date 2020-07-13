import React from 'react';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
import { Datovelger } from 'nav-datovelger';
import { useFormik } from 'formik';
import { Hovedknapp } from 'nav-frontend-knapper';
import yup from '~lib/validering';
import { startBeregning } from '~api/behandlingApi';

export enum Sats {
    Høy = 'Høy',
    Lav = 'Lav',
}
interface FormData {
    sats: Sats | undefined;
    startDato: string | undefined;
    slutDato: string | undefined;
}
type Props = {
    sakId: string;
    behandlingId: string;
};
const Beregning = (props: Props) => {
    const { sakId, behandlingId } = props;
    const formik = useFormik<FormData>({
        initialValues: {
            sats: undefined,
            startDato: undefined,
            slutDato: undefined,
        },
        onSubmit: (values) => {
            const { sats, startDato, slutDato } = values;
            if (!sats || !startDato || !slutDato) return;
            startBeregning(sakId, behandlingId, {
                sats,
                startDato,
                slutDato,
            });
        },
        validationSchema: yup.object<FormData>({
            sats: yup.string() as yup.Schema<Sats>,
            startDato: (yup.date() as unknown) as yup.Schema<string>,
            slutDato: (yup.date() as unknown) as yup.Schema<string>,
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
                        name: 'slutDato',
                        placeholder: 'dd.mm.åååå',
                    }}
                    valgtDato={formik.values.slutDato}
                    onChange={(value) => formik.setValues({ ...formik.values, slutDato: value })}
                />
                <Hovedknapp>Start beregning!</Hovedknapp>
            </form>
        </div>
    );
};

export default Beregning;
