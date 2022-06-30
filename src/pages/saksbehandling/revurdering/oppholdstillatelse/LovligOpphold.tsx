import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Delete } from '@navikt/ds-icons';
import { Button, Panel } from '@navikt/ds-react';
import React from 'react';
import { useForm, useFieldArray, Controller, FieldErrors } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { PeriodeForm } from '~src/components/formElements/FormElements';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import VilkårsResultatRadioGroup from '~src/components/vilkårsResultatRadioGroup/VilkårsresultatRadioGroup';
import { lagreLovligOppholdVilkår } from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { NullablePeriode } from '~src/types/Periode';
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

    const { control, handleSubmit, watch } = useForm<LovligOppholdVilkårForm>({
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

    const { fields, append, remove, update } = useFieldArray({
        name: 'lovligOpphold',
        control: control,
    });

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <form onSubmit={handleSubmit((values) => lagreLovligOpphold(values, 'neste'))}>
                        <ul>
                            {fields.map((el, idx) => {
                                return (
                                    <li key={el.id}>
                                        <Panel className={styles.periodePanel}>
                                            <div className={styles.periodeOgSøppelbøtteContainer}>
                                                <Controller
                                                    control={control}
                                                    name={`lovligOpphold.${idx}.periode`}
                                                    render={({ field, fieldState }) => (
                                                        <PeriodeForm
                                                            {...field}
                                                            onChange={(periode: NullablePeriode) =>
                                                                update(idx, {
                                                                    ...watch().lovligOpphold[idx],
                                                                    periode: periode,
                                                                })
                                                            }
                                                            minDate={{
                                                                fraOgMed: revurderingsperiode.fraOgMed,
                                                                tilOgMed: revurderingsperiode.tilOgMed,
                                                            }}
                                                            maxDate={{
                                                                fraOgMed: revurderingsperiode.fraOgMed,
                                                                tilOgMed: revurderingsperiode.tilOgMed,
                                                            }}
                                                            error={fieldState.error as FieldErrors<NullablePeriode>}
                                                            size="S"
                                                        />
                                                    )}
                                                />

                                                <Button
                                                    variant="secondary"
                                                    type="button"
                                                    onClick={() => remove(idx)}
                                                    size="small"
                                                    aria-label={formatMessage('knapp.fjernPeriode')}
                                                >
                                                    <Delete />
                                                </Button>
                                            </div>

                                            <VilkårsResultatRadioGroup
                                                navnOgIdx={`lovligOpphold.${idx}.resultat`}
                                                controller={control}
                                                legend={formatMessage('lovligOpphold.harSøkerLovligOpphold')}
                                            />
                                        </Panel>
                                    </li>
                                );
                            })}
                        </ul>
                        <div className={styles.nyPeriodeKnappContainer}>
                            <Button
                                variant="secondary"
                                type="button"
                                size="small"
                                onClick={() => append(getTomVurderingsperiodeLovligOpphold())}
                            >
                                {formatMessage('knapp.nyPeriode')}
                            </Button>
                        </div>
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
