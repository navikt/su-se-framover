import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import OpplysningspliktForm from '~src/components/forms/vilkårOgGrunnlagForms/opplysningsplikt/OpplysningspliktForm';
import {
    OpplysningspliktVilkårFormData,
    opplysningspliktFormSchema,
} from '~src/components/forms/vilkårOgGrunnlagForms/opplysningsplikt/OpplysningspliktFormUtils';
import OppsummeringAvOpplysningspliktvilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvOpplysningsplikt';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { lagreOpplysningsplikt } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import { InformasjonsRevurdering, RevurderingStegProps } from '~src/types/Revurdering';
import { parseIsoDateOnly, sluttenAvMåneden, toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import messages from './opplysningsplikt-nb';

const Opplysningsplikt = (props: RevurderingStegProps) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [status, lagre] = useAsyncActionCreator(lagreOpplysningsplikt);

    const vurderinger = props.revurdering.grunnlagsdataOgVilkårsvurderinger.opplysningsplikt?.vurderinger ?? [
        { periode: props.revurdering.periode, beskrivelse: undefined },
    ];

    const revurderingsperiode = {
        fraOgMed: new Date(props.revurdering.periode.fraOgMed),
        tilOgMed: new Date(props.revurdering.periode.tilOgMed),
    };

    const initialValues = {
        opplysningsplikt: vurderinger.map((vurdering) => ({
            periode: {
                fraOgMed: parseIsoDateOnly(vurdering.periode.fraOgMed),
                tilOgMed: parseIsoDateOnly(vurdering.periode.tilOgMed),
            },
            beskrivelse: vurdering.beskrivelse ?? null,
        })),
    };
    const form = useForm<OpplysningspliktVilkårFormData>({
        resolver: yupResolver(opplysningspliktFormSchema),
        defaultValues: initialValues,
    });

    const handleSubmit = async (
        form: OpplysningspliktVilkårFormData,
        onSuccess: (r: InformasjonsRevurdering, nesteUrl: string) => void,
    ) => {
        lagre(
            {
                behandlingId: props.revurdering.id,
                type: 'REVURDERING',
                data: form.opplysningsplikt.map((v) => ({
                    periode: {
                        fraOgMed: toIsoDateOnlyString(v.periode.fraOgMed!),
                        tilOgMed: toIsoDateOnlyString(sluttenAvMåneden(v.periode.tilOgMed!)),
                    },
                    beskrivelse: v.beskrivelse,
                })),
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
                    <OpplysningspliktForm
                        form={form}
                        minOgMaxPeriode={revurderingsperiode}
                        neste={{
                            savingState: status,
                            url: props.nesteUrl,
                            onClick: (values) =>
                                handleSubmit(
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
                            onClick: handleSubmit,
                            url: props.avsluttUrl,
                        }}
                        søknadsbehandlingEllerRevurdering={'Revurdering'}
                        {...props}
                    />
                ),
                right: (
                    <>
                        <Heading level="2" size="large" spacing>
                            {formatMessage('eksisterende.vedtakinfo.tittel')}
                        </Heading>
                        <OppsummeringAvOpplysningspliktvilkår
                            opplysningspliktVilkår={props.grunnlagsdataOgVilkårsvurderinger.opplysningsplikt}
                        />
                    </>
                ),
            }}
        </ToKolonner>
    );
};

export default Opplysningsplikt;
