import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import OppsummeringAvFastOppholdvilkår from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFastOpphold';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import FastOppholdForm from '~src/components/vilkårOgGrunnlagForms/fastOpphold/FastOppholdForm';
import {
    FastOppholdVilkårFormData,
    fastOppholdFormSchema,
    fastOppholdVilkårTilFormDataEllerNy,
    fastOppholdFormDataTilRequest,
} from '~src/components/vilkårOgGrunnlagForms/fastOpphold/FastOppholdFormUtils';
import { lagreFastOppholdVilkår } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import { RevurderingStegProps } from '~src/types/Revurdering';

import messages from './fastOpphold-nb';

export function FastOppholdPage(props: RevurderingStegProps) {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [status, lagre] = useAsyncActionCreator(lagreFastOppholdVilkår);

    const form = useForm<FastOppholdVilkårFormData>({
        resolver: yupResolver(fastOppholdFormSchema),
        defaultValues: fastOppholdVilkårTilFormDataEllerNy(
            props.revurdering.grunnlagsdataOgVilkårsvurderinger.fastOpphold
        ),
    });

    const lagreFastOpphold = (values: FastOppholdVilkårFormData, onSuccess: () => void) =>
        lagre(
            {
                ...fastOppholdFormDataTilRequest({
                    sakId: props.sakId,
                    behandlingId: props.revurdering.id,
                    vilkår: values,
                }),
                behandlingstype: Behandlingstype.Revurdering,
            },
            (res) => {
                if ((res as RevurderingOgFeilmeldinger).feilmeldinger.length === 0) {
                    onSuccess();
                }
            }
        );

    const revurderingsperiode = {
        fraOgMed: new Date(props.revurdering.periode.fraOgMed),
        tilOgMed: new Date(props.revurdering.periode.tilOgMed),
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <FastOppholdForm
                        form={form}
                        minOgMaxPeriode={revurderingsperiode}
                        onFormSubmit={(values) =>
                            lagreFastOpphold(
                                values,
                                props.onSuccessOverride
                                    ? () => props.onSuccessOverride!()
                                    : () => navigate(props.nesteUrl)
                            )
                        }
                        savingState={status}
                        søknadsbehandlingEllerRevurdering={'Revurdering'}
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
