import React from 'react';
import { Undertittel } from 'nav-frontend-typografi';

import Vilkårsvurdering from '../vilkårsvurdering/Vilkårsvurdering';
import styles from './vilkår.module.less';
import { Behandling, Vilkårtype } from '~api/behandlingApi';
import { Søknad } from '~api/søknadApi';
import { Nullable } from '~lib/types';
import { Sak } from '~api/sakApi';

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

const VilkårInnhold = (props: { behandling: Behandling; søknad: Søknad }) => {
    const { vilkårsvurderinger } = props.behandling;
    return (
        <div className={styles.container}>
            <Vilkårsvurdering
                title="Uførhet"
                paragraph="§ 12-4 - § 12-8"
                legend="Har søker fått vedtak om uføretrygd der vilkårene i §12-4 til §12-8 i folketrygdloven er oppfylt?"
                vilkårsvurdering={vilkårsvurderinger[Vilkårtype.Uførhet]}
                onSaveClick={console.log}
                className={styles.vilkarsvurdering}
            >
                <div>
                    <Undertittel>Fra søknad</Undertittel>
                    <Infolinje tittel="Har uførevedtak" verdi={boolTilJaNei(props.søknad.uførevedtak.harUførevedtak)} />
                </div>
            </Vilkårsvurdering>
            <Vilkårsvurdering
                title="Flyktning"
                paragraph="§ 28"
                legend="Er søker registrert flyktning?"
                vilkårsvurdering={vilkårsvurderinger[Vilkårtype.Flyktning]}
                onSaveClick={console.log}
                className={styles.vilkarsvurdering}
            >
                <div>
                    <Undertittel>Fra søknad</Undertittel>
                    <Infolinje
                        tittel="Registrert flyktning"
                        verdi={boolTilJaNei(props.søknad.flyktningsstatus.registrertFlyktning)}
                    />
                </div>
            </Vilkårsvurdering>
            <Vilkårsvurdering
                title="Opphold"
                paragraph="§ 3"
                legend="Er søker norsk statsborger?"
                vilkårsvurdering={vilkårsvurderinger[Vilkårtype.Oppholdstillatelse]}
                onSaveClick={console.log}
                className={styles.vilkarsvurdering}
            >
                <div>
                    <Undertittel>Fra søknad</Undertittel>
                    <Infolinje
                        tittel="Norsk statsborger"
                        verdi={boolTilJaNei(props.søknad.oppholdstillatelse.erNorskStatsborger)}
                    />
                    <Infolinje
                        tittel="Har oppholdstillatelse"
                        verdi={
                            <span>
                                {boolTilJaNei(props.søknad.oppholdstillatelse.harOppholdstillatelse)}.{' '}
                                {props.søknad.oppholdstillatelse.typeOppholdstillatelse}
                            </span>
                        }
                    />
                    {props.søknad.oppholdstillatelse.statsborgerskapAndreLand && (
                        <Infolinje
                            tittel="Statsborgerskap i andre land"
                            verdi={props.søknad.oppholdstillatelse.statsborgerskapAndreLandFritekst ?? ''}
                        />
                    )}
                    <Infolinje
                        tittel="Oppholdstillatelse forelengelse"
                        verdi={boolTilJaNei(props.søknad.oppholdstillatelse.oppholdstillatelseForlengelse)}
                    />
                    <Infolinje
                        tittel="Oppholdstillatelse mindre enn tre måneder"
                        verdi={boolTilJaNei(props.søknad.oppholdstillatelse.oppholdstillatelseMindreEnnTreMåneder)}
                    />
                </div>
            </Vilkårsvurdering>
            <Vilkårsvurdering
                title="Personlig oppmøte"
                paragraph="§ 17"
                legend="TODO"
                vilkårsvurdering={vilkårsvurderinger[Vilkårtype.PersonligOppmøte]}
                onSaveClick={console.log}
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
                onSaveClick={console.log}
                className={styles.vilkarsvurdering}
            >
                <div>
                    <Undertittel>Fra søknad</Undertittel>
                    <Infolinje tittel="Bor i bolig" verdi={boolTilJaNei(props.søknad.formue.borIBolig)} />
                    <Infolinje tittel="Verdi på bolig" verdi={showNumber(props.søknad.formue.verdiPåBolig)} />
                    <Infolinje tittel="Bolig brukes til" verdi={props.søknad.formue.boligBrukesTil ?? ''} />
                    <Infolinje tittel="Depositumsbeløp" verdi={showNumber(props.søknad.formue.depositumsBeløp)} />
                    <Infolinje tittel="Kontonummer" verdi={props.søknad.formue.kontonummer ?? ''} />
                    <Infolinje tittel="Verdi på eiendom" verdi={showNumber(props.søknad.formue.verdiPåEiendom)} />
                    <Infolinje tittel="Eiendom brukes til" verdi={props.søknad.formue.eiendomBrukesTil ?? ''} />
                    <Infolinje tittel="Kjøretøy" verdi={props.søknad.formue.kjøretøyDeEier ?? ''} />
                    <Infolinje tittel="Verdi på kjøretøy" verdi={showNumber(props.søknad.formue.verdiPåKjøretøy)} />
                    <Infolinje tittel="Innskuddsbeløp" verdi={showNumber(props.søknad.formue.innskuddsBeløp)} />
                    <Infolinje tittel="Verdipapirbeløp" verdi={showNumber(props.søknad.formue.verdipapirBeløp)} />
                    <Infolinje
                        tittel="Penger folk skylder søker"
                        verdi={showNumber(props.søknad.formue.skylderNoenMegPengerBeløp)}
                    />
                    <Infolinje tittel="Kontanter" verdi={showNumber(props.søknad.formue.kontanterBeløp)} />
                </div>
            </Vilkårsvurdering>
            <Vilkårsvurdering
                title="Boforhold/sivilstatus"
                paragraph="§ 5"
                legend="TODO"
                vilkårsvurdering={vilkårsvurderinger[Vilkårtype.BorOgOppholderSegINorge]}
                onSaveClick={console.log}
                className={styles.vilkarsvurdering}
            >
                <div>
                    <Undertittel>Fra søknad</Undertittel>
                    <p>{props.søknad.boforhold.borOgOppholderSegINorge}</p>
                </div>
            </Vilkårsvurdering>
        </div>
    );
};

const Vilkår = (props: { sak: Sak; stønadsperiodeId: string; behandlingId: string }) => {
    const stønadsperiode = props.sak.stønadsperioder.find((sp) => sp.id.toString() === props.stønadsperiodeId);
    const behandling = stønadsperiode?.behandlinger.find((b) => b.id.toString() === props.behandlingId);
    const søknad = stønadsperiode?.søknad;

    return (
        <div className={styles.container}>
            {behandling && søknad ? (
                <VilkårInnhold behandling={behandling} søknad={søknad.json} />
            ) : (
                'Klarte ikke finne søknaden'
            )}
        </div>
    );
};
export default Vilkår;
