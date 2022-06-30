import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import MultiPeriodeVelger from '~src/components/multiPeriodeVelger/MultiPeriodeVelger';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import VilkårsResultatRadioGroup from '~src/components/vilkårsResultatRadioGroup/VilkårsresultatRadioGroup';
import { lagreLovligOppholdVilkår } from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { RevurderingStegProps } from '~src/types/Revurdering';
import * as DateUtils from '~src/utils/date/dateUtils';
import { parseIsoDateOnly } from '~src/utils/date/dateUtils';

import { Navigasjonsknapper } from '../../bunnknapper/Navigasjonsknapper';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';

import GjeldendeOppholdstillatelse from './GjeldendeLovligOpphold';
import messages from './LovligOpphold-nb';
import styles from './lovligOpphold.module.less';
import {
    LovligOppholdVilkårForm,
    lovligOppholdSchemaValidation,
    getTomVurderingsperiodeLovligOpphold,
} from './LovligOppholdUtils';

const Oppholdstillatelse = (props: RevurderingStegProps) => {
    const { formatMessage } = useI18n({ messages });
    const navigate = useNavigate();
    const [lagreLovligOppholdStatus, lagreLovligOppholdAction] = useAsyncActionCreator(lagreLovligOppholdVilkår);

    const vurderinger = props.revurdering.grunnlagsdataOgVilkårsvurderinger.lovligOpphold?.vurderinger ?? [
        { periode: props.revurdering.periode, resultat: null },
    ];
    const revurderingsperiode = {
        fraOgMed: new Date(props.revurdering.periode.fraOgMed),
        tilOgMed: new Date(props.revurdering.periode.tilOgMed),
    };

    const { control, handleSubmit } = useForm<LovligOppholdVilkårForm>({
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

    const lagreLovligOpphold = (data: LovligOppholdVilkårForm, gåtil: 'neste' | 'avbryt') => {
        lagreLovligOppholdAction(
            {
                sakId: props.sakId,
                behandlingId: props.revurdering.id,
                vurderinger: data.lovligOpphold.map((opphold) => {
                    return {
                        periode: {
                            fraOgMed: DateUtils.toIsoDateOnlyString(opphold.periode.fraOgMed!),
                            tilOgMed: DateUtils.toIsoDateOnlyString(opphold.periode.tilOgMed!),
                        },
                        resultat: opphold.resultat!,
                    };
                }),
            },
            (res) => {
                if (res.feilmeldinger.length === 0) {
                    navigate(gåtil === 'neste' ? props.nesteUrl : props.avsluttUrl);
                }
            }
        );
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <form onSubmit={handleSubmit((values) => lagreLovligOpphold(values, 'neste'))}>
                        <MultiPeriodeVelger
                            className={styles.multiPeriodeVelger}
                            name={'lovligOpphold'}
                            controller={control}
                            appendNyPeriode={getTomVurderingsperiodeLovligOpphold}
                            periodeStuffs={{
                                minFraOgMed: revurderingsperiode.fraOgMed,
                                maxTilOgMed: revurderingsperiode.tilOgMed,
                                size: 'S',
                            }}
                            barn={(idx: number) => (
                                <VilkårsResultatRadioGroup
                                    navnOgIdx={`lovligOpphold.${idx}`}
                                    controller={control}
                                    legend={formatMessage('lovligOpphold.harSøkerLovligOpphold')}
                                />
                            )}
                        />
                        <Navigasjonsknapper
                            tilbake={props.forrige}
                            loading={RemoteData.isPending(lagreLovligOppholdStatus)}
                            onLagreOgFortsettSenereClick={handleSubmit((values) =>
                                lagreLovligOpphold(values, 'avbryt')
                            )}
                        />
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
