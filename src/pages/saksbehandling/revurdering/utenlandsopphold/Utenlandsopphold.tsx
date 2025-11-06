import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import UtenlandsoppholdForm from '~src/components/forms/vilkårOgGrunnlagForms/utenlandsopphold/UtenlandsoppholdForm';
import {
    UtenlandsoppholdVilkårFormData,
    utenlandsoppholdFormDataTilRequest,
    utenlandsoppholdFormSchema,
    utenlandsoppholdVilkårTilFormDataEllerNy,
} from '~src/components/forms/vilkårOgGrunnlagForms/utenlandsopphold/UtenlandsoppholdFormUtils';
import OppsummeringAvUtenlandsopphold from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvUtenlandsopphold';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { lagreUtenlandsopphold } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import revurderingmessages from '~src/pages/saksbehandling/revurdering/revurdering-nb';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import { InformasjonsRevurdering, RevurderingStegProps } from '~src/types/Revurdering';

import messages from './utenlandsopphold-nb';

const Utenlandsopphold = (props: RevurderingStegProps) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...messages, ...revurderingmessages } });

    const initialValues = utenlandsoppholdVilkårTilFormDataEllerNy(
        props.revurdering.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold,
    );
    const form = useForm<UtenlandsoppholdVilkårFormData>({
        resolver: yupResolver(utenlandsoppholdFormSchema),
        defaultValues: initialValues,
    });
    const [status, lagre] = useAsyncActionCreator(lagreUtenlandsopphold);

    const handleSubmit = async (
        values: UtenlandsoppholdVilkårFormData,
        onSuccess: (r: InformasjonsRevurdering, nesteUrl: string) => void,
    ) => {
        lagre(
            {
                ...utenlandsoppholdFormDataTilRequest({
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
                    <UtenlandsoppholdForm
                        form={form}
                        minOgMaxPeriode={{
                            fraOgMed: new Date(props.revurdering.periode.fraOgMed),
                            tilOgMed: new Date(props.revurdering.periode.tilOgMed),
                        }}
                        neste={{
                            onClick: (values) =>
                                handleSubmit(
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
                            onClick: handleSubmit,
                            url: props.avsluttUrl,
                        }}
                        søknadsbehandlingEllerRevurdering={'Revurdering'}
                        {...props}
                    />
                ),
                right: (
                    <div>
                        <Heading level="2" size="large" spacing>
                            {formatMessage('eksisterende.vedtakinfo.tittel')}
                        </Heading>
                        {props.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold && (
                            <OppsummeringAvUtenlandsopphold
                                utenlandsopphold={props.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold}
                            />
                        )}
                    </div>
                ),
            }}
        </ToKolonner>
    );
};

export default Utenlandsopphold;
