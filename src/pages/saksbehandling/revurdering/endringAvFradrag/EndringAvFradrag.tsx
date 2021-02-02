import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Ingress, Innholdstittel } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { formatMonthYear } from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import yup from '~lib/validering';
import { FradragTilFradragFormData } from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/beregningUtils';
import {
    FradragFormData,
    FradragInputs,
    fradragSchema,
} from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/FradragInputs';
import { RevurderingSteg } from '~pages/saksbehandling/types';
import { useAppSelector } from '~redux/Store';
import { Fradragstype, Periode } from '~types/Fradrag';
import { Revurdering } from '~types/Revurdering';

import fradragMessages from '../../steg/beregningOgSimulering/beregning/beregning-nb';
import messages from '../revurdering-nb';
import sharedStyles from '../revurdering.module.less';
import { erRevurderingSimulert } from '../revurderingUtils';

import styles from './endringAvFradrag.module.less';

interface EndringAvFradragFormData {
    fradrag: FradragFormData[];
}

const schema = yup.object<EndringAvFradragFormData>({
    fradrag: yup.array(fradragSchema.required()).defined(),
});

const EndringAvFradrag = (props: {
    sakId: string;
    periode: Periode;
    revurdering: Revurdering;
    beregnOgSimulerRevurdering: (fradrag: FradragFormData[]) => void;
}) => {
    const { beregnOgSimulerStatus: beregnOgSimuler } = useAppSelector((state) => state.revurdering);
    const intl = useI18n({ messages: { ...messages, ...fradragMessages } });
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

    const fradragUtenForventetInntekt = (fradrag: FradragFormData[]) => {
        return fradrag.filter((f) => {
            return f.type !== Fradragstype.ForventetInntekt;
        });
    };

    const formik = useFormik<EndringAvFradragFormData>({
        initialValues: {
            fradrag: erRevurderingSimulert(props.revurdering)
                ? fradragUtenForventetInntekt(
                      FradragTilFradragFormData(props.revurdering.beregninger.revurdert.fradrag)
                  )
                : fradragUtenForventetInntekt(
                      FradragTilFradragFormData(props.revurdering.tilRevurdering.beregning?.fradrag ?? [])
                  ),
        },
        onSubmit(values) {
            props.beregnOgSimulerRevurdering(values.fradrag);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    return (
        <form
            className={sharedStyles.revurderingContainer}
            onSubmit={(e) => {
                setHasSubmitted(true);
                formik.handleSubmit(e);
            }}
        >
            <Innholdstittel className={sharedStyles.tittel}>
                {intl.formatMessage({ id: 'revurdering.tittel' })}
            </Innholdstittel>
            <div className={sharedStyles.mainContentContainer}>
                <Ingress>{intl.formatMessage({ id: 'periode.overskrift' })}</Ingress>
                <div className={styles.periodeContainer}>
                    <p>
                        {`${formatMonthYear(props.periode.fraOgMed.toString(), intl)} -
                        ${formatMonthYear(props.periode.tilOgMed.toString(), intl)} `}
                    </p>
                </div>
                <div className={styles.fradragInputsContainer}>
                    <FradragInputs
                        //TODO: Få inn EPS fra back-end
                        harEps={true}
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
                        beregningsDato={{ fom: props.periode.fraOgMed, tom: props.periode.tilOgMed }}
                        onLeggTilClick={() => {
                            formik.setValues({
                                ...formik.values,
                                fradrag: [
                                    ...formik.values.fradrag,
                                    {
                                        beløp: null,
                                        type: null,
                                        fraUtland: false,
                                        utenlandskInntekt: {
                                            beløpIUtenlandskValuta: '',
                                            valuta: '',
                                            kurs: '',
                                        },
                                        periode: null,
                                        tilhørerEPS: false,
                                    },
                                ],
                            });
                        }}
                    />
                </div>
                {RemoteData.isFailure(beregnOgSimuler) && (
                    <AlertStripeFeil className={sharedStyles.alertstripe}>
                        {beregnOgSimuler.error.body?.message}
                    </AlertStripeFeil>
                )}
                <div className={sharedStyles.knappContainer}>
                    <Link
                        className="knapp"
                        to={Routes.revurderValgtSak.createURL({ sakId: props.sakId, steg: RevurderingSteg.Periode })}
                    >
                        {intl.formatMessage({ id: 'knapp.forrige' })}
                    </Link>
                    <Hovedknapp spinner={RemoteData.isPending(beregnOgSimuler)}>
                        {intl.formatMessage({ id: 'knapp.neste' })}
                    </Hovedknapp>
                </div>
            </div>
        </form>
    );
};

export default EndringAvFradrag;
