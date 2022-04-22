import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, TextField } from '@navikt/ds-react';
import { useFormik } from 'formik';
import React from 'react';
import { useHistory } from 'react-router-dom';

import * as reguleringApi from '~src/api/reguleringApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import {
    fradragFormdataTilFradrag,
    fradragTilFradragFormData,
} from '~src/components/beregningOgSimulering/beregning/beregningUtils';
import { FradragFormData, FradragInputs } from '~src/components/beregningOgSimulering/beregning/FradragInputs';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import { Fradragstype } from '~src/types/Fradrag';
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
    const [regulerStatus, reguler] = useApiCall(reguleringApi.regulerManuelt);
    const history = useHistory();

    const BackButton = () => (
        <Button
            onClick={() => history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id }))}
            variant="secondary"
        >
            {formatMessage('knapper.tilbake')}
        </Button>
    );
    const filtrerRegulerbarIEU = (grunnlag: Nullable<Uføregrunnlag>): grunnlag is Uføregrunnlag => grunnlag !== null;

    if (!regulering) {
        return (
            <div className={styles.feil}>
                <Alert variant="error">{formatMessage('fantIkkeRegulering')}</Alert>
                <BackButton />
            </div>
        );
    }

    const {
        grunnlagsdataOgVilkårsvurderinger: { fradrag, uføre },
    } = regulering;
    const uføregrunnlag = uføre?.vurderinger.map((v) => v?.grunnlag).filter(filtrerRegulerbarIEU) ?? [];
    const harRegulerbarIEU = uføregrunnlag.some((v) => v.forventetInntekt > 0);
    const harRegulerbarFradrag = fradrag.some((f) =>
        [Fradragstype.NAVytelserTilLivsopphold, Fradragstype.OffentligPensjon].includes(f.type)
    );
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
        <form onSubmit={formik.handleSubmit} className={styles.form}>
            <Heading level="1" size="large" className={styles.tittel}>
                {formatMessage('tittel')}
            </Heading>

            <div className={styles.container}>
                <div className={styles.ieu}>
                    <Heading level="2" size="medium" className={styles.kategoriTittel}>
                        {formatMessage('reguler.ieu')}
                    </Heading>

                    {harRegulerbarIEU ? (
                        formik.values.uføre.map((u, index) => {
                            if (u.forventetInntekt === 0) return null;

                            return (
                                <div key={u.id}>
                                    <p>
                                        {`${formatMessage('ieu.verdi.tidligere')} }: ${
                                            uføregrunnlag[index].forventetInntekt
                                        } kr`}
                                    </p>

                                    <TextField
                                        size="medium"
                                        value={u.forventetInntekt}
                                        onChange={(e) =>
                                            formik.setFieldValue(
                                                `uføre.${index}.forventetInntekt`,
                                                e.currentTarget.value
                                            )
                                        }
                                        label={`Ny verdi for perioden ${DateUtils.formatPeriode(u.periode)}`}
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <p>{formatMessage('ingen.ieu')}.</p>
                    )}
                </div>

                <div>
                    <Heading level="2" size="medium" className={styles.kategoriTittel}>
                        {formatMessage('reguler.fradrag')}
                    </Heading>
                    {harRegulerbarFradrag ? (
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
                    ) : (
                        <p>{formatMessage('ingen.fradrag')}.</p>
                    )}
                </div>
                {RemoteData.isFailure(regulerStatus) && <ApiErrorAlert error={regulerStatus.error} />}
                <div className={styles.knapper}>
                    <BackButton />
                    {(harRegulerbarIEU || harRegulerbarFradrag) && (
                        <Button type="submit" className={styles.submit}>
                            {formatMessage('knapper.send')}
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
};

export default ManuellRegulering;
