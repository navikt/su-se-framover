import { Button, Heading, TextField } from '@navikt/ds-react';
import { useFormik } from 'formik';
import React from 'react';

import * as reguleringApi from '~src/api/reguleringApi';
import {
    fradragFormdataTilFradrag,
    fradragTilFradragFormData,
} from '~src/components/beregningOgSimulering/beregning/beregningUtils';
import { FradragFormData, FradragInputs } from '~src/components/beregningOgSimulering/beregning/FradragInputs';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import { Uføregrunnlag } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uføregrunnlag';
import { Sak } from '~src/types/Sak';
import * as DateUtils from '~src/utils/date/dateUtils';
import { parseIsoDateOnly } from '~src/utils/date/dateUtils';
import { fjernFradragSomIkkeErValgbare } from '~src/utils/fradrag/fradragUtil';

import messages from './manuellRegulering-nb';
import styles from './manuellRegulering.module.less';

interface Props {
    sak: Sak;
}
interface FormData {
    uføre: Uføregrunnlag[];
    fradrag: FradragFormData[];
}
const ManuellRegulering = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    const urlParams = Routes.useRouteParams<typeof Routes.manuellRegulering>();
    const regulering = props.sak.reguleringer.find((r) => r.id === urlParams.reguleringId);
    const [, reguler] = useApiCall(reguleringApi.regulerManuelt);

    const filtrerRegulerbarIEU = (grunnlag: Nullable<Uføregrunnlag>): grunnlag is Uføregrunnlag => grunnlag !== null;

    if (!regulering) {
        return <div>feil</div>;
    }

    const {
        grunnlagsdataOgVilkårsvurderinger: { fradrag, uføre },
    } = regulering;
    const uføregrunnlag = uføre?.vurderinger.map((v) => v?.grunnlag).filter(filtrerRegulerbarIEU) ?? [];
    const regulerbarIEU = uføregrunnlag.filter((v) => v.forventetInntekt > 0);

    const formik = useFormik<FormData>({
        initialValues: {
            uføre: uføregrunnlag,
            fradrag: fjernFradragSomIkkeErValgbare(fradrag).map(fradragTilFradragFormData),
        },
        onSubmit: (values) =>
            reguler({
                uføre: values.uføre,
                reguleringId: regulering.id,
                fradrag: values.fradrag.map((f) =>
                    fradragFormdataTilFradrag(f, {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        fraOgMed: parseIsoDateOnly(regulering.periode.fraOgMed)!,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        tilOgMed: parseIsoDateOnly(regulering.periode.tilOgMed)!,
                    })
                ),
            }),
    });

    return (
        <form onSubmit={formik.handleSubmit}>
            <Heading level="1" size="large" className={styles.tittel}>
                {formatMessage('tittel')}
            </Heading>

            <div className={styles.ieu}>
                {(regulerbarIEU?.length ?? 0) > 0 && (
                    <Heading level="2" size="medium" className={styles.kategoriTittel}>
                        Endre forventet inntekt etter uførhet
                    </Heading>
                )}
                {formik.values.uføre.map((u, index) => {
                    if (u.forventetInntekt === 0) return null;

                    return (
                        <div key={u.id}>
                            <p>Tidligere verdi: {uføregrunnlag[index].forventetInntekt}kr</p>

                            <TextField
                                value={u.forventetInntekt}
                                onChange={(e) =>
                                    formik.setFieldValue(`uføre.${index}.forventetInntekt`, e.currentTarget.value)
                                }
                                label={`Ny verdi for perioden ${DateUtils.formatPeriode(u.periode)}`}
                            />
                        </div>
                    );
                })}
            </div>

            <div>
                <Heading level="2" size="medium" className={styles.kategoriTittel}>
                    Endre fradrag
                </Heading>
                <FradragInputs
                    harEps={false}
                    feltnavn="fradrag"
                    fradrag={formik.values.fradrag}
                    errors={formik.errors.fradrag}
                    onChange={formik.handleChange}
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
                    onFjernClick={(index) => {
                        formik.setValues((v) => ({
                            ...v,
                            fradrag: formik.values.fradrag.filter((_, idx) => idx !== index),
                        }));
                    }}
                    onFradragChange={(index, value) => {
                        formik.setFieldValue(`fradrag[${index}]`, value);
                    }}
                    beregningsDato={{
                        fom: DateUtils.parseIsoDateOnly(regulering.periode.fraOgMed),
                        tom: DateUtils.parseIsoDateOnly(regulering.periode.tilOgMed),
                    }}
                />
            </div>

            <Button type="submit" className={styles.submit}>
                Submit
            </Button>
        </form>
    );
};

export default ManuellRegulering;
