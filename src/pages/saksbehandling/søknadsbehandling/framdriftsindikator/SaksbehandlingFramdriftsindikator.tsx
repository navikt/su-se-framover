import React from 'react';

import Framdriftsindikator, { Linjestatus } from '~src/components/framdriftsindikator/Framdriftsindikator';
import { useSøknadsbehandlingDraftContext } from '~src/context/søknadsbehandlingDraftContext';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Behandling } from '~src/types/Behandling';
import { Sakstype } from '~src/types/Sak';
import { Vilkårtype, VilkårVurderingStatus } from '~src/types/Vilkårsvurdering';
import {
    mapToVilkårsinformasjon,
    Vilkårsinformasjon,
    vilkårsinformasjonForBeregningssteg,
    vilkårTittelFormatted,
} from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import messages from './saksbehandlingFramdriftsindikator-nb';

const vilkårstatusTilLinjestatus = (s: VilkårVurderingStatus): Linjestatus => {
    switch (s) {
        case VilkårVurderingStatus.IkkeVurdert:
            return Linjestatus.Ingenting;
        case VilkårVurderingStatus.Uavklart:
            return Linjestatus.Uavklart;
        case VilkårVurderingStatus.IkkeOk:
            return Linjestatus.IkkeOk;
        case VilkårVurderingStatus.Ok:
            return Linjestatus.Ok;
    }
};

const SaksbehandlingFramdriftsindikator = (props: {
    sakId: string;
    behandling: Behandling;
    vilkår: Vilkårtype;
    sakstype: Sakstype;
}) => {
    const vilkårrekkefølge = mapToVilkårsinformasjon(
        props.sakstype,
        props.behandling.behandlingsinformasjon,
        props.behandling.grunnlagsdataOgVilkårsvurderinger
    );
    const beregningsrekkefølge = vilkårsinformasjonForBeregningssteg(props.behandling);
    const { intl } = useI18n({ messages });
    const { isDraftDirty } = useSøknadsbehandlingDraftContext();

    const vilkårUrl = (vt: Vilkårtype) =>
        Routes.saksbehandlingVilkårsvurdering.createURL({
            sakId: props.sakId,
            behandlingId: props.behandling.id,
            vilkar: vt,
        });

    const hentLinjerFraVilkårsinformasjon = (vilkårsinformasjon: Vilkårsinformasjon[]) => {
        return vilkårsinformasjon.map((v) => ({
            id: v.vilkårtype,
            erKlikkbar: v.erStartet,
            label: vilkårTittelFormatted(v.vilkårtype),
            status: isDraftDirty(v.vilkårtype) ? Linjestatus.Uferdig : vilkårstatusTilLinjestatus(v.status),
            url: vilkårUrl(v.vilkårtype),
        }));
    };

    return (
        <Framdriftsindikator
            aktivId={props.vilkår}
            elementer={[
                {
                    id: Vilkårtype.Virkningstidspunkt,
                    erKlikkbar: props.behandling.stønadsperiode !== null,
                    label: vilkårTittelFormatted(Vilkårtype.Virkningstidspunkt),
                    status: isDraftDirty(Vilkårtype.Virkningstidspunkt)
                        ? Linjestatus.Uferdig
                        : props.behandling.stønadsperiode
                        ? Linjestatus.Ok
                        : Linjestatus.Ingenting,
                    url: vilkårUrl(Vilkårtype.Virkningstidspunkt),
                },
                {
                    id: 'vilkår',
                    tittel: intl.formatMessage({ id: 'vilkår' }),
                    linjer: hentLinjerFraVilkårsinformasjon(vilkårrekkefølge),
                },
                {
                    id: 'beregning',
                    tittel: intl.formatMessage({ id: 'beregning' }),
                    linjer: hentLinjerFraVilkårsinformasjon(beregningsrekkefølge),
                },
            ]}
        />
    );
};

export default SaksbehandlingFramdriftsindikator;
