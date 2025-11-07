import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import FastOppholdForm from '~src/components/forms/vilkårOgGrunnlagForms/fastOpphold/FastOppholdForm';
import {
    FastOppholdVilkårFormData,
    fastOppholdFormDataTilRequest,
    fastOppholdFormSchema,
    fastOppholdVilkårTilFormDataEllerNy,
} from '~src/components/forms/vilkårOgGrunnlagForms/fastOpphold/FastOppholdFormUtils';
import OppsummeringAvFastOppholdvilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFastOpphold';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { lagreFastOppholdVilkår } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import { InformasjonsRevurdering, RevurderingStegProps } from '~src/types/Revurdering';

import messages from './fastOpphold-nb';

function FastOppholdPage(props: RevurderingStegProps) {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [status, lagre] = useAsyncActionCreator(lagreFastOppholdVilkår);

    const initialValues = fastOppholdVilkårTilFormDataEllerNy(
        props.revurdering.grunnlagsdataOgVilkårsvurderinger.fastOpphold,
    );
    const form = useForm<FastOppholdVilkårFormData>({
        resolver: yupResolver(fastOppholdFormSchema),
        defaultValues: initialValues,
    });

    const handleNesteClick = (
        values: FastOppholdVilkårFormData,
        onSuccess: (r: InformasjonsRevurdering, nesteUrl: string) => void,
    ) => {
        return lagre(
            {
                ...fastOppholdFormDataTilRequest({
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
                    <FastOppholdForm
                        form={form}
                        minOgMaxPeriode={{
                            fraOgMed: new Date(props.revurdering.periode.fraOgMed),
                            tilOgMed: new Date(props.revurdering.periode.tilOgMed),
                        }}
                        søknadsbehandlingEllerRevurdering={'Revurdering'}
                        neste={{
                            savingState: status,
                            url: props.nesteUrl,
                            onClick: (values) =>
                                handleNesteClick(
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
                            onClick: handleNesteClick,
                            url: props.avsluttUrl,
                        }}
                        {...props}
                    />
                ),
                right: (
                    <>
                        <Heading size="large" level="2" spacing>
                            {formatMessage('gjeldende.overskrift')}
                        </Heading>
                        <OppsummeringAvFastOppholdvilkår
                            fastOpphold={props.grunnlagsdataOgVilkårsvurderinger.fastOpphold}
                        />
                    </>
                ),
            }}
        </ToKolonner>
    );
}

export default FastOppholdPage;
