import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import RevurderingIntroForm from '~src/components/forms/revurdering/RevurderingIntroForm';
import {
    RevurderingIntroFormData,
    revurderingIntroFormDataTilOppdaterRequest,
    revurderingIntroFormSchema,
} from '~src/components/forms/revurdering/RevurderingIntroFormUtils';
import { oppdaterRevurderingsPeriode } from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import { Periode } from '~src/types/Periode';
import {
    InformasjonSomRevurderes,
    InformasjonsRevurdering,
    RevurderingSeksjoner,
    RevurderingSteg,
} from '~src/types/Revurdering';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';
import { lagVilkårOgGrunnlagSeksjon } from '~src/utils/revurdering/revurderingUtils';

const OppdaterRevurdering = (props: {
    sakId: string;
    revurdering: InformasjonsRevurdering;
    minOgMaxPeriode: Periode;
}) => {
    const navigate = useNavigate();
    const [oppdaterStatus, oppdater] = useAsyncActionCreator(oppdaterRevurderingsPeriode);

    const form = useForm<RevurderingIntroFormData>({
        defaultValues: {
            periode: lagDatePeriodeAvStringPeriode(props.revurdering.periode),
            årsak: props.revurdering.årsak,
            informasjonSomRevurderes: Object.keys(
                props.revurdering.informasjonSomRevurderes
            ) as InformasjonSomRevurderes[],
            begrunnelse: props.revurdering.begrunnelse,
        },
        resolver: yupResolver(revurderingIntroFormSchema),
    });

    const save = (values: RevurderingIntroFormData) => {
        oppdater(
            {
                ...revurderingIntroFormDataTilOppdaterRequest({
                    sakId: props.sakId,
                    revurderingId: props.revurdering.id,
                    values,
                }),
            },
            (opprettetRevurdering) => {
                const grunnlagOgVilkårSeksjoner = lagVilkårOgGrunnlagSeksjon({
                    sakId: props.sakId,
                    r: opprettetRevurdering,
                });

                navigate(
                    Routes.revurderingSeksjonSteg.createURL({
                        sakId: props.sakId,
                        revurderingId: opprettetRevurdering.id,
                        seksjon: grunnlagOgVilkårSeksjoner.id as RevurderingSeksjoner,
                        steg: grunnlagOgVilkårSeksjoner.linjer[0].id as RevurderingSteg,
                    })
                );
            }
        );
    };

    return (
        <RevurderingIntroForm
            form={form}
            minOgMaxPeriode={props.minOgMaxPeriode}
            neste={{
                savingState: oppdaterStatus,
                onClick: save,
            }}
            tilbake={{ url: Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }) }}
            lagreOgfortsettSenere={{
                url: Routes.revurderValgtSak.createURL({ sakId: props.sakId }),
                onClick: (values) =>
                    oppdater(
                        {
                            ...revurderingIntroFormDataTilOppdaterRequest({
                                sakId: props.sakId,
                                revurderingId: props.revurdering.id,
                                values,
                            }),
                        },
                        () => navigate(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }))
                    ),
            }}
        />
    );
};

export default OppdaterRevurdering;
