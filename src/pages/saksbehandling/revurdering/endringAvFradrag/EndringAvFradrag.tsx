import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Heading } from '@navikt/ds-react';
import { useFormik } from 'formik';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { ApiError, ErrorMessage } from '~api/apiClient';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import fradragMessages from '~components/beregningOgSimulering/beregning/beregning-nb';
import { fradragTilFradragFormData } from '~components/beregningOgSimulering/beregning/beregningUtils';
import {
    FradragFormData,
    FradragInputs,
    fradragSchema,
} from '~components/beregningOgSimulering/beregning/FradragInputs';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import Fradragoppsummering from '~components/revurdering/oppsummering/fradragoppsummering/Fradragoppsummering';
import ToKolonner from '~components/toKolonner/ToKolonner';
import { lagreFradragsgrunnlag } from '~features/revurdering/revurderingActions';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { customFormikSubmit } from '~lib/formUtils';
import { useI18n } from '~lib/i18n';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { Fradrag, Fradragstype, FradragTilhører } from '~types/Fradrag';
import { Revurdering, RevurderingStegProps } from '~types/Revurdering';
import * as DateUtils from '~utils/date/dateUtils';
import { fjernFradragSomIkkeErValgbare } from '~utils/fradrag/fradragUtil';
import fradragstypeMessages from '~utils/søknadsbehandling/fradrag/fradragstyper-nb';
import { hentBosituasjongrunnlag } from '~utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';

import uføreMessages from '../../søknadsbehandling/uførhet/uførhet-nb';
import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import sharedStyles from '../revurdering.module.less';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';
import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import messages from './endringAvFradrag-nb';
import styles from './endringAvFradrag.module.less';

interface EndringAvFradragFormData {
    fradrag: FradragFormData[];
}

const GjeldendeFradrag = (props: { fradrag: Fradrag[] }) => {
    const { intl } = useI18n({ messages: { ...messages, ...fradragstypeMessages } });
    return (
        <div>
            <Heading level="2" size="large" spacing>
                {intl.formatMessage({ id: 'heading.gjeldendeFradrag' })}
            </Heading>
            <Fradragoppsummering fradrag={props.fradrag} />
        </div>
    );
};

const EndringAvFradrag = (props: RevurderingStegProps) => {
    const { intl } = useI18n({
        messages: { ...sharedMessages, ...fradragMessages, ...uføreMessages, ...fradragstypeMessages },
    });
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);
    const [savingState, setSavingState] = React.useState<
        RemoteData.RemoteData<ApiError, { revurdering: Revurdering; feilmeldinger: ErrorMessage[] }>
    >(RemoteData.initial);

    const save = async (values: EndringAvFradragFormData, onSuccess: () => void) => {
        if (RemoteData.isPending(savingState)) {
            return;
        }
        setSavingState(RemoteData.pending);

        const res = await dispatch(
            lagreFradragsgrunnlag({
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                fradrag: values.fradrag.map((f: FradragFormData) => ({
                    periode: {
                        /* eslint-disable @typescript-eslint/no-non-null-assertion */
                        fraOgMed: DateUtils.toIsoDateOnlyString(
                            f.periode?.fraOgMed ?? DateUtils.parseIsoDateOnly(props.revurdering.periode.fraOgMed)
                        ),
                        tilOgMed: DateUtils.toIsoDateOnlyString(
                            DateUtils.sluttenAvMåneden(
                                f.periode?.tilOgMed ?? DateUtils.parseIsoDateOnly(props.revurdering.periode.tilOgMed)
                            )
                        ),
                        /* eslint-enable @typescript-eslint/no-non-null-assertion */
                    },
                    /* valideringa sjekker at f.beløp og f.type ikke er null */
                    /* eslint-disable @typescript-eslint/no-non-null-assertion */
                    beløp: Number.parseInt(f.beløp!, 10),
                    type: f.type!,
                    utenlandskInntekt: f.fraUtland
                        ? {
                              beløpIUtenlandskValuta: Number.parseInt(f.utenlandskInntekt.beløpIUtenlandskValuta),
                              valuta: f.utenlandskInntekt.valuta,
                              kurs: Number.parseFloat(f.utenlandskInntekt.kurs),
                          }
                        : null,
                    tilhører: f.tilhørerEPS ? FradragTilhører.EPS : FradragTilhører.Bruker,
                })),
            })
        );

        if (lagreFradragsgrunnlag.fulfilled.match(res)) {
            setSavingState(RemoteData.success(res.payload));
            if (res.payload.feilmeldinger.length === 0) {
                onSuccess();
            }
        } else if (lagreFradragsgrunnlag.rejected.match(res)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            setSavingState(RemoteData.failure(res.payload!));
        }
    };

    const schema = yup.object<EndringAvFradragFormData>({
        fradrag: yup.array(fradragSchema.required()).defined(),
    });
    const formik = useFormik<EndringAvFradragFormData>({
        initialValues: {
            fradrag: fjernFradragSomIkkeErValgbare(props.revurdering.grunnlagsdataOgVilkårsvurderinger.fradrag).map(
                fradragTilFradragFormData
            ),
        },
        async onSubmit(values) {
            await save(values, () => history.push(props.nesteUrl));
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <form
                        className={sharedStyles.revurderingContainer}
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            formik.handleSubmit(e);
                        }}
                    >
                        <div>
                            {props.revurdering.grunnlagsdataOgVilkårsvurderinger.fradrag.some(
                                (fradrag) => fradrag.type === Fradragstype.AvkortingUtenlandsopphold
                            ) && (
                                <Alert variant={'info'} className={styles.avkortingAlert}>
                                    {intl.formatMessage({ id: 'alert.advarsel.avkorting' })}
                                </Alert>
                            )}
                        </div>
                        <div>
                            <div className={styles.fradragInputsContainer}>
                                <FradragInputs
                                    harEps={
                                        hentBosituasjongrunnlag(props.revurdering.grunnlagsdataOgVilkårsvurderinger)
                                            .fnr !== null
                                    }
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
                                    beregningsDato={{
                                        fom: new Date(props.revurdering.periode.fraOgMed),
                                        tom: new Date(props.revurdering.periode.tilOgMed),
                                    }}
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
                            <Feiloppsummering
                                tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                                className={styles.feiloppsummering}
                                feil={formikErrorsTilFeiloppsummering(formik.errors)}
                                hidden={!formikErrorsHarFeil(formik.errors)}
                            />
                            {RemoteData.isFailure(savingState) && <ApiErrorAlert error={savingState.error} />}
                            {RemoteData.isSuccess(savingState) && (
                                <UtfallSomIkkeStøttes feilmeldinger={savingState.value.feilmeldinger} />
                            )}
                            <RevurderingBunnknapper
                                tilbakeUrl={props.forrigeUrl}
                                onLagreOgFortsettSenereClick={() => {
                                    setHasSubmitted(true);
                                    customFormikSubmit(formik, () =>
                                        save(formik.values, () => history.push(props.avsluttUrl))
                                    );
                                }}
                                loading={RemoteData.isPending(savingState)}
                            />
                        </div>
                    </form>
                ),
                right: <GjeldendeFradrag fradrag={props.grunnlagsdataOgVilkårsvurderinger.fradrag} />,
            }}
        </ToKolonner>
    );
};

export default EndringAvFradrag;
