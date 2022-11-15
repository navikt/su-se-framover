import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import OppsummeringAvLovligOppholdvilkår from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvLovligOpphold';
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
import { RevurderingStegProps } from '~src/types/Revurdering';

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

    const lagreLovligOpphold = (data: LovligOppholdVilkårFormData, onSuccess: () => void) => {
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
                if ((res as RevurderingOgFeilmeldinger).feilmeldinger.length === 0) {
                    onSuccess();
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
                        onFormSubmit={(values) =>
                            lagreLovligOpphold(
                                values,
                                props.onSuccessOverride
                                    ? () => props.onSuccessOverride!()
                                    : () => navigate(props.nesteUrl)
                            )
                        }
                        savingState={status}
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
