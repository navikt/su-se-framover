import React from 'react';

import { Person } from '~src/api/personApi';
import Beregning from '~src/components/beregningOgSimulering/beregning/Beregning';
import { SøknadsbehandlingDraftProvider } from '~src/context/søknadsbehandlingDraftContext';
import * as Routes from '~src/lib/routes';
import { Sak } from '~src/types/Sak';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { erVilkårsvurderingerVurdertAvslag } from '~src/utils/behandling/behandlingUtils';
import { createVilkårUrl } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import FastOppholdINorge from '../fast-opphold-i-norge/FastOppholdINorge';
import Flyktning from '../flyktning/Flyktning';
import Formue from '../formue/Formue';
import SaksbehandlingFramdriftsindikator from '../framdriftsindikator/SaksbehandlingFramdriftsindikator';
import Institusjonsopphold from '../institusjonsopphold/Institusjonsopphold';
import LovligOppholdINorge from '../lovlig-opphold-i-norge/LovligOppholdINorge';
import OppholdIUtlandet from '../opphold-i-utlandet/OppholdIUtlandet';
import PersonligOppmøte from '../personlig-oppmøte/PersonligOppmøte';
import Sats from '../sats/Sats';
import Uførhet from '../uførhet/Uførhet';
import Virkningstidspunkt from '../virkningstidspunkt/Virkningstidspunkt';

import * as styles from './vilkår.module.less';

const Vilkår = (props: { sak: Sak; søker: Person }) => {
    const {
        vilkar = Vilkårtype.Virkningstidspunkt,
        sakId,
        behandlingId,
    } = Routes.useRouteParams<typeof Routes.saksbehandlingVilkårsvurdering>();
    const behandling = props.sak.behandlinger.find((b) => b.id === behandlingId);

    if (!(behandling && sakId && behandlingId)) {
        return <div>404</div>;
    }

    const vilkårUrl = (vilkårType: Vilkårtype) =>
        createVilkårUrl({
            behandlingId: behandlingId,
            sakId: sakId,
            vilkar: vilkårType,
        });

    const vedtakUrl = Routes.saksbehandlingSendTilAttestering.createURL({
        sakId: sakId,
        behandlingId: behandling.id,
    });

    const saksoversiktUrl = Routes.saksoversiktValgtSak.createURL({
        sakId: sakId,
    });

    return (
        <SøknadsbehandlingDraftProvider>
            <div className={styles.container}>
                <SaksbehandlingFramdriftsindikator sakId={props.sak.id} behandling={behandling} vilkår={vilkar} />
                <div className={styles.content}>
                    {vilkar === Vilkårtype.Virkningstidspunkt && (
                        <Virkningstidspunkt
                            behandling={behandling}
                            forrigeUrl={saksoversiktUrl}
                            nesteUrl={vilkårUrl(Vilkårtype.Uførhet)}
                            sakId={sakId}
                        />
                    )}
                    {vilkar === Vilkårtype.Uførhet && (
                        <Uførhet
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Virkningstidspunkt)}
                            nesteUrl={vilkårUrl(Vilkårtype.Flyktning)}
                            sakId={sakId}
                        />
                    )}
                    {vilkar === Vilkårtype.Flyktning && (
                        <Flyktning
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Uførhet)}
                            nesteUrl={vilkårUrl(Vilkårtype.LovligOpphold)}
                            sakId={sakId}
                        />
                    )}
                    {vilkar === Vilkårtype.LovligOpphold && (
                        <LovligOppholdINorge
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Flyktning)}
                            nesteUrl={vilkårUrl(Vilkårtype.FastOppholdINorge)}
                            sakId={sakId}
                        />
                    )}
                    {vilkar === Vilkårtype.FastOppholdINorge && (
                        <FastOppholdINorge
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.LovligOpphold)}
                            nesteUrl={vilkårUrl(Vilkårtype.Institusjonsopphold)}
                            sakId={sakId}
                        />
                    )}
                    {vilkar === Vilkårtype.Institusjonsopphold && (
                        <Institusjonsopphold
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.FastOppholdINorge)}
                            nesteUrl={vilkårUrl(Vilkårtype.OppholdIUtlandet)}
                            sakId={sakId}
                        />
                    )}
                    {vilkar === Vilkårtype.OppholdIUtlandet && (
                        <OppholdIUtlandet
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Institusjonsopphold)}
                            nesteUrl={vilkårUrl(Vilkårtype.Formue)}
                            sakId={sakId}
                        />
                    )}
                    {vilkar === Vilkårtype.Formue && (
                        <Formue
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.OppholdIUtlandet)}
                            søker={props.søker}
                            nesteUrl={vilkårUrl(Vilkårtype.PersonligOppmøte)}
                            sakId={sakId}
                        />
                    )}
                    {vilkar === Vilkårtype.PersonligOppmøte && (
                        <PersonligOppmøte
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Formue)}
                            nesteUrl={vilkårUrl(Vilkårtype.Sats)}
                            sakId={sakId}
                        />
                    )}
                    {vilkar === Vilkårtype.Sats && (
                        <Sats
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.PersonligOppmøte)}
                            nesteUrl={
                                erVilkårsvurderingerVurdertAvslag(behandling)
                                    ? vedtakUrl
                                    : vilkårUrl(Vilkårtype.Beregning)
                            }
                            sakId={sakId}
                        />
                    )}
                    {vilkar === Vilkårtype.Beregning && (
                        <Beregning
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Sats)}
                            nesteUrl={vedtakUrl}
                            sakId={sakId}
                        />
                    )}
                </div>
            </div>
        </SøknadsbehandlingDraftProvider>
    );
};

export default Vilkår;
