import { Systemtittel, Undertittel } from 'nav-frontend-typografi';
import React from 'react';

import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import { mapToVilkårsinformasjon, vilkårTittelFormatted } from '~features/saksoversikt/utils';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import { Behandlingsinformasjon } from '~types/Behandlingsinformasjon';
import { Sats } from '~types/Sats';
import { SøknadInnhold } from '~types/Søknad';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';

import FastOppholdFaktablokk from '../steg/faktablokk/faktablokker/FastOppholdFaktablokk';
import FlyktningFaktablokk from '../steg/faktablokk/faktablokker/FlyktningFaktablokk';
import FormueFaktablokk from '../steg/faktablokk/faktablokker/FormueFaktablokk';
import InstitusjonsoppholdBlokk from '../steg/faktablokk/faktablokker/InstitusjonsoppholdBlokk';
import LovligOppholdFaktablokk from '../steg/faktablokk/faktablokker/LovligOppholdFaktablokk';
import PersonligOppmøteFaktablokk from '../steg/faktablokk/faktablokker/PersonligOppmøteFaktablokk';
import SatsFaktablokk from '../steg/faktablokk/faktablokker/SatsFaktablokk';
import UførhetFaktablokk from '../steg/faktablokk/faktablokker/UførhetFaktablokk';
import UtenlandsOppholdFaktablokk from '../steg/faktablokk/faktablokker/UtenlandsOppholdFaktablokk';
import { EPSMedAlder } from '../steg/sats/utils';

import messages from './vilkårsOppsummering-nb';
import styles from './vilkårsOppsummering.module.less';

const VilkårsOppsummering = (props: {
    søknadInnhold: SøknadInnhold;
    behandlingsinformasjon: Behandlingsinformasjon;
}) => {
    const intl = useI18n({ messages });
    const vilkårsinformasjon = mapToVilkårsinformasjon(props.behandlingsinformasjon);

    return (
        <div>
            <Systemtittel className={styles.tittel}>{intl.formatMessage({ id: 'page.tittel' })}</Systemtittel>
            <div className={styles.vilkårsblokkerContainer}>
                {vilkårsinformasjon.map((v) => (
                    <VilkårsBlokk
                        key={v.vilkårtype}
                        tittel={vilkårTittelFormatted(v.vilkårtype)}
                        status={v.status}
                        vilkårFaktablokk={mapVilkårtypeToFaktablokk(v.vilkårtype, props.søknadInnhold)}
                        begrunnelse={v.begrunnelse}
                    />
                ))}

                {
                    <VilkårsBlokk
                        tittel={intl.formatMessage({
                            id:
                                props.behandlingsinformasjon.utledetSats === Sats.Høy
                                    ? 'bosituasjon.sats.høy'
                                    : 'bosituasjon.sats.ordinær',
                        })}
                        vilkårFaktablokk={
                            <SatsFaktablokk
                                søknadInnhold={props.søknadInnhold}
                                eps={props.behandlingsinformasjon.ektefelle as Nullable<EPSMedAlder>}
                                brukUndertittel
                            />
                        }
                        begrunnelse={props.behandlingsinformasjon.bosituasjon?.begrunnelse ?? ''}
                    />
                }
            </div>
        </div>
    );
};

const VilkårsBlokk = (props: {
    status?: VilkårVurderingStatus;
    tittel: string;
    vilkårFaktablokk: JSX.Element;
    begrunnelse: Nullable<string>;
}) => {
    const intl = useI18n({ messages });

    return (
        <div className={styles.blokkContainer}>
            <div className={styles.blokkHeader}>
                {props.status ? <VilkårvurderingStatusIcon className={styles.ikon} status={props.status} /> : null}
                {props.tittel}
            </div>
            <div className={styles.pairBlokkContainer}>
                <div className={styles.blokk}>{props.vilkårFaktablokk}</div>
                <div className={styles.blokk}>
                    <Undertittel className={styles.blokkOverskrift}>
                        {intl.formatMessage({ id: 'vilkår.begrunnelse' })}
                    </Undertittel>
                    <p>{props.begrunnelse}</p>
                </div>
            </div>
        </div>
    );
};

const mapVilkårtypeToFaktablokk = (vilkårtype: Vilkårtype, søknadInnhold: SøknadInnhold) => {
    switch (vilkårtype) {
        case Vilkårtype.Uførhet:
            return <UførhetFaktablokk søknadInnhold={søknadInnhold} brukUndertittel={true} />;
        case Vilkårtype.Flyktning:
            return <FlyktningFaktablokk søknadInnhold={søknadInnhold} brukUndertittel={true} />;
        case Vilkårtype.LovligOpphold:
            return <LovligOppholdFaktablokk søknadInnhold={søknadInnhold} brukUndertittel={true} />;
        case Vilkårtype.FastOppholdINorge:
            return <FastOppholdFaktablokk søknadInnhold={søknadInnhold} brukUndertittel={true} />;
        case Vilkårtype.Institusjonsopphold:
            return <InstitusjonsoppholdBlokk søknadInnhold={søknadInnhold} brukUndertittel={true} />;
        case Vilkårtype.OppholdIUtlandet:
            return <UtenlandsOppholdFaktablokk søknadInnhold={søknadInnhold} brukUndertittel={true} />;
        case Vilkårtype.Formue:
            return <FormueFaktablokk søknadInnhold={søknadInnhold} brukUndertittel={true} />;
        case Vilkårtype.PersonligOppmøte:
            return <PersonligOppmøteFaktablokk søknadInnhold={søknadInnhold} brukUndertittel={true} />;
        default:
            return <></>;
    }
};

export default VilkårsOppsummering;
