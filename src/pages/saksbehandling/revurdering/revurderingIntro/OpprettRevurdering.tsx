import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import RevurderingIntroForm from '~src/components/forms/revurdering/RevurderingIntroForm';
import {
    RevurderingIntroFormData,
    revurderingIntroFormDataTilOpprettRequest,
    revurderingIntroFormSchema,
} from '~src/components/forms/revurdering/RevurderingIntroFormUtils';
import { opprettRevurdering } from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import { Periode } from '~src/types/Periode';
import { RevurderingSeksjoner, RevurderingSteg } from '~src/types/Revurdering';
import { lagTomPeriode } from '~src/utils/periode/periodeUtils';
import { lagVilkårOgGrunnlagSeksjon } from '~src/utils/revurdering/revurderingUtils';

const OpprettRevurdering = (props: { sakId: string; minOgMaxPeriode: Periode }) => {
    const navigate = useNavigate();
    const [opprettStatus, opprett] = useAsyncActionCreator(opprettRevurdering);

    const form = useForm<RevurderingIntroFormData>({
        defaultValues: {
            periode: lagTomPeriode(),
            årsak: null,
            omgjøringGrunn: null,
            informasjonSomRevurderes: [],
            begrunnelse: null,
        },
        resolver: yupResolver(revurderingIntroFormSchema),
    });

    const save = (values: RevurderingIntroFormData) => {
        opprett(
            { ...revurderingIntroFormDataTilOpprettRequest({ sakId: props.sakId, values }) },
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
                    }),
                );
            },
        );
    };

    return (
        <RevurderingIntroForm
            form={form}
            minOgMaxPeriode={props.minOgMaxPeriode}
            neste={{
                savingState: opprettStatus,
                onClick: save,
            }}
            tilbake={{ url: Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }) }}
            lagreOgfortsettSenere={{
                url: Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }),
                onClick: (values) =>
                    opprett({ ...revurderingIntroFormDataTilOpprettRequest({ sakId: props.sakId, values }) }, () =>
                        navigate(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })),
                    ),
            }}
        />
    );
};

export default OpprettRevurdering;
