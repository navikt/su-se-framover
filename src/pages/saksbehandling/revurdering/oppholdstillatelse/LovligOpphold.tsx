import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import OppsummeringAvLovligOppholdvilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvLovligOpphold';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import LovligOppholdForm from '~src/components/vilkårOgGrunnlagForms/lovligOpphold/LovligOppholdForm';
import {
    lovligOppholdFormDataTilRequest,
    lovligOppholdFormSchema,
    LovligOppholdVilkårFormData,
    lovligOppholdVilkårTilFormDataEllerNy,
} from '~src/components/vilkårOgGrunnlagForms/lovligOpphold/LovligOppholdFormUtils';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { InformasjonsRevurdering, RevurderingStegProps } from '~src/types/Revurdering';

import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';

import messages from './lovligOpphold-nb';

const LovligOpphold = (props: RevurderingStegProps) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [status, lagre] = useAsyncActionCreator(GrunnlagOgVilkårActions.lagreLovligOppholdVilkår);

    const revurderingsperiode = {
        fraOgMed: new Date(props.revurdering.periode.fraOgMed),
        tilOgMed: new Date(props.revurdering.periode.tilOgMed),
    };

    const form = useForm<LovligOppholdVilkårFormData>({
        resolver: yupResolver(lovligOppholdFormSchema),
        defaultValues: lovligOppholdVilkårTilFormDataEllerNy(
            props.revurdering.grunnlagsdataOgVilkårsvurderinger.lovligOpphold
        ),
    });

    const lagreLovligOpphold = (
        data: LovligOppholdVilkårFormData,
        onSuccess: (r: InformasjonsRevurdering, nesteUrl: string) => void
    ) => {
        lagre(
            {
                ...lovligOppholdFormDataTilRequest({
                    sakId: props.sakId,
                    behandlingId: props.revurdering.id,
                    vilkår: data,
                }),
                behandlingstype: Behandlingstype.Revurdering,
            },
            (res) => {
                const castedRes = res as RevurderingOgFeilmeldinger;
                if (castedRes.feilmeldinger.length === 0) {
                    onSuccess(castedRes.revurdering, props.nesteUrl);
                }
            }
        );
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <LovligOppholdForm
                        form={form}
                        minOgMaxPeriode={revurderingsperiode}
                        neste={{
                            savingState: status,
                            url: props.nesteUrl,
                            onClick: (values) =>
                                lagreLovligOpphold(
                                    values,
                                    props.onSuccessOverride
                                        ? (r) => props.onSuccessOverride!(r)
                                        : () => navigate(props.nesteUrl)
                                ),
                        }}
                        tilbake={{
                            url: props.onTilbakeClickOverride ? undefined : props.forrigeUrl,
                            onClick: props.onTilbakeClickOverride,
                        }}
                        fortsettSenere={{
                            url: props.avsluttUrl,
                        }}
                        søknadsbehandlingEllerRevurdering={'Revurdering'}
                        onTilbakeClickOverride={props.onTilbakeClickOverride}
                        {...props}
                    />
                ),
                right: (
                    <>
                        <Heading level="2" size="large" spacing>
                            {formatMessage('eksisterende.vedtakinfo.tittel')}
                        </Heading>
                        <OppsummeringAvLovligOppholdvilkår
                            lovligOpphold={props.grunnlagsdataOgVilkårsvurderinger.lovligOpphold}
                        />
                    </>
                ),
            }}
        </ToKolonner>
    );
};

export default LovligOpphold;
