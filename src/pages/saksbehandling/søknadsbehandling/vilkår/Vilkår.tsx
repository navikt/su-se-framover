import React from 'react';
import { useOutletContext } from 'react-router-dom';

import Beregning from '~src/components/beregningOgSimulering/beregning/Beregning';
import { SøknadsbehandlingDraftProvider } from '~src/context/søknadsbehandlingDraftContext';
import * as Routes from '~src/lib/routes';
import Alderspensjon from '~src/pages/saksbehandling/søknadsbehandling/alderspensjon/Alderspensjon';
import Familieforening from '~src/pages/saksbehandling/søknadsbehandling/familieforening/Familieforening';
import { Sakstype } from '~src/types/Sak';
import { isAldersøknad, isUføresøknad } from '~src/types/Søknad';
import { Vilkårtype, VilkårtypeAlder } from '~src/types/Vilkårsvurdering';
import { erVilkårsvurderingerVurdertAvslag } from '~src/utils/behandling/behandlingUtils';
import { AttesteringContext } from '~src/utils/router/routerUtils';
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

const Vilkår = () => {
    const props = useOutletContext<AttesteringContext>();
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

    const sakstype = behandling.søknad.søknadInnhold.type;

    return (
        <SøknadsbehandlingDraftProvider>
            <div className={styles.container}>
                <SaksbehandlingFramdriftsindikator
                    sakId={props.sak.id}
                    behandling={behandling}
                    vilkår={vilkar}
                    sakstype={sakstype}
                />
                <div className={styles.content}>
                    {vilkar === Vilkårtype.Virkningstidspunkt && (
                        <Virkningstidspunkt
                            behandling={behandling}
                            forrigeUrl={saksoversiktUrl}
                            nesteUrl={
                                sakstype === Sakstype.Uføre
                                    ? vilkårUrl(Vilkårtype.Uførhet)
                                    : vilkårUrl(Vilkårtype.Alderspensjon)
                            }
                            sakId={sakId}
                        />
                    )}
                    {vilkar === VilkårtypeAlder.Alderspensjon && isAldersøknad(behandling.søknad.søknadInnhold) && (
                        <Alderspensjon
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Virkningstidspunkt)}
                            nesteUrl={vilkårUrl(Vilkårtype.Familieforening)}
                            søknadInnhold={behandling.søknad.søknadInnhold}
                            sakId={sakId}
                        />
                    )}
                    {vilkar === VilkårtypeAlder.Familieforening && isAldersøknad(behandling.søknad.søknadInnhold) && (
                        <Familieforening
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Alderspensjon)}
                            nesteUrl={vilkårUrl(Vilkårtype.LovligOpphold)}
                            søknadInnhold={behandling.søknad.søknadInnhold}
                            sakId={sakId}
                        />
                    )}
                    {vilkar === Vilkårtype.Uførhet && isUføresøknad(behandling.søknad.søknadInnhold) && (
                        <Uførhet
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Virkningstidspunkt)}
                            nesteUrl={vilkårUrl(Vilkårtype.Flyktning)}
                            søknadInnhold={behandling.søknad.søknadInnhold}
                            sakId={sakId}
                        />
                    )}
                    {vilkar === Vilkårtype.Flyktning && isUføresøknad(behandling.søknad.søknadInnhold) && (
                        <Flyktning
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Uførhet)}
                            nesteUrl={vilkårUrl(Vilkårtype.LovligOpphold)}
                            søknadInnhold={behandling.søknad.søknadInnhold}
                            sakId={sakId}
                        />
                    )}
                    {vilkar === Vilkårtype.LovligOpphold && (
                        <LovligOppholdINorge
                            behandling={behandling}
                            forrigeUrl={
                                isAldersøknad(behandling.søknad.søknadInnhold)
                                    ? vilkårUrl(Vilkårtype.Familieforening)
                                    : vilkårUrl(Vilkårtype.Flyktning)
                            }
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
