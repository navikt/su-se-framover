import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import PersonligOppmøteForm from '~src/components/forms/vilkårOgGrunnlagForms/personligOppmøte/PersonligOppmøteForm';
import {
    PersonligOppmøteVilkårFormData,
    personligOppmøteFormDataTilRequest,
    personligOppmøteFormSchema,
    personligOppmøteVilkårTilFormDataEllerNy,
} from '~src/components/forms/vilkårOgGrunnlagForms/personligOppmøte/PersonligOppmøteFormUtils';
import OppsummeringAvPersonligoppmøtevilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvPersonligOppmøte';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { lagrePersonligOppmøteVilkår } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import { InformasjonsRevurdering, RevurderingStegProps } from '~src/types/Revurdering';

import messages from './personligOppmøte-nb';

export function PersonligOppmøte(props: RevurderingStegProps) {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [status, lagre] = useAsyncActionCreator(lagrePersonligOppmøteVilkår);

    const initialValues = personligOppmøteVilkårTilFormDataEllerNy(
        props.revurdering.grunnlagsdataOgVilkårsvurderinger.personligOppmøte,
    );
    const form = useForm<PersonligOppmøteVilkårFormData>({
        resolver: yupResolver(personligOppmøteFormSchema),
        defaultValues: initialValues,
    });

    const lagrePersonligOppmøte = (
        values: PersonligOppmøteVilkårFormData,
        onSuccess: (r: InformasjonsRevurdering, nesteUrl: string) => void,
    ) => {
        return lagre(
            {
                ...personligOppmøteFormDataTilRequest({
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

    const revurderingsperiode = {
        fraOgMed: new Date(props.revurdering.periode.fraOgMed),
        tilOgMed: new Date(props.revurdering.periode.tilOgMed),
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <PersonligOppmøteForm
                        form={form}
                        minOgMaxPeriode={revurderingsperiode}
                        neste={{
                            url: props.nesteUrl,
                            savingState: status,
                            onClick: (values) =>
                                lagrePersonligOppmøte(
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
                            onClick: lagrePersonligOppmøte,
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
                        <OppsummeringAvPersonligoppmøtevilkår
                            personligoppmøte={props.grunnlagsdataOgVilkårsvurderinger.personligOppmøte}
                        />
                    </>
                ),
            }}
        </ToKolonner>
    );
}
