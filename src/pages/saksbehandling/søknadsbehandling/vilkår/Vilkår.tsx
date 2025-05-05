import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

import { gjeldendeVedtaksdataTidligerePeriode } from '~src/api/behandlingApi';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { SøknadsbehandlingDraftProvider } from '~src/context/søknadsbehandlingDraftContext';
import { useApiCall } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import Alderspensjon from '~src/pages/saksbehandling/søknadsbehandling/alderspensjon/Alderspensjon';
import Beregning from '~src/pages/saksbehandling/søknadsbehandling/beregning/Beregning';
import Familieforening from '~src/pages/saksbehandling/søknadsbehandling/familieforening/Familieforening';
import { Sakstype } from '~src/types/Sak';
import { Vilkårtype, VilkårtypeAlder } from '~src/types/Vilkårsvurdering';
import { isAldersøknad, isUføresøknad } from '~src/utils/søknad/søknadUtils';
import { erVilkårsvurderingerVurdertAvslag } from '~src/utils/SøknadsbehandlingUtils';
import { createVilkårUrl } from '~src/utils/vilkårUtils';

import Bosituasjon from '../bosituasjon/Bosituasjon';
import FastOppholdINorge from '../fast-opphold-i-norge/FastOppholdINorge';
import Flyktning from '../flyktning/Flyktning';
import Formue from '../formue/Formue';
import SaksbehandlingFramdriftsindikator from '../framdriftsindikator/SaksbehandlingFramdriftsindikator';
import Institusjonsopphold from '../institusjonsopphold/Institusjonsopphold';
import LovligOppholdINorge from '../lovlig-opphold-i-norge/LovligOppholdINorge';
import OppholdIUtlandet from '../opphold-i-utlandet/OppholdIUtlandet';
import PersonligOppmøte from '../personlig-oppmøte/PersonligOppmøte';
import Uførhet from '../uførhet/Uførhet';
import Virkningstidspunkt from '../virkningstidspunkt/Virkningstidspunkt';

import styles from './vilkår.module.less';

