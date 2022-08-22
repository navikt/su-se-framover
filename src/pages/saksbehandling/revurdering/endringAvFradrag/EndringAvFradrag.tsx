import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Heading } from '@navikt/ds-react';
import React from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ApiError, ErrorMessage } from '~src/api/apiClient';
import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import fradragMessages from '~src/components/beregningOgSimulering/beregning/beregning-nb';
import { fradragTilFradragFormData } from '~src/components/beregningOgSimulering/beregning/beregningUtils';
import {
    FradragFormData,
    FradragInputs,
    fradragSchema,
} from '~src/components/beregningOgSimulering/beregning/fradragInputs/FradragInputs';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import Fradragoppsummering from '~src/components/revurdering/oppsummering/fradragoppsummering/Fradragoppsummering';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useI18n } from '~src/lib/i18n';
import yup, { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
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

import { Navigasjonsknapper } from '../../bunnknapper/Navigasjonsknapper';
import uføreMessages from '../../søknadsbehandling/uførhet/uførhet-nb';
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
    const [savingState, setSavingState] = React.useState<
        RemoteData.RemoteData<ApiError, { revurdering: Revurdering; feilmeldinger: ErrorMessage[] }>
    >(RemoteData.initial);

    const save = async (values: EndringAvFradragFormData, onSuccess: () => void) => {
        if (RemoteData.isPending(savingState)) {
            return;
        }
        setSavingState(RemoteData.pending);

        const res = await dispatch(
            GrunnlagOgVilkårActions.lagreFradragsgrunnlag({
                sakId: props.sakId,
                behandlingId: props.revurdering.id,
                fradrag: values.fradrag.map((f: FradragFormData) => ({
                    periode: {
                        fraOgMed: DateUtils.toIsoDateOnlyString(
                            f.periode?.fraOgMed ?? DateUtils.parseIsoDateOnly(props.revurdering.periode.fraOgMed)!
                        ),
                        tilOgMed: DateUtils.toIsoDateOnlyString(
                            DateUtils.sluttenAvMåneden(
                                f.periode?.tilOgMed ?? DateUtils.parseIsoDateOnly(props.revurdering.periode.tilOgMed)!
                            )
                        ),
                    },
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
                behandlingstype: Behandlingstype.Revurdering,
            })
        );

        if (GrunnlagOgVilkårActions.lagreFradragsgrunnlag.fulfilled.match(res)) {
            const castedPayload = res.payload as RevurderingOgFeilmeldinger;
            setSavingState(RemoteData.success(castedPayload));
            if (castedPayload.feilmeldinger.length === 0) {
                onSuccess();
            }
        } else if (GrunnlagOgVilkårActions.lagreFradragsgrunnlag.rejected.match(res)) {
            setSavingState(RemoteData.failure(res.payload!));
        }
    };

    const schema = yup.object<EndringAvFradragFormData>({
        fradrag: yup.array(fradragSchema.required()).defined(),
    });
    const form = useForm<EndringAvFradragFormData>({
        defaultValues: {
            fradrag: fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold(
                props.revurdering.grunnlagsdataOgVilkårsvurderinger.fradrag
            ).map(fradragTilFradragFormData),
        },
        resolver: yupResolver(schema),
    });

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <form onSubmit={form.handleSubmit((values) => save(values, () => navigate(props.nesteUrl)))}>
                        <div>
                            {props.revurdering.grunnlagsdataOgVilkårsvurderinger.fradrag.some(
                                (fradrag) => fradrag.type === IkkeVelgbareFradragskategorier.AvkortingUtenlandsopphold
                            ) && (
                                <Alert variant={'info'}>{intl.formatMessage({ id: 'alert.advarsel.avkorting' })}</Alert>
                            )}
                        </div>
                        <div>
                            <div className={styles.fradragInputsContainer}>
                                <Controller
                                    control={form.control}
                                    name={'fradrag'}
                                    render={({ field, fieldState }) => (
                                        <FradragInputs
                                            harEps={props.revurdering.grunnlagsdataOgVilkårsvurderinger.bosituasjon.some(
                                                bosituasjonHarEps
                                            )}
                                            feltnavn={field.name}
                                            fradrag={field.value}
                                            errors={fieldState.error as FieldErrors | undefined}
                                            onLeggTilClick={() =>
                                                field.onChange([
                                                    ...field.value,
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
                                                ])
                                            }
                                            onFjernClick={(index) =>
                                                field.onChange(
                                                    field.value.filter((_: FradragFormData, i: number) => index !== i)
                                                )
                                            }
                                            onFradragChange={(index, value) =>
                                                field.onChange(
                                                    field.value.map((input, i) => (index === i ? value : input))
                                                )
                                            }
                                            beregningsDato={{
                                                fom: new Date(props.revurdering.periode.fraOgMed),
                                                tom: new Date(props.revurdering.periode.tilOgMed),
                                            }}
                                        />
                                    )}
                                />
                            </div>
                            <Feiloppsummering
                                tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                                className={styles.feiloppsummering}
                                feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                                hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                            />
                            {RemoteData.isFailure(savingState) && <ApiErrorAlert error={savingState.error} />}
                            {RemoteData.isSuccess(savingState) && (
                                <UtfallSomIkkeStøttes feilmeldinger={savingState.value.feilmeldinger} />
                            )}
                            <Navigasjonsknapper
                                tilbake={
                                    props.onTilbakeClickOverride
                                        ? { onTilbakeClick: props.onTilbakeClickOverride }
                                        : { url: props.forrigeUrl }
                                }
                                onLagreOgFortsettSenereClick={() =>
                                    save(form.getValues(), () => navigate(props.avsluttUrl))
                                }
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
