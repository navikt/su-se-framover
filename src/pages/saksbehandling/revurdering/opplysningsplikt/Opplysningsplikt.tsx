import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import React from 'react';
import { useForm } from 'react-hook-form';

import OppsummeringAvOpplysningspliktvilkår from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvOpplysningsplikt';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import OpplysningspliktForm from '~src/components/vilkårOgGrunnlagForms/opplysningsplikt/OpplysningspliktForm';
import {
    opplysningspliktFormSchema,
    OpplysningspliktVilkårFormData,
} from '~src/components/vilkårOgGrunnlagForms/opplysningsplikt/OpplysningspliktFormUtils';
import { lagreOpplysningsplikt } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import { RevurderingStegProps } from '~src/types/Revurdering';
import { parseIsoDateOnly, sluttenAvMåneden, toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import messages from './opplysningsplikt-nb';
const Opplysningsplikt = (props: RevurderingStegProps) => {
    const { formatMessage } = useI18n({ messages });
    const [status, lagre] = useAsyncActionCreator(lagreOpplysningsplikt);

    const vurderinger = props.revurdering.grunnlagsdataOgVilkårsvurderinger.opplysningsplikt?.vurderinger ?? [
        { periode: props.revurdering.periode, beskrivelse: undefined },
    ];

    const revurderingsperiode = {
        fraOgMed: new Date(props.revurdering.periode.fraOgMed),
        tilOgMed: new Date(props.revurdering.periode.tilOgMed),
    };

    const form = useForm<OpplysningspliktVilkårFormData>({
        resolver: yupResolver(opplysningspliktFormSchema),
        defaultValues: {
            opplysningsplikt: vurderinger.map((vurdering) => ({
                periode: {
                    fraOgMed: parseIsoDateOnly(vurdering.periode.fraOgMed),
                    tilOgMed: parseIsoDateOnly(vurdering.periode.tilOgMed),
                },
                beskrivelse: vurdering.beskrivelse ?? null,
            })),
        },
    });

    const handleSubmit = async (form: OpplysningspliktVilkårFormData, onSuccess: () => void) => {
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
                if (res.feilmeldinger.length === 0) {
                    onSuccess();
                }
            }
        );
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <OpplysningspliktForm
                        form={form}
                        minOgMaxPeriode={revurderingsperiode}
                        onFormSubmit={handleSubmit}
                        savingState={status}
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