const Vilkår = () => {
    const props = useOutletContext<SaksoversiktContext>();
    const {
        vilkar = Vilkårtype.Virkningstidspunkt,
        sakId,
        behandlingId,
    } = Routes.useRouteParams<typeof Routes.saksbehandlingVilkårsvurdering>();
    const behandling = props.sak.behandlinger.find((b) => b.id === behandlingId);
    const [hentGjeldendeVedtaksdataForTidligerePeriodeStatus, hentGjeldendeVedtaksdataForTidligerePeriode] = useApiCall(
        gjeldendeVedtaksdataTidligerePeriode,
    );

    if (!(behandling && sakId && behandlingId)) {
        return <div>404</div>;
    }

    const vilkårUrl = (vilkårType: Vilkårtype) =>
        createVilkårUrl({
            behandlingId: behandlingId,
            sakId: sakId,
            vilkar: vilkårType,
        });

    const vedtakUrl = Routes.saksbehandlingSendTilAttestering.createURL({ sakId: sakId, behandlingId: behandling.id });

    const saksoversiktUrl = Routes.saksoversiktValgtSak.createURL({ sakId: sakId });

    const avsluttUrl = Routes.saksoversiktValgtSak.createURL({ sakId: sakId });

    useEffect(() => {
        hentGjeldendeVedtaksdataForTidligerePeriode({
            sakId: sakId,
            behandlingId: behandling.id,
        });
    }, []);

    return (
        <SøknadsbehandlingDraftProvider>
            <div className={styles.container}>
                <SaksbehandlingFramdriftsindikator
                    sakId={props.sak.id}
                    behandling={behandling}
                    vilkår={vilkar}
                    sakstype={props.sak.sakstype}
                />
                <div className={styles.content}>
                    {vilkar === Vilkårtype.Virkningstidspunkt && (
                        <Virkningstidspunkt
                            behandling={behandling}
                            forrigeUrl={saksoversiktUrl}
                            avsluttUrl={avsluttUrl}
                            nesteUrl={
                                props.sak.sakstype === Sakstype.Uføre
                                    ? vilkårUrl(Vilkårtype.Uførhet)
                                    : vilkårUrl(Vilkårtype.Familieforening)
                            }
                            sakId={sakId}
                            tidligerePeriodeData={hentGjeldendeVedtaksdataForTidligerePeriodeStatus}
                        />
                    )}
                    {vilkar === VilkårtypeAlder.Familieforening && isAldersøknad(behandling.søknad.søknadInnhold) && (
                        <Familieforening
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Virkningstidspunkt)}
                            nesteUrl={vilkårUrl(Vilkårtype.Alderspensjon)}
                            avsluttUrl={avsluttUrl}
                            søknadInnhold={behandling.søknad.søknadInnhold}
                            sakId={sakId}
                            tidligerePeriodeData={hentGjeldendeVedtaksdataForTidligerePeriodeStatus}
                        />
                    )}
                    {vilkar === VilkårtypeAlder.Alderspensjon && isAldersøknad(behandling.søknad.søknadInnhold) && (
                        <Alderspensjon
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Familieforening)}
                            nesteUrl={vilkårUrl(Vilkårtype.LovligOpphold)}
                            avsluttUrl={avsluttUrl}
                            sakId={sakId}
                            tidligerePeriodeData={hentGjeldendeVedtaksdataForTidligerePeriodeStatus}
                        />
                    )}
                    {vilkar === Vilkårtype.Uførhet && isUføresøknad(behandling.søknad.søknadInnhold) && (
                        <Uførhet
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Virkningstidspunkt)}
                            nesteUrl={vilkårUrl(Vilkårtype.Flyktning)}
                            avsluttUrl={avsluttUrl}
                            søknadInnhold={behandling.søknad.søknadInnhold}
                            sakId={sakId}
                            tidligerePeriodeData={hentGjeldendeVedtaksdataForTidligerePeriodeStatus}
                        />
                    )}
                    {vilkar === Vilkårtype.Flyktning && isUføresøknad(behandling.søknad.søknadInnhold) && (
                        <Flyktning
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Uførhet)}
                            nesteUrl={vilkårUrl(Vilkårtype.LovligOpphold)}
                            avsluttUrl={avsluttUrl}
                            søknadInnhold={behandling.søknad.søknadInnhold}
                            sakId={sakId}
                            tidligerePeriodeData={hentGjeldendeVedtaksdataForTidligerePeriodeStatus}
                        />
                    )}
                    {vilkar === Vilkårtype.LovligOpphold && (
                        <LovligOppholdINorge
                            behandling={behandling}
                            forrigeUrl={
                                isAldersøknad(behandling.søknad.søknadInnhold)
                                    ? vilkårUrl(Vilkårtype.Alderspensjon)
                                    : vilkårUrl(Vilkårtype.Flyktning)
                            }
                            nesteUrl={vilkårUrl(Vilkårtype.FastOppholdINorge)}
                            avsluttUrl={avsluttUrl}
                            sakId={sakId}
                            tidligerePeriodeData={hentGjeldendeVedtaksdataForTidligerePeriodeStatus}
                        />
                    )}
                    {vilkar === Vilkårtype.FastOppholdINorge && (
                        <FastOppholdINorge
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.LovligOpphold)}
                            nesteUrl={vilkårUrl(Vilkårtype.Institusjonsopphold)}
                            avsluttUrl={avsluttUrl}
                            sakId={sakId}
                            tidligerePeriodeData={hentGjeldendeVedtaksdataForTidligerePeriodeStatus}
                        />
                    )}
                    {vilkar === Vilkårtype.Institusjonsopphold && (
                        <Institusjonsopphold
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.FastOppholdINorge)}
                            nesteUrl={vilkårUrl(Vilkårtype.OppholdIUtlandet)}
                            avsluttUrl={avsluttUrl}
                            sakId={sakId}
                            tidligerePeriodeData={hentGjeldendeVedtaksdataForTidligerePeriodeStatus}
                        />
                    )}
                    {vilkar === Vilkårtype.OppholdIUtlandet && (
                        <OppholdIUtlandet
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Institusjonsopphold)}
                            nesteUrl={vilkårUrl(Vilkårtype.Bosituasjon)}
                            avsluttUrl={avsluttUrl}
                            sakId={sakId}
                            tidligerePeriodeData={hentGjeldendeVedtaksdataForTidligerePeriodeStatus}
                        />
                    )}
                    {vilkar === Vilkårtype.Bosituasjon && (
                        <Bosituasjon
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.OppholdIUtlandet)}
                            nesteUrl={vilkårUrl(Vilkårtype.Formue)}
                            avsluttUrl={avsluttUrl}
                            sakId={sakId}
                            tidligerePeriodeData={hentGjeldendeVedtaksdataForTidligerePeriodeStatus}
                            søker={props.søker}
                        />
                    )}
                    {vilkar === Vilkårtype.Formue && (
                        <Formue
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Bosituasjon)}
                            søker={props.søker}
                            nesteUrl={vilkårUrl(Vilkårtype.PersonligOppmøte)}
                            avsluttUrl={avsluttUrl}
                            sakId={sakId}
                            tidligerePeriodeData={hentGjeldendeVedtaksdataForTidligerePeriodeStatus}
                        />
                    )}
                    {vilkar === Vilkårtype.PersonligOppmøte && (
                        <PersonligOppmøte
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Formue)}
                            nesteUrl={
                                erVilkårsvurderingerVurdertAvslag(behandling)
                                    ? vedtakUrl
                                    : vilkårUrl(Vilkårtype.Beregning)
                            }
                            avsluttUrl={avsluttUrl}
                            sakstype={props.sak.sakstype}
                            sakId={sakId}
                            tidligerePeriodeData={hentGjeldendeVedtaksdataForTidligerePeriodeStatus}
                        />
                    )}
                    {vilkar === Vilkårtype.Beregning && (
                        <Beregning
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.PersonligOppmøte)}
                            nesteUrl={vedtakUrl}
                            avsluttUrl={avsluttUrl}
                            sakId={sakId}
                            søker={props.søker}
                            tidligerePeriodeData={hentGjeldendeVedtaksdataForTidligerePeriodeStatus}
                        />
                    )}
                </div>
            </div>
        </SøknadsbehandlingDraftProvider>
    );
};

export default Vilkår;
