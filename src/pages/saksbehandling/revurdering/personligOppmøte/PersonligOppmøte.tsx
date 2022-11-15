import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import OppsummeringAvPersonligoppmøtevilkår from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvPersonligOppmøte';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import PersonligOppmøteForm from '~src/components/vilkårOgGrunnlagForms/personligOppmøte/PersonligOppmøteForm';
import {
    PersonligOppmøteVilkårFormData,
    personligOppmøteFormSchema,
    personligOppmøteVilkårTilFormDataEllerNy,
    personligOppmøteFormDataTilRequest,
} from '~src/components/vilkårOgGrunnlagForms/personligOppmøte/PersonligOppmøteFormUtils';
import { lagrePersonligOppmøteVilkår } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import { RevurderingStegProps } from '~src/types/Revurdering';

import messages from './personligOppmøte-nb';

export function PersonligOppmøte(props: RevurderingStegProps) {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [status, lagre] = useAsyncActionCreator(lagrePersonligOppmøteVilkår);

    const form = useForm<PersonligOppmøteVilkårFormData>({
        resolver: yupResolver(personligOppmøteFormSchema),
        defaultValues: personligOppmøteVilkårTilFormDataEllerNy(
            props.revurdering.grunnlagsdataOgVilkårsvurderinger.personligOppmøte
        ),
    });

    const lagrePersonligOppmøte = (values: PersonligOppmøteVilkårFormData, onSuccess?: () => void) =>
        lagre(
            {
                ...personligOppmøteFormDataTilRequest({
                    sakId: props.sakId,
                    behandlingId: props.revurdering.id,
                    vilkår: values,
                }),
                behandlingstype: Behandlingstype.Revurdering,
            },
            (res) => {
                if ((res as RevurderingOgFeilmeldinger).feilmeldinger.length === 0) {
                    onSuccess?.();
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
                    <PersonligOppmøteForm
                        form={form}
                        minOgMaxPeriode={revurderingsperiode}
                        onFormSubmit={(values) =>
                            lagrePersonligOppmøte(
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
                        <OppsummeringAvPersonligoppmøtevilkår
                            personligoppmøte={props.grunnlagsdataOgVilkårsvurderinger.personligOppmøte}
                        />
                    </>
                ),
            }}
        </ToKolonner>
    );
}
