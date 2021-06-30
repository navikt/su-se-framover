import React from 'react';

import Framdriftsindikator, { Linjestatus } from '~components/framdriftsindikator/Framdriftsindikator';
import {
    vilkårTittelFormatted,
    mapToVilkårsinformasjon,
    vilkårsinformasjonForBeregningssteg,
} from '~features/saksoversikt/utils';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Behandling } from '~types/Behandling';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';

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

const SaksbehandlingFramdriftsindikator = (props: { sakId: string; behandling: Behandling; vilkår: Vilkårtype }) => {
    const { behandlingsinformasjon } = props.behandling;
    const vilkårrekkefølge = mapToVilkårsinformasjon(behandlingsinformasjon);
    const beregningsrekkefølge = vilkårsinformasjonForBeregningssteg(props.behandling);
    const { intl } = useI18n({ messages });

    const vilkårUrl = (vt: Vilkårtype) =>
        Routes.saksbehandlingVilkårsvurdering.createURL({
            sakId: props.sakId,
            behandlingId: props.behandling.id,
            vilkar: vt,
        });

    return (
        <Framdriftsindikator
            aktivId={props.vilkår}
            elementer={[
                {
                    id: Vilkårtype.Virkningstidspunkt,
                    erKlikkbar: props.behandling.stønadsperiode !== null,
                    label: vilkårTittelFormatted(Vilkårtype.Virkningstidspunkt),
                    status: props.behandling.stønadsperiode ? Linjestatus.Ok : Linjestatus.Ingenting,
                    url: vilkårUrl(Vilkårtype.Virkningstidspunkt),
                },
                {
                    id: 'vilkår',
                    tittel: intl.formatMessage({ id: 'vilkår' }),
                    linjer: vilkårrekkefølge.map((v) => ({
                        id: v.vilkårtype,
                        erKlikkbar: v.erStartet,
                        label: vilkårTittelFormatted(v.vilkårtype),
                        status: vilkårstatusTilLinjestatus(v.status),
                        url: vilkårUrl(v.vilkårtype),
                    })),
                },
                {
                    id: 'beregning',
                    tittel: intl.formatMessage({ id: 'beregning' }),
                    linjer: beregningsrekkefølge.map((v) => ({
                        id: v.vilkårtype,
                        erKlikkbar: v.erStartet,
                        label: vilkårTittelFormatted(v.vilkårtype),
                        status: vilkårstatusTilLinjestatus(v.status),
                        url: vilkårUrl(v.vilkårtype),
                    })),
                },
            ]}
        />
    );
};

export default SaksbehandlingFramdriftsindikator;
