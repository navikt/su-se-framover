import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import OppsummeringAvUførevilkår from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvUføre';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { UførhetForm } from '~src/components/vilkårOgGrunnlagForms/uførhet/UførhetForm';
import {
    UførhetFormData,
    lagTomUføreperiode,
    vurderingsperiodeTilFormData,
} from '~src/components/vilkårOgGrunnlagForms/uførhet/UførhetFormUtils';
import { uførhetSchema } from '~src/components/vilkårOgGrunnlagForms/uførhet/validation';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { RevurderingStegProps } from '~src/types/Revurdering';
import * as DateUtils from '~src/utils/date/dateUtils';
import { erGregulering } from '~src/utils/revurdering/revurderingUtils';

import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';

import messages from './uførhet-nb';

const Uførhet = (props: RevurderingStegProps) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    const form = useForm<UførhetFormData>({
        defaultValues: {
            grunnlag: props.revurdering.grunnlagsdataOgVilkårsvurderinger.uføre?.vurderinger.map((u) =>
                vurderingsperiodeTilFormData(u)
            ) ?? [lagTomUføreperiode()],
        },
        resolver: yupResolver(uførhetSchema(erGregulering(props.revurdering.årsak))),
    });

    const [status, lagre] = useAsyncActionCreator(GrunnlagOgVilkårActions.lagreUføregrunnlag);

    const handleSave = (values: UførhetFormData, onSuccess: () => void) =>
        lagre(
            {
                sakId: props.sakId,
                behandlingId: props.revurdering.id,
                vurderinger: values.grunnlag.map((g) => ({
                    periode: {
                        /* eslint-disable @typescript-eslint/no-non-null-assertion */
                        fraOgMed: DateUtils.toIsoDateOnlyString(g.periode.fraOgMed!),
                        tilOgMed: DateUtils.toIsoDateOnlyString(g.periode.tilOgMed!),
                        /* eslint-enable @typescript-eslint/no-non-null-assertion */
                    },
                    forventetInntekt: g.oppfylt ? Number.parseInt(g.forventetInntekt, 10) : null,
                    uføregrad: g.oppfylt ? Number.parseInt(g.uføregrad, 10) : null,
                    resultat: g.oppfylt ?? UføreResultat.HarUføresakTilBehandling,
                })),
                behandlingstype: Behandlingstype.Revurdering,
            },
            (res) => {
                if ((res as RevurderingOgFeilmeldinger).feilmeldinger.length === 0) {
                    onSuccess();
                }
            }
        );

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <UførhetForm
                        onFormSubmit={(values) =>
                            handleSave(
                                values,
                                props.onSuccessOverride
                                    ? () => props.onSuccessOverride!()
                                    : () => navigate(props.nesteUrl)
                            )
                        }
                        form={form}
                        savingState={status}
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
