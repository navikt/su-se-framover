import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import React from 'react';
import { useForm } from 'react-hook-form';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import { Utenlandsoppsummering } from '~src/components/revurdering/oppsummering/utenlandsopphold/Utenlandsoppsummering';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import UtenlandsoppholdForm from '~src/components/vilkårForms/utenlandsopphold/UtenlandsoppholdForm';
import {
    utenlandsoppholdFormSchema,
    UtenlandsoppholdVilkårFormData,
    utenlandsoppholdFormDataTilRequest,
    utenlandsoppholdVilkårTilFormDataEllerNy,
} from '~src/components/vilkårForms/utenlandsopphold/UtenlandsoppholdFormUtils';
import { lagreUtenlandsopphold } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import revurderingmessages, { stegmessages } from '~src/pages/saksbehandling/revurdering/revurdering-nb';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import { RevurderingStegProps } from '~src/types/Revurdering';

import messages from './utenlandsopphold-nb';

const Utenlandsopphold = (props: RevurderingStegProps) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...stegmessages, ...revurderingmessages } });

    const form = useForm<UtenlandsoppholdVilkårFormData>({
        resolver: yupResolver(utenlandsoppholdFormSchema),
        defaultValues: utenlandsoppholdVilkårTilFormDataEllerNy(
            props.revurdering.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold
        ),
    });
    const [status, lagre] = useAsyncActionCreator(lagreUtenlandsopphold);

    const handleSubmit = async (values: UtenlandsoppholdVilkårFormData, onSuccess: () => void) => {
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
                if ((res as RevurderingOgFeilmeldinger).feilmeldinger.length === 0) {
                    onSuccess();
                }
            }
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
                    <UtenlandsoppholdForm
                        form={form}
                        minOgMaxPeriode={revurderingsperiode}
                        onFormSubmit={handleSubmit}
                        savingState={status}
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
                            <Utenlandsoppsummering
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
