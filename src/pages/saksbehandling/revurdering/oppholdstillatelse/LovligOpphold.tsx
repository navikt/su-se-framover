import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';

import MultiPeriodeVelger from '~src/components/multiPeriodeVelger/MultiPeriodeVelger';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { RevurderingStegProps } from '~src/types/Revurdering';
import { parseIsoDateOnly } from '~src/utils/date/dateUtils';

import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';

import GjeldendeOppholdstillatelse from './GjeldendeLovligOpphold';
import {
    LovligOppholdVilkårForm,
    lovligOppholdSchemaValidation,
    VurderingsperioderLovligoppholdFormData,
    getTomVurderingsperiodeLovligOpphold,
} from './LovligOppholdUtils';

const Oppholdstillatelse = (props: RevurderingStegProps) => {
    const vurderinger = props.revurdering.grunnlagsdataOgVilkårsvurderinger.lovligOpphold?.vurderinger ?? [
        { periode: props.revurdering.periode, resultat: null },
    ];
    const revurderingsperiode = {
        fraOgMed: new Date(props.revurdering.periode.fraOgMed),
        tilOgMed: new Date(props.revurdering.periode.tilOgMed),
    };

    const { control, watch, setValue } = useForm<LovligOppholdVilkårForm>({
        resolver: yupResolver(lovligOppholdSchemaValidation),
        defaultValues: {
            lovligOpphold: vurderinger.map((vurdering) => ({
                periode: {
                    fraOgMed: parseIsoDateOnly(vurdering.periode.fraOgMed),
                    tilOgMed: parseIsoDateOnly(vurdering.periode.tilOgMed),
                },
                status: vurdering.resultat ?? null,
            })),
        },
    });

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <form>
                        <MultiPeriodeVelger
                            name="lovligOpphold"
                            controller={control}
                            watch={watch}
                            update={(idx: number, data: VurderingsperioderLovligoppholdFormData) => {
                                setValue(`lovligOpphold.${idx}`, data);
                            }}
                            periodeStuffs={{
                                minFraOgMed: revurderingsperiode.fraOgMed,
                                maxTilOgMed: revurderingsperiode.tilOgMed,
                                size: 'S',
                            }}
                            appendNyPeriode={getTomVurderingsperiodeLovligOpphold}
                        >
                            <p>hei</p>
                        </MultiPeriodeVelger>
                    </form>
                ),
                right: (
                    <GjeldendeOppholdstillatelse
                        gjeldendeOppholdstillatelse={props.grunnlagsdataOgVilkårsvurderinger.lovligOpphold}
                    />
                ),
            }}
        </ToKolonner>
    );
};

export default Oppholdstillatelse;
