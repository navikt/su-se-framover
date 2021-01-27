import * as RemoteData from '@devexperts/remote-data-ts';
import { lastDayOfMonth } from 'date-fns';
import { useFormik } from 'formik';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Feilmelding, Ingress, Innholdstittel } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import * as revurderingSlice from '~features/revurdering/revurdering.slice';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { FradragTilFradragFormData } from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/beregningUtils';
import {
    FradragFormData,
    FradragInputs,
    fradragSchema,
} from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/FradragInputs';
import { RevurderingSteg } from '~pages/saksbehandling/types';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Fradragstype, FradragTilhører } from '~types/Fradrag';
import { OpprettetRevurdering } from '~types/Revurdering';

import fradragMessages from '../../steg/beregningOgSimulering/beregning/beregning-nb';
import messages from '../revurdering-nb';
import sharedStyles from '../revurdering.module.less';

import styles from './endringAvFradrag.module.less';

interface EndringAvFradragFormData {
    fradrag: FradragFormData[];
}

const schema = yup.object<EndringAvFradragFormData>({
    fradrag: yup.array(fradragSchema.required()).defined(),
});

const EndringAvFradrag = (props: {
    sakId: string;
    periode: { fom: Nullable<Date>; tom: Nullable<Date> };
    revurdering: Nullable<OpprettetRevurdering>;
}) => {
    const history = useHistory();
    const dispatch = useAppDispatch();
    const { beregnOgSimulerStatus: beregnOgSimuler } = useAppSelector((state) => state.revurdering);
    const intl = useI18n({ messages: { ...messages, ...fradragMessages } });
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

    if (!props.periode.fom || !props.periode.tom || !props.revurdering) {
        return (
            <div className={sharedStyles.revurderingContainer}>
                <Innholdstittel className={sharedStyles.tittel}>
                    {intl.formatMessage({ id: 'revurdering.tittel' })}
                </Innholdstittel>
                <div className={sharedStyles.mainContentContainer}>
                    <div>
                        <Feilmelding className={sharedStyles.feilmelding}>
                            {intl.formatMessage({ id: 'revurdering.noeGikkGalt' })}
                        </Feilmelding>
                    </div>
                    <div className={sharedStyles.knappContainer}>
                        <Link
                            className="knapp"
                            to={Routes.revurderValgtSak.createURL({
                                sakId: props.sakId,
                                steg: RevurderingSteg.Periode,
                            })}
                        >
                            {intl.formatMessage({ id: 'knapp.forrige' })}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const beregnOgSimulerRevurdering = (values: EndringAvFradragFormData, revurdering: OpprettetRevurdering) => {
        return dispatch(
            revurderingSlice.beregnOgSimuler({
                sakId: props.sakId,
                revurderingId: revurdering.id,
                //valdiering sikrer at feltet ikke er null
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                periode: {
                    fraOgMed: props.periode.fom!.toISOString(),
                    tilOgMed: lastDayOfMonth(props.periode.tom!).toISOString(),
                },
                fradrag: values.fradrag.map((f) => ({
                    periode:
                        f.periode?.fraOgMed && f.periode.tilOgMed
                            ? { fraOgMed: f.periode.fraOgMed, tilOgMed: f.periode.tilOgMed }
                            : null,
                    beløp: parseInt(f.beløp!, 10),
                    type: f.type!,
                    utenlandskInntekt: f.fraUtland
                        ? {
                              beløpIUtenlandskValuta: parseInt(f.utenlandskInntekt.beløpIUtenlandskValuta),
                              valuta: f.utenlandskInntekt.valuta,
                              kurs: Number.parseFloat(f.utenlandskInntekt.kurs),
                          }
                        : null,
                    tilhører: f.tilhørerEPS ? FradragTilhører.EPS : FradragTilhører.Bruker,
                    /* eslint-enable @typescript-eslint/no-non-null-assertion */
                })),
            })
        );
    };

    const fradragUtenForventetInntekt = (fradrag: FradragFormData[]) => {
        return fradrag.filter((f) => {
            return f.type !== Fradragstype.ForventetInntekt;
        });
    };

    const formik = useFormik<EndringAvFradragFormData>({
        initialValues: {
            fradrag: RemoteData.isSuccess(beregnOgSimuler)
                ? fradragUtenForventetInntekt(FradragTilFradragFormData(beregnOgSimuler.value.revurdert.fradrag))
                : fradragUtenForventetInntekt(
                      FradragTilFradragFormData(props.revurdering.tilRevurdering.beregning?.fradrag ?? [])
                  ),
        },
        async onSubmit(values) {
            if (!props.revurdering) {
                return;
            }

            const beregnOgSimuler = await beregnOgSimulerRevurdering(values, props.revurdering);
            if (revurderingSlice.beregnOgSimuler.rejected.match(beregnOgSimuler)) {
                return;
            }

            history.push(Routes.revurderValgtSak.createURL({ sakId: props.sakId, steg: RevurderingSteg.Oppsummering }));
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
                        {intl.formatDate(props.periode.fom, {
                            year: 'numeric',
                            month: '2-digit',
                        })}{' '}
                        -{' '}
                        {intl.formatDate(props.periode.tom, {
                            year: 'numeric',
                            month: '2-digit',
                        })}
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
                        beregningsDato={{ fom: props.periode.fom, tom: props.periode.tom }}
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
