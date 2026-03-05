import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { getEq } from 'fp-ts/lib/Array';
import { struct } from 'fp-ts/lib/Eq';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ApiError, ErrorMessage } from '~src/api/apiClient';
import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import FradragForm from '~src/components/forms/vilkårOgGrunnlagForms/fradrag/FradragForm';
import {
    eqFradragFormData,
    FradragFormData,
    fradragFormdataTilFradrag,
    fradragSchema,
    fradragTilFradragFormData,
} from '~src/components/forms/vilkårOgGrunnlagForms/fradrag/FradragFormUtils';
import Feiloppsummering from '~src/components/oppsummering/feiloppsummering/Feiloppsummering';
import OppsummeringAvFradrag from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFradrag';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useI18n } from '~src/lib/i18n';
import yup, { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import sharedMessages from '~src/pages/saksbehandling/revurdering/revurdering-nb';
import fradragMessages from '~src/pages/saksbehandling/søknadsbehandling/beregning/beregning-nb';
import { useAppDispatch } from '~src/redux/Store';
import { bosituasjonHarEps } from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { InformasjonsRevurdering, Revurdering, RevurderingStegProps } from '~src/types/Revurdering';
import * as DateUtils from '~src/utils/date/dateUtils';
import { fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold } from '~src/utils/fradrag/fradragUtil';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';

import Navigasjonsknapper from '../../../../components/navigasjonsknapper/Navigasjonsknapper';
import uføreMessages from '../../søknadsbehandling/uførhet/uførhet-nb';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';
import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';
import styles from './endringAvFradrag.module.less';
import messages from './endringAvFradrag-nb';

interface EndringAvFradragFormData {
    fradrag: FradragFormData[];
}

//TODO - en del ting her burde bli abstrahert ut
export const eqFradragGrunnlagFormData = struct<EndringAvFradragFormData>({
    fradrag: getEq(eqFradragFormData),
});

const EndringAvFradrag = (props: RevurderingStegProps) => {
    const { intl } = useI18n({
        messages: { ...sharedMessages, ...fradragMessages, ...uføreMessages, ...messages },
    });
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [savingState, setSavingState] = useState<
        RemoteData.RemoteData<ApiError, { revurdering: Revurdering; feilmeldinger: ErrorMessage[] }>
    >(RemoteData.initial);

    const schema = yup.object<EndringAvFradragFormData>({
        fradrag: yup.array<FradragFormData>(fradragSchema.required()).defined(),
    });
    const initialValues = {
        fradrag: fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold(
            props.revurdering.grunnlagsdataOgVilkårsvurderinger.fradrag,
        ).map((f) =>
            fradragTilFradragFormData(f, {
                fraOgMed: DateUtils.parseIsoDateOnly(props.revurdering.periode.fraOgMed),
                tilOgMed: DateUtils.parseIsoDateOnly(props.revurdering.periode.tilOgMed),
            }),
        ),
    };
    const form = useForm<EndringAvFradragFormData>({
        defaultValues: initialValues,
        resolver: yupResolver(schema),
    });

    const save = async (
        values: EndringAvFradragFormData,
        onSuccess: (r: InformasjonsRevurdering, nesteUrl: string) => void,
    ) => {
        if (RemoteData.isPending(savingState)) {
            return;
        }
        setSavingState(RemoteData.pending);

        const res = await dispatch(
            GrunnlagOgVilkårActions.lagreFradragsgrunnlag({
                sakId: props.sakId,
                behandlingId: props.revurdering.id,
                fradrag: values.fradrag.map((f) =>
                    fradragFormdataTilFradrag(f, lagDatePeriodeAvStringPeriode(props.revurdering.periode)),
                ),
                behandlingstype: Behandlingstype.Revurdering,
            }),
        );

        if (GrunnlagOgVilkårActions.lagreFradragsgrunnlag.fulfilled.match(res)) {
            const castedPayload = res.payload as RevurderingOgFeilmeldinger;
            setSavingState(RemoteData.success(castedPayload));
            if (castedPayload.feilmeldinger.length === 0) {
                onSuccess(castedPayload.revurdering, props.nesteUrl);
            }
        } else if (GrunnlagOgVilkårActions.lagreFradragsgrunnlag.rejected.match(res)) {
            setSavingState(RemoteData.failure(res.payload!));
        }
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <form
                        onSubmit={form.handleSubmit((values) =>
                            save(
                                values,
                                props.onSuccessOverride
                                    ? (r) => props.onSuccessOverride!(r)
                                    : () => navigate(props.nesteUrl),
                            ),
                        )}
                    >
                        <div>
                            <div className={styles.fradragInputsContainer}>
                                <FradragForm
                                    name={'fradrag'}
                                    control={form.control}
                                    setValue={form.setValue}
                                    harEPS={props.revurdering.grunnlagsdataOgVilkårsvurderinger.bosituasjon.some(
                                        bosituasjonHarEps,
                                    )}
                                    beregningsDato={{
                                        fraOgMed: new Date(props.revurdering.periode.fraOgMed),
                                        tilOgMed: new Date(props.revurdering.periode.tilOgMed),
                                    }}
                                    readonly={false}
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
                                neste={{
                                    loading: RemoteData.isPending(savingState),
                                }}
                                tilbake={
                                    props.onTilbakeClickOverride
                                        ? { onClick: props.onTilbakeClickOverride }
                                        : { url: props.forrigeUrl }
                                }
                                fortsettSenere={{
                                    onClick: () => save(form.getValues(), () => navigate(props.avsluttUrl)),
                                }}
                            />
                        </div>
                    </form>
                ),
                right: (
                    <div>
                        <Heading level="2" size="large" spacing>
                            {intl.formatMessage({ id: 'heading.gjeldendeFradrag' })}
                        </Heading>
                        <OppsummeringAvFradrag fradrag={props.grunnlagsdataOgVilkårsvurderinger.fradrag} />
                    </div>
                ),
            }}
        </ToKolonner>
    );
};

export default EndringAvFradrag;
