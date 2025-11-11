import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import FlyktningForm from '~src/components/forms/vilkårOgGrunnlagForms/flyktning/FlyktningForm';
import {
    FlyktningVilkårFormData,
    flyktningFormDataTilRequest,
    flyktningFormSchema,
    flyktningVilkårTilFormDataEllerNy,
} from '~src/components/forms/vilkårOgGrunnlagForms/flyktning/FlyktningFormUtils';
import OppsummeringAvFlyktningvilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFlyktning';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { lagreFlyktningVilkår } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import { InformasjonsRevurdering, RevurderingStegProps } from '~src/types/Revurdering';

import messages from './flyktning-nb';

function FlyktningPage(props: RevurderingStegProps) {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [status, lagre] = useAsyncActionCreator(lagreFlyktningVilkår);

    const initialValues = flyktningVilkårTilFormDataEllerNy(
        props.revurdering.grunnlagsdataOgVilkårsvurderinger.flyktning,
    );
    const form = useForm<FlyktningVilkårFormData>({
        resolver: yupResolver(flyktningFormSchema),
        defaultValues: initialValues,
    });

    const lagreFlyktning = (
        values: FlyktningVilkårFormData,
        onSuccess: (r: InformasjonsRevurdering, nesteUrl: string) => void,
    ) => {
        return lagre(
            {
                ...flyktningFormDataTilRequest({
                    sakId: props.sakId,
                    behandlingId: props.revurdering.id,
                    vilkår: values,
                }),
                behandlingstype: Behandlingstype.Revurdering,
            },
            (res) => {
                const castedRes = res as RevurderingOgFeilmeldinger;
                if (castedRes.feilmeldinger.length === 0) {
                    onSuccess(castedRes.revurdering, props.nesteUrl);
                }
            },
        );
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <FlyktningForm
                        form={form}
                        minOgMaxPeriode={{
                            fraOgMed: new Date(props.revurdering.periode.fraOgMed),
                            tilOgMed: new Date(props.revurdering.periode.tilOgMed),
                        }}
                        neste={{
                            savingState: status,
                            url: props.nesteUrl,
                            onClick: (values) =>
                                lagreFlyktning(
                                    values,
                                    props.onSuccessOverride
                                        ? (r) => props.onSuccessOverride!(r)
                                        : () => navigate(props.nesteUrl),
                                ),
                        }}
                        tilbake={{
                            url: props.onTilbakeClickOverride ? undefined : props.forrigeUrl,
                            onClick: props.onTilbakeClickOverride,
                        }}
                        lagreOgfortsettSenere={{
                            onClick: lagreFlyktning,
                            url: props.avsluttUrl,
                        }}
                        søknadsbehandlingEllerRevurdering={'Revurdering'}
                        {...props}
                    />
                ),
                right: (
                    <>
                        <Heading size="large" level="2" spacing>
                            {formatMessage('gjeldende.overskrift')}
                        </Heading>
                        <OppsummeringAvFlyktningvilkår flyktning={props.grunnlagsdataOgVilkårsvurderinger.flyktning} />
                    </>
                ),
            }}
        </ToKolonner>
    );
}

export default FlyktningPage;
