import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { Heading } from '~node_modules/@navikt/ds-react';
import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi.ts';
import {
    FamilieforeningFormData,
    familieforeningSchema,
} from '~src/components/forms/vilkårOgGrunnlagForms/familieforening/FamilieforeningFormUtils.ts';
import { FamiliegjenforeningForm } from '~src/components/forms/vilkårOgGrunnlagForms/familieforening/FamiliegjenforeningForm.tsx';
import ToKolonner from '~src/components/toKolonner/ToKolonner.tsx';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions.ts';
import { useAsyncActionCreator } from '~src/lib/hooks.ts';
import { useI18n } from '~src/lib/i18n.ts';
import messages from '~src/pages/saksbehandling/revurdering/alderspensjon/alderspensjon-nb.ts';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader.tsx';
import sharedMessages from '~src/pages/saksbehandling/søknadsbehandling/sharedI18n-nb.ts';
import { FamiliegjenforeningPeriode } from '~src/types/grunnlagsdataOgVilkårsvurderinger/familieforening/Familieforening.ts';
import { RevurderingStegProps } from '~src/types/Revurdering.ts';
import * as DateUtils from '~src/utils/date/dateUtils';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils.ts';

const Familiegjenforening = (props: RevurderingStegProps) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });

    const [lagreFamilieforeninggrunnlagStatus, lagreFamilieforeninggrunnlag] = useAsyncActionCreator(
        GrunnlagOgVilkårActions.lagreFamilieforeninggrunnlag,
    );

    const handleSave = (values: FamilieforeningFormData, onSuccess: () => void) =>
        lagreFamilieforeninggrunnlag(
            {
                sakId: props.sakId,
                behandlingId: props.revurdering.id,
                vurderinger: values.familiegjenforening.map((value) => {
                    return {
                        periode: {
                            fraOgMed: DateUtils.toIsoDateOnlyString(value.periode.fraOgMed!),
                            tilOgMed: DateUtils.toIsoDateOnlyString(value.periode.tilOgMed!),
                        },
                        status: value.familiegjenforening,
                    } as FamiliegjenforeningPeriode;
                }),
                behandlingstype: Behandlingstype.Revurdering,
            },
            onSuccess,
        );

    const form = useForm<FamilieforeningFormData>({
        defaultValues: {
            familiegjenforening:
                props.revurdering.grunnlagsdataOgVilkårsvurderinger.familiegjenforening?.vurderinger.map(
                    (vurdering) => {
                        return {
                            periode: {
                                fraOgMed: DateUtils.parseIsoDateOnly(vurdering.periode.fraOgMed),
                                tilOgMed: DateUtils.parseIsoDateOnly(vurdering.periode.tilOgMed),
                            },
                            familiegjenforening: vurdering.resultat,
                        };
                    },
                ) ?? [],
        },
        resolver: yupResolver(familieforeningSchema),
    });
    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <FamiliegjenforeningForm
                        form={form}
                        minOgMaxPeriode={lagDatePeriodeAvStringPeriode(props.revurdering.periode)}
                        neste={{
                            onClick: (values, onSuccess) => handleSave(values, onSuccess),
                            url: props.nesteUrl,
                            savingState: lagreFamilieforeninggrunnlagStatus,
                        }}
                        tilbake={{
                            url: props.forrigeUrl,
                        }}
                        lagreOgfortsettSenere={{
                            onClick: (values, onSuccess) => handleSave(values, onSuccess),
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
                    </>
                ),
            }}
        </ToKolonner>
    );
};

export default Familiegjenforening;
