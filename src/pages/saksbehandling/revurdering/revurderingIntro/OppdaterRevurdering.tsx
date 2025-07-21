import { yupResolver } from '@hookform/resolvers/yup';
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
    OpprettetRevurdering,
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

    const initialValues = {
        periode: lagDatePeriodeAvStringPeriode(props.revurdering.periode),
        årsak: props.revurdering.årsak,
        omgjøringsgrunn: null,
        informasjonSomRevurderes: Object.keys(props.revurdering.informasjonSomRevurderes) as InformasjonSomRevurderes[],
        begrunnelse: props.revurdering.begrunnelse,
    };
    const form = useForm<RevurderingIntroFormData>({
        defaultValues: initialValues,
        resolver: yupResolver(revurderingIntroFormSchema),
    });

    const save = (
        values: RevurderingIntroFormData,
        onSuccess: (opprettetRevurdering: OpprettetRevurdering) => void,
    ) => {
        oppdater(
            {
                ...revurderingIntroFormDataTilOppdaterRequest({
                    sakId: props.sakId,
                    revurderingId: props.revurdering.id,
                    values,
                }),
            },
            onSuccess,
        );
    };

    const navigateTo = (opprettetRevurdering: OpprettetRevurdering, to: 'saksoversikt' | 'nesteSteg') => {
        if (to === 'saksoversikt') {
            navigate(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
        } else {
            navigate(nesteUrl(opprettetRevurdering));
        }
    };

    const nesteUrl = (revurdering: InformasjonsRevurdering) => {
        const grunnlagOgVilkårSeksjoner = lagVilkårOgGrunnlagSeksjon({
            sakId: props.sakId,
            r: revurdering,
        });
        return Routes.revurderingSeksjonSteg.createURL({
            sakId: props.sakId,
            revurderingId: revurdering.id,
            seksjon: grunnlagOgVilkårSeksjoner.id as RevurderingSeksjoner,
            steg: grunnlagOgVilkårSeksjoner.linjer[0].id as RevurderingSteg,
        });
    };

    return (
        <RevurderingIntroForm
            form={form}
            minOgMaxPeriode={props.minOgMaxPeriode}
            neste={{
                savingState: oppdaterStatus,
                onClick: (values) => save(values, (rev) => navigateTo(rev, 'nesteSteg')),
            }}
            tilbake={{ url: Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }) }}
            lagreOgfortsettSenere={{
                url: Routes.revurderValgtSak.createURL({ sakId: props.sakId }),
                onClick: (values) => save(values, (rev) => navigateTo(rev, 'saksoversikt')),
            }}
        />
    );
};

export default OppdaterRevurdering;
