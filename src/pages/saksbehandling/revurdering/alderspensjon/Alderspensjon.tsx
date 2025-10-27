
import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi.ts';
import { AlderspensjonForm } from '~src/components/forms/vilkårOgGrunnlagForms/alderspensjon/AlderspensjonForm.tsx';
import {
    AlderspensjonPeriodisertFormData,
    alderspensjonSchema,
    eqAlderspensjonPeriodisertFormData,
} from '~src/components/forms/vilkårOgGrunnlagForms/alderspensjon/AlderspensjonFormUtils.ts';
import { OppsummeringAvAlderspensjon } from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvAlderspensjon.tsx';
import ToKolonner from '~src/components/toKolonner/ToKolonner.tsx';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions.ts';
import { useAsyncActionCreator } from '~src/lib/hooks.ts';
import { useI18n } from '~src/lib/i18n.ts';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader.tsx';
import sharedMessages from '~src/pages/saksbehandling/søknadsbehandling/sharedI18n-nb.ts';
import { Aldersvurdering } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår.ts';
import { RevurderingStegProps } from '~src/types/Revurdering.ts';
import * as DateUtils from '~src/utils/date/dateUtils';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils.ts';

import messages from './alderspensjon-nb.ts';

const Alderspensjon = (props: RevurderingStegProps) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });

    const [lagreAlderspensjongrunnlagStatus, lagreAlderspensjongrunnlag] = useAsyncActionCreator(
        GrunnlagOgVilkårActions.lagreAlderspensjongrunnlag,
    );

    const initial = {
        alderspensjon:
            props.revurdering.grunnlagsdataOgVilkårsvurderinger.pensjon?.vurderinger.map((vurdering) => {
                return {
                    periode: {
                        fraOgMed: DateUtils.parseIsoDateOnly(vurdering.periode.fraOgMed),
                        tilOgMed: DateUtils.parseIsoDateOnly(vurdering.periode.tilOgMed),
                    },
                    folketrygd: vurdering.pensjonsopplysninger.folketrygd,
                    andreNorske: vurdering.pensjonsopplysninger.andreNorske,
                    utenlandske: vurdering.pensjonsopplysninger.utenlandske,
                };
            }) ?? [],
    };

    const form = useForm<AlderspensjonPeriodisertFormData>({
        defaultValues: initial,
        resolver: yupResolver(alderspensjonSchema),
    });

    const handleSave = (values: AlderspensjonPeriodisertFormData, onSuccess: () => void, navigerUrl: string) => {
        if (eqAlderspensjonPeriodisertFormData.equals(values, initial)) {
            navigate(navigerUrl);
            return;
        }
        lagreAlderspensjongrunnlag(
            {
                sakId: props.sakId,
                behandlingId: props.revurdering.id,
                vurderinger: values.alderspensjon.map((value) => {
                    return {
                        periode: {
                            fraOgMed: DateUtils.toIsoDateOnlyString(value.periode.fraOgMed!),
                            tilOgMed: DateUtils.toIsoDateOnlyString(value.periode.tilOgMed!),
                        },
                        pensjonsopplysninger: {
                            folketrygd: value.folketrygd ? value.folketrygd : null,
                            andreNorske: value.andreNorske ? value.andreNorske : null,
                            utenlandske: value.utenlandske ? value.utenlandske : null,
                        },
                    } as Aldersvurdering;
                }),
                behandlingstype: Behandlingstype.Revurdering,
            },
            onSuccess,
        );
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <AlderspensjonForm
                        form={form}
                        minOgMaxPeriode={lagDatePeriodeAvStringPeriode(props.revurdering.periode)}
                        neste={{
                            onClick: (values, onSuccess) => handleSave(values, onSuccess, props.nesteUrl),
                            url: props.nesteUrl,
                            savingState: lagreAlderspensjongrunnlagStatus,
                        }}
                        tilbake={{
                            url: props.forrigeUrl,
                        }}
                        lagreOgfortsettSenere={{
                            onClick: (values, onSuccess) => handleSave(values, onSuccess, props.avsluttUrl),
                            url: props.avsluttUrl,
                        }}
                        søknadsbehandlingEllerRevurdering={'Søknadsbehandling'}
                        {...props}
                    />
                ),
                right: (
                    <>
                        <Heading size="large" level="2" spacing>
                            {formatMessage('gjeldende.overskrift')}
                        </Heading>
                        <OppsummeringAvAlderspensjon alderspensjon={props.grunnlagsdataOgVilkårsvurderinger.pensjon} />
                    </>
                ),
            }}
        </ToKolonner>
    );
};

export default Alderspensjon;
