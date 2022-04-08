import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Heading } from '@navikt/ds-react';
import { useFormik } from 'formik';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiError, ErrorMessage } from '~src/api/apiClient';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import fradragMessages from '~src/components/beregningOgSimulering/beregning/beregning-nb';
import { fradragTilFradragFormData } from '~src/components/beregningOgSimulering/beregning/beregningUtils';
import {
    FradragFormData,
    FradragInputs,
    fradragSchema,
} from '~src/components/beregningOgSimulering/beregning/fradragInputs/FradragInputs';
import fradragstypeMessages from '~src/components/beregningOgSimulering/beregning/fradragInputs/fradragInputs-nb';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import Fradragoppsummering from '~src/components/revurdering/oppsummering/fradragoppsummering/Fradragoppsummering';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { lagreFradragsgrunnlag } from '~src/features/revurdering/revurderingActions';
import { customFormikSubmit } from '~src/lib/formUtils';
import { useI18n } from '~src/lib/i18n';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~src/lib/validering';
import sharedMessages from '~src/pages/saksbehandling/revurdering/revurdering-nb';
import { useAppDispatch } from '~src/redux/Store';
import {
    Fradrag,
    FradragTilhører,
    IkkeVelgbareFradragskategorier,
    VelgbareFradragskategorier,
} from '~src/types/Fradrag';
import { bosituasjonHarEps } from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { Revurdering, RevurderingStegProps } from '~src/types/Revurdering';
import * as DateUtils from '~src/utils/date/dateUtils';
import { fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold } from '~src/utils/fradrag/fradragUtil';

import uføreMessages from '../../søknadsbehandling/uførhet/uførhet-nb';
import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import * as sharedStyles from '../revurdering.module.less';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';
import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import messages from './endringAvFradrag-nb';
import * as styles from './endringAvFradrag.module.less';

interface EndringAvFradragFormData {
    fradrag: FradragFormData[];
}

const GjeldendeFradrag = (props: { fradrag: Fradrag[] }) => {
    const { intl } = useI18n({ messages: { ...messages } });
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
        messages: { ...sharedMessages, ...fradragMessages, ...uføreMessages },
    });
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
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
                            f.periode?.fraOgMed ?? DateUtils.parseIsoDateOnly(props.revurdering.periode.fraOgMed)!
                        ),
                        tilOgMed: DateUtils.toIsoDateOnlyString(
                            DateUtils.sluttenAvMåneden(
                                f.periode?.tilOgMed ?? DateUtils.parseIsoDateOnly(props.revurdering.periode.tilOgMed)!
                            )
                        ),
                        /* eslint-enable @typescript-eslint/no-non-null-assertion */
                    },
                    /* valideringa sjekker at f.beløp og f.type ikke er null */
                    /* eslint-disable @typescript-eslint/no-non-null-assertion */
                    beløp: Number.parseInt(f.beløp!, 10),
                    type: f.kategori!,
                    beskrivelse: f.kategori === VelgbareFradragskategorier.Annet ? f.spesifisertkategori : null,
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
            fradrag: fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold(
                props.revurdering.grunnlagsdataOgVilkårsvurderinger.fradrag
            ).map(fradragTilFradragFormData),
        },
        async onSubmit(values) {
            await save(values, () => navigate(props.nesteUrl));
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
                                (fradrag) => fradrag.type === IkkeVelgbareFradragskategorier.AvkortingUtenlandsopphold
                            ) && (
                                <Alert variant={'info'}>{intl.formatMessage({ id: 'alert.advarsel.avkorting' })}</Alert>
                            )}
                        </div>
                        <div>
                            <div className={styles.fradragInputsContainer}>
                                <FradragInputs
                                    harEps={props.revurdering.grunnlagsdataOgVilkårsvurderinger.bosituasjon.some(
                                        bosituasjonHarEps
                                    )}
                                    feltnavn="fradrag"
                                    fradrag={formik.values.fradrag}
                                    errors={formik.errors.fradrag}
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
                                                    kategori: null,
                                                    spesifisertkategori: null,
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
                                tilbake={props.forrige}
                                onLagreOgFortsettSenereClick={() => {
                                    setHasSubmitted(true);
                                    customFormikSubmit(formik, () =>
                                        save(formik.values, () => navigate(props.avsluttUrl))
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
