import React, { useState } from 'react';
import { Undertittel } from 'nav-frontend-typografi';
import * as RemoteData from '@devexperts/remote-data-ts';
import { useHistory } from 'react-router-dom';

import Vilkårsvurdering from '../vilkårsvurdering/Vilkårsvurdering';
import styles from './vilkår.module.less';
import { Behandling, Vilkårtype, VilkårVurderingStatus } from '~api/behandlingApi';
import { Nullable } from '~lib/types';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { Hovedknapp } from 'nav-frontend-knapper';
import Alertstripe from 'nav-frontend-alertstriper';
import * as routes from '~lib/routes';
import { SaksbehandlingMenyvalg } from '../types';

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

    const vilkårsvurderingIsValid = !Object.values(vilkårsvurderinger).some(
        (vurdering) => vurdering.status !== VilkårVurderingStatus.Ok
    );

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
            <Vilkårsvurdering
                title="Uførhet"
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
                title="Flyktning"
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
                title="Opphold"
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
                title="Personlig oppmøte"
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
                title="Formue"
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
                    <Infolinje tittel="Kjøretøy" verdi={søknad.formue.kjøretøyDeEier ?? ''} />
                    <Infolinje tittel="Verdi på kjøretøy" verdi={showNumber(søknad.formue.verdiPåKjøretøy)} />
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
                title="Boforhold/sivilstatus"
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
            <Hovedknapp
                onClick={() => {
                    if (vilkårsvurderingIsValid) {
                        return history.push(
                            routes.saksoversikt.createURL({
                                sakId: props.sakId,
                                behandlingId: props.behandling.id,
                                meny: SaksbehandlingMenyvalg.Beregning,
                            })
                        );
                    }
                    setNextButtonHasBeenClicked(true);
                }}
            >
                Send inn.
            </Hovedknapp>
            {nextButtonHasBeenClicked && !vilkårsvurderingIsValid && (
                <Alertstripe type="feil">Må fylles ut</Alertstripe>
            )}
        </div>
    );
};

const Vilkår = (props: { sakId: string; behandling: Behandling | undefined }) => {
    return (
        <div className={styles.container}>
            {props.behandling ? (
                <VilkårInnhold behandling={props.behandling} sakId={props.sakId} />
            ) : (
                'ingen behandling enda'
            )}
        </div>
    );
};

export default Vilkår;
