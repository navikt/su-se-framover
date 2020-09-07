import * as RemoteData from '@devexperts/remote-data-ts';
import Alertstripe from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Undertittel } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Behandling, Vilkårtype, VilkårVurderingStatus, Behandlingsstatus } from '~api/behandlingApi';
import { Sak } from '~api/sakApi';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import * as routes from '~lib/routes';
import { Nullable } from '~lib/types';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import { SaksbehandlingMenyvalg } from '../types';
import Vilkårsvurdering from '../vilkårsvurdering/Vilkårsvurdering';

import styles from './vilkår.module.less';

const boolTilJaNei = (val: Nullable<boolean>) => {
    if (val === null) {
        return '-';
    }
    return val ? 'Ja' : 'Nei';
};

const showNumber = (val: Nullable<number>) => {
    if (val === null) {
        return '-';
    }
    return val.toString();
};

const Infolinje = (props: { tittel: string; verdi: React.ReactNode }) => (
    <div className={styles.infolinje}>
        <span className={styles.infotittel}>{props.tittel}:</span>
        <span>{props.verdi}</span>
    </div>
);

const VilkårInnhold = (props: { behandling: Behandling; sakId: string }) => {
    const [nextButtonHasBeenClicked, setNextButtonHasBeenClicked] = useState<boolean>(false);

    const {
        vilkårsvurderinger,
        søknad: { søknadInnhold: søknad },
    } = props.behandling;

    const history = useHistory();
    const dispatch = useAppDispatch();
    const lagrestatus = useAppSelector((s) => s.sak.lagreVilkårsvurderingStatus);

    const handleSaveClick = (vilkårtype: Vilkårtype) => (svar: {
        status: VilkårVurderingStatus;
        begrunnelse: string;
    }) => {
        dispatch(
            sakSlice.lagreVilkårsvurdering({
                sakId: props.sakId,
                begrunnelse: svar.begrunnelse,
                behandlingId: props.behandling.id,
                status: svar.status,
                vilkårsvurderingId: vilkårsvurderinger[vilkårtype].id,
                vilkårtype,
            })
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.vilkårContainer}>
                <Vilkårsvurdering
                    type={Vilkårtype.Uførhet}
                    paragraph="§ 12-4 - § 12-8"
                    legend="Har søker fått vedtak om uføretrygd der vilkårene i §12-4 til §12-8 i folketrygdloven er oppfylt?"
                    vilkårsvurdering={vilkårsvurderinger[Vilkårtype.Uførhet]}
                    lagrer={RemoteData.isPending(lagrestatus)}
                    onSaveClick={handleSaveClick(Vilkårtype.Uførhet)}
                    className={styles.vilkarsvurdering}
                >
                    <div>
                        <Undertittel>Fra søknad</Undertittel>
                        <Infolinje tittel="Har uførevedtak" verdi={boolTilJaNei(søknad.uførevedtak.harUførevedtak)} />
                    </div>
                </Vilkårsvurdering>
                <Vilkårsvurdering
                    type={Vilkårtype.Flyktning}
                    paragraph="§ 28"
                    legend="Er søker registrert flyktning?"
                    vilkårsvurdering={vilkårsvurderinger[Vilkårtype.Flyktning]}
                    lagrer={RemoteData.isPending(lagrestatus)}
                    onSaveClick={handleSaveClick(Vilkårtype.Flyktning)}
                    className={styles.vilkarsvurdering}
                >
                    <div>
                        <Undertittel>Fra søknad</Undertittel>
                        <Infolinje
                            tittel="Registrert flyktning"
                            verdi={boolTilJaNei(søknad.flyktningsstatus.registrertFlyktning)}
                        />
                    </div>
                </Vilkårsvurdering>
                <Vilkårsvurdering
                    type={Vilkårtype.Oppholdstillatelse}
                    paragraph="§ 3"
                    legend="Er søker norsk statsborger?"
                    vilkårsvurdering={vilkårsvurderinger[Vilkårtype.Oppholdstillatelse]}
                    lagrer={RemoteData.isPending(lagrestatus)}
                    onSaveClick={handleSaveClick(Vilkårtype.Oppholdstillatelse)}
                    className={styles.vilkarsvurdering}
                >
                    <div>
                        <Undertittel>Fra søknad</Undertittel>
                        <Infolinje
                            tittel="Norsk statsborger"
                            verdi={boolTilJaNei(søknad.oppholdstillatelse.erNorskStatsborger)}
                        />
                        <Infolinje
                            tittel="Har oppholdstillatelse"
                            verdi={
                                <span>
                                    {boolTilJaNei(søknad.oppholdstillatelse.harOppholdstillatelse)}.{' '}
                                    {søknad.oppholdstillatelse.typeOppholdstillatelse}
                                </span>
                            }
                        />
                        {søknad.oppholdstillatelse.statsborgerskapAndreLand && (
                            <Infolinje
                                tittel="Statsborgerskap i andre land"
                                verdi={søknad.oppholdstillatelse.statsborgerskapAndreLandFritekst ?? ''}
                            />
                        )}
                        <Infolinje
                            tittel="Oppholdstillatelse forelengelse"
                            verdi={boolTilJaNei(søknad.oppholdstillatelse.oppholdstillatelseForlengelse)}
                        />
                        <Infolinje
                            tittel="Oppholdstillatelse mindre enn tre måneder"
                            verdi={boolTilJaNei(søknad.oppholdstillatelse.oppholdstillatelseMindreEnnTreMåneder)}
                        />
                    </div>
                </Vilkårsvurdering>
                <Vilkårsvurdering
                    type={Vilkårtype.PersonligOppmøte}
                    paragraph="§ 17"
                    legend="TODO"
                    vilkårsvurdering={vilkårsvurderinger[Vilkårtype.PersonligOppmøte]}
                    lagrer={RemoteData.isPending(lagrestatus)}
                    onSaveClick={handleSaveClick(Vilkårtype.PersonligOppmøte)}
                    className={styles.vilkarsvurdering}
                >
                    <div>
                        <Undertittel>Fra søknad</Undertittel>
                        <p>TODO</p>
                    </div>
                </Vilkårsvurdering>
                <Vilkårsvurdering
                    type={Vilkårtype.Formue}
                    paragraph="§ 8"
                    legend="TODO"
                    vilkårsvurdering={vilkårsvurderinger[Vilkårtype.Formue]}
                    lagrer={RemoteData.isPending(lagrestatus)}
                    onSaveClick={handleSaveClick(Vilkårtype.Formue)}
                    className={styles.vilkarsvurdering}
                >
                    <div>
                        <Undertittel>Fra søknad</Undertittel>
                        <Infolinje tittel="Bor i bolig" verdi={boolTilJaNei(søknad.formue.borIBolig)} />
                        <Infolinje tittel="Verdi på bolig" verdi={showNumber(søknad.formue.verdiPåBolig)} />
                        <Infolinje tittel="Bolig brukes til" verdi={søknad.formue.boligBrukesTil ?? ''} />
                        <Infolinje tittel="Depositumsbeløp" verdi={showNumber(søknad.formue.depositumsBeløp)} />
                        <Infolinje tittel="Kontonummer" verdi={søknad.formue.kontonummer ?? ''} />
                        <Infolinje tittel="Verdi på eiendom" verdi={showNumber(søknad.formue.verdiPåEiendom)} />
                        <Infolinje tittel="Eiendom brukes til" verdi={søknad.formue.eiendomBrukesTil ?? ''} />
                        {søknad.formue.kjøretøy?.map((k, idx) => (
                            <Infolinje
                                key={idx}
                                tittel={`Kjøretøy ${idx + 1}`}
                                verdi={`${k.kjøretøyDeEier} - ${k.verdiPåKjøretøy}`}
                            />
                        ))}
                        <Infolinje tittel="Innskuddsbeløp" verdi={showNumber(søknad.formue.innskuddsBeløp)} />
                        <Infolinje tittel="Verdipapirbeløp" verdi={showNumber(søknad.formue.verdipapirBeløp)} />
                        <Infolinje
                            tittel="Penger folk skylder søker"
                            verdi={showNumber(søknad.formue.skylderNoenMegPengerBeløp)}
                        />
                        <Infolinje tittel="Kontanter" verdi={showNumber(søknad.formue.kontanterBeløp)} />
                    </div>
                </Vilkårsvurdering>
                <Vilkårsvurdering
                    type={Vilkårtype.BorOgOppholderSegINorge}
                    paragraph="§ 5"
                    legend="TODO"
                    vilkårsvurdering={vilkårsvurderinger[Vilkårtype.BorOgOppholderSegINorge]}
                    lagrer={RemoteData.isPending(lagrestatus)}
                    onSaveClick={handleSaveClick(Vilkårtype.BorOgOppholderSegINorge)}
                    className={styles.vilkarsvurdering}
                >
                    <div>
                        <Undertittel>Fra søknad</Undertittel>
                        <p>{søknad.boforhold.borOgOppholderSegINorge}</p>
                    </div>
                </Vilkårsvurdering>
            </div>
            <Hovedknapp
                onClick={() => {
                    if (props.behandling.status === Behandlingsstatus.VILKÅRSVURDERT_INNVILGET) {
                        return history.push(
                            routes.saksoversiktValgtBehandling.createURL({
                                sakId: props.sakId,
                                behandlingId: props.behandling.id,
                                meny: SaksbehandlingMenyvalg.Beregning,
                            })
                        );
                    }
                    if (props.behandling.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG) {
                        return history.push(
                            routes.saksoversiktValgtBehandling.createURL({
                                sakId: props.sakId,
                                behandlingId: props.behandling.id,
                                meny: SaksbehandlingMenyvalg.Vedtak,
                            })
                        );
                    }
                    setNextButtonHasBeenClicked(true);
                }}
            >
                Gå til beregning
            </Hovedknapp>
            {nextButtonHasBeenClicked && props.behandling.status === Behandlingsstatus.OPPRETTET && (
                <Alertstripe type="feil">Må fylles ut</Alertstripe>
            )}
        </div>
    );
};

const Vilkår = (props: { sak: Sak }) => {
    const { behandlingId } = routes.useRouteParams<typeof routes.saksbehandlingVilkårsvurdering>();
    const behandling = props.sak.behandlinger.find((b) => b.id === behandlingId);
    return (
        <div className={styles.container}>
            {behandling ? <VilkårInnhold behandling={behandling} sakId={props.sak.id} /> : 'ingen behandling enda'}
        </div>
    );
};

export default Vilkår;
