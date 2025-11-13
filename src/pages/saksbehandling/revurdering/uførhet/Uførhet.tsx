import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import { UførhetForm } from '~src/components/forms/vilkårOgGrunnlagForms/uførhet/UførhetForm';
import {
    lagTomUføreperiode,
    UførhetFormData,
    vurderingsperiodeTilFormData,
} from '~src/components/forms/vilkårOgGrunnlagForms/uførhet/UførhetFormUtils';
import { uførhetSchema } from '~src/components/forms/vilkårOgGrunnlagForms/uførhet/validation';
import OppsummeringAvUførevilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvUføre';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { InformasjonsRevurdering, RevurderingStegProps } from '~src/types/Revurdering';
import * as DateUtils from '~src/utils/date/dateUtils';
import { erGregulering } from '~src/utils/revurdering/revurderingUtils';

import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';

import messages from './uførhet-nb';

const Uførhet = (props: RevurderingStegProps) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    const initialValues = {
        grunnlag: props.revurdering.grunnlagsdataOgVilkårsvurderinger.uføre?.vurderinger.map((u) =>
            vurderingsperiodeTilFormData(u),
        ) ?? [lagTomUføreperiode()],
    };
    const form = useForm<UførhetFormData>({
        defaultValues: initialValues,
        resolver: yupResolver(uførhetSchema(erGregulering(props.revurdering.årsak))),
    });

    const [status, lagre] = useAsyncActionCreator(GrunnlagOgVilkårActions.lagreUføregrunnlag);

    const handleSave = (values: UførhetFormData, onSuccess: (r: InformasjonsRevurdering, nesteUrl: string) => void) => {
        return lagre(
            {
                sakId: props.sakId,
                behandlingId: props.revurdering.id,
                vurderinger: values.grunnlag.map((g) => ({
                    periode: {
                        fraOgMed: DateUtils.toIsoDateOnlyString(g.periode.fraOgMed!),
                        tilOgMed: DateUtils.toIsoDateOnlyString(g.periode.tilOgMed!),
                    },
                    forventetInntekt: g.oppfylt ? Number.parseInt(g.forventetInntekt, 10) : null,
                    uføregrad: g.oppfylt ? Number.parseInt(g.uføregrad, 10) : null,
                    resultat: g.oppfylt ?? UføreResultat.HarUføresakTilBehandling,
                })),
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
                    <UførhetForm
                        form={form}
                        neste={{
                            onClick: (values) =>
                                handleSave(
                                    values,
                                    props.onSuccessOverride
                                        ? (r) => props.onSuccessOverride!(r)
                                        : () => navigate(props.nesteUrl),
                                ),
                            savingState: status,
                            url: props.nesteUrl,
                        }}
                        tilbake={{
                            url: props.onTilbakeClickOverride ? undefined : props.forrigeUrl,
                            onClick: props.onTilbakeClickOverride,
                        }}
                        lagreOgfortsettSenere={{
                            onClick: handleSave,
                            url: props.avsluttUrl,
                        }}
                        minOgMaxPeriode={{
                            fraOgMed: DateUtils.parseNonNullableIsoDateOnly(props.revurdering.periode.fraOgMed),
                            tilOgMed: DateUtils.parseNonNullableIsoDateOnly(props.revurdering.periode.tilOgMed),
                        }}
                        søknadsbehandlingEllerRevurdering={'Revurdering'}
                        {...props}
                    />
                ),
                right: (
                    <>
                        <Heading level="2" size="large" spacing>
                            {formatMessage('heading.gjeldendeGrunnlag')}
                        </Heading>
                        <OppsummeringAvUførevilkår uførevilkår={props.grunnlagsdataOgVilkårsvurderinger.uføre} />
                    </>
                ),
            }}
        </ToKolonner>
    );
};

export default Uførhet;
