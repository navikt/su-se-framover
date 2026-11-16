import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Loader } from '@navikt/ds-react';
import classNames from 'classnames';
import { useEffect } from 'react';
import { fetchPerson } from '~src/api/personApi.ts';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert.tsx';
import { useApiCall } from '~src/lib/hooks.ts';
import { useI18n } from '~src/lib/i18n';
import { Periode } from '~src/types/Periode.ts';
import { Person } from '~src/types/Person.ts';
import { Sakstype } from '~src/types/Sak.ts';
import { Søknadsbehandling, SøknadsbehandlingStatus } from '~src/types/Søknadsbehandling.ts';
import { formatDate, parseValidIsoDateOnly } from '~src/utils/date/dateUtils';
import { formatPeriode, lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';
import { fyller67ILøpetAvPeriode } from '~src/utils/person/personUtils.ts';
import { søknadMottatt } from '~src/utils/søknad/søknadUtils';
import UnderkjenteAttesteringer from '../../underkjenteAttesteringer/UnderkjenteAttesteringer';
import UføreVarsler from '../OppsummeringAvAldersvurdering/OppsummeringAvAldersvurdering';
import OppsummeringAvBeregningOgSimulering from '../oppsummeringAvBeregningOgsimulering/OppsummeringAvBeregningOgSimulering';
import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';
import Oppsummeringspanel, { Oppsummeringsfarge, Oppsummeringsikon } from '../oppsummeringspanel/Oppsummeringspanel';
import SidestiltOppsummeringAvVilkårOgGrunnlag from '../sidestiltOppsummeringAvVilkårOgGrunnlag/SidestiltOppsummeringAvVilkårOgGrunnlag';
import styles from './OppsummeringAvSøknadsbehandling.module.less';
import messages from './OppsummeringAvSøknadsbehandling-nb.ts';

const OppsummeringAvSøknadsbehandling = (props: { behandling: Søknadsbehandling; skjulEpsVarsel?: boolean }) => {
    const { formatMessage } = useI18n({ messages });

    const [epsStatus, hentEps] = useApiCall(fetchPerson);
    const epsFnr = props.behandling.grunnlagsdataOgVilkårsvurderinger.bosituasjon[0]?.fnr;
    useEffect(() => {
        if (epsFnr && props.behandling.status === SøknadsbehandlingStatus.TIL_ATTESTERING_INNVILGET) {
            hentEps({ fnr: epsFnr, sakstype: props.behandling.sakstype });
        }
    }, [epsFnr, props.behandling.status, props.behandling.sakstype, hentEps]);

    const underkjenteAttesteringer = props.behandling.attesteringer.filter((att) => att.underkjennelse != null);
    const innsendtAv = props.behandling.søknad.innsendtAv;
    return (
        <div className={styles.oppsummeringsContainer}>
            <Oppsummeringspanel
                ikon={Oppsummeringsikon.Liste}
                farge={Oppsummeringsfarge.Lilla}
                tittel={formatMessage('oppsummering.søknadsbehandling')}
            >
                <div className={classNames({ [styles.headerContainer]: underkjenteAttesteringer.length > 0 })}>
                    <div className={styles.tilleggsinfoContainer}>
                        <OppsummeringPar
                            label={formatMessage('vurdering.tittel')}
                            verdi={formatMessage(props.behandling.status)}
                            retning={'vertikal'}
                        />
                        <OppsummeringPar
                            label={formatMessage('behandlet.av')}
                            verdi={props.behandling.saksbehandler ?? formatMessage('feil.fantIkkeSaksbehandlerNavn')}
                            retning={'vertikal'}
                        />
                        <OppsummeringPar
                            label={formatMessage('innsendt.av.overskrift')}
                            verdi={innsendtAv}
                            retning={'vertikal'}
                        />
                        <OppsummeringPar
                            label={formatMessage('behandling.søknadsdato')}
                            verdi={søknadMottatt(props.behandling.søknad)}
                            retning={'vertikal'}
                        />
                        <OppsummeringPar
                            label={formatMessage('behandling.saksbehandlingStartet')}
                            verdi={formatDate(props.behandling.opprettet)}
                            retning={'vertikal'}
                        />
                        <OppsummeringPar
                            label={formatMessage('virkningstidspunkt.tittel')}
                            verdi={formatPeriode(props.behandling.stønadsperiode!.periode)}
                            retning={'vertikal'}
                        />
                        {props.behandling.omgjøringsårsak && props.behandling.omgjøringsgrunn && (
                            <>
                                <OppsummeringPar
                                    label={formatMessage('label.årsak')}
                                    verdi={formatMessage(props.behandling.omgjøringsårsak)}
                                    retning={'vertikal'}
                                />
                                <OppsummeringPar
                                    label={formatMessage('label.omgjøring')}
                                    verdi={formatMessage(props.behandling.omgjøringsgrunn)}
                                    retning={'vertikal'}
                                />
                            </>
                        )}
                    </div>
                    {underkjenteAttesteringer.length > 0 && (
                        <div className={styles.underkjenteAttesteringerContainer}>
                            <UnderkjenteAttesteringer attesteringer={props.behandling.attesteringer} />
                        </div>
                    )}
                    {props.behandling.aldersvurdering && props.behandling.sakstype === Sakstype.Uføre && (
                        <UføreVarsler a={props.behandling.aldersvurdering} />
                    )}
                </div>

                {!props.skjulEpsVarsel &&
                    epsFnr &&
                    props.behandling.status === SøknadsbehandlingStatus.TIL_ATTESTERING_INNVILGET &&
                    props.behandling.stønadsperiode && (
                        <>
                            {(RemoteData.isInitial(epsStatus) || RemoteData.isPending(epsStatus)) && <Loader />}

                            {RemoteData.isFailure(epsStatus) && <ApiErrorAlert error={epsStatus.error} />}

                            {RemoteData.isSuccess(epsStatus) && (
                                <EpsFyller67Varsel
                                    eps={epsStatus.value}
                                    periode={lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode.periode)}
                                />
                            )}
                        </>
                    )}

                <div className={styles.sidestiltOppsummeringContainer}>
                    <SidestiltOppsummeringAvVilkårOgGrunnlag
                        grunnlagsdataOgVilkårsvurderinger={props.behandling.grunnlagsdataOgVilkårsvurderinger}
                        visesSidestiltMed={props.behandling.søknad.søknadInnhold}
                        eksterneGrunnlag={props.behandling.eksterneGrunnlag}
                        sakstype={props.behandling.sakstype}
                    />
                </div>
            </Oppsummeringspanel>
            <OppsummeringAvBeregningOgSimulering
                eksterngrunnlagSkatt={props.behandling.eksterneGrunnlag.skatt}
                beregning={props.behandling.beregning}
                simulering={props.behandling.simulering}
            />
        </div>
    );
};

export default OppsummeringAvSøknadsbehandling;

export const EpsFyller67Varsel = (props: { eps: Person; periode: Periode<Date> }) => {
    const { formatMessage } = useI18n({ messages });
    const fødselsdato = parseValidIsoDateOnly(props.eps.fødsel?.dato ?? null);

    if (!fødselsdato) {
        return null;
    }

    if (!fyller67ILøpetAvPeriode(props.periode, fødselsdato)) {
        return null;
    }

    return <Alert variant="info">{formatMessage('eps.fyller67IPerioden')}</Alert>;
};
