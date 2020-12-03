import { Systemtittel, Undertittel } from 'nav-frontend-typografi';
import React from 'react';

import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import { mapToVilkårsinformasjon, vilkårTittelFormatted } from '~features/saksoversikt/utils';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import { Behandlingsinformasjon } from '~types/Behandlingsinformasjon';
import { SøknadInnhold } from '~types/Søknad';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';

import { FaktablokkTitteltype } from '../steg/faktablokk/faktablokker/faktablokkUtils';
import FastOppholdFaktablokk from '../steg/faktablokk/faktablokker/FastOppholdFaktablokk';
import FlyktningFaktablokk from '../steg/faktablokk/faktablokker/FlyktningFaktablokk';
import FormueFaktablokk from '../steg/faktablokk/faktablokker/FormueFaktablokk';
import LovligOppholdFaktablokk from '../steg/faktablokk/faktablokker/LovligOppholdFaktablokk';
import PersonligOppmøteFaktablokk from '../steg/faktablokk/faktablokker/PersonligOppmøteFaktablokk';
import UførhetFaktablokk from '../steg/faktablokk/faktablokker/UførhetFaktablokk';
import UtenlandsOppholdFaktablokk from '../steg/faktablokk/faktablokker/UtenlandsOppholdFaktablokk';

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
            </div>
        </div>
    );
};

const VilkårsBlokk = (props: {
    status: VilkårVurderingStatus;
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
            return <UførhetFaktablokk søknadInnhold={søknadInnhold} tittelType={FaktablokkTitteltype.undertittel} />;
        case Vilkårtype.Flyktning:
            return <FlyktningFaktablokk søknadInnhold={søknadInnhold} tittelType={FaktablokkTitteltype.undertittel} />;
        case Vilkårtype.LovligOpphold:
            return (
                <LovligOppholdFaktablokk søknadInnhold={søknadInnhold} tittelType={FaktablokkTitteltype.undertittel} />
            );
        case Vilkårtype.FastOppholdINorge:
            return (
                <FastOppholdFaktablokk søknadInnhold={søknadInnhold} tittelType={FaktablokkTitteltype.undertittel} />
            );
        case Vilkårtype.OppholdIUtlandet:
            return (
                <UtenlandsOppholdFaktablokk
                    søknadInnhold={søknadInnhold}
                    tittelType={FaktablokkTitteltype.undertittel}
                />
            );
        case Vilkårtype.Formue:
            return <FormueFaktablokk søknadInnhold={søknadInnhold} tittelType={FaktablokkTitteltype.undertittel} />;
        case Vilkårtype.PersonligOppmøte:
            return (
                <PersonligOppmøteFaktablokk
                    søknadInnhold={søknadInnhold}
                    tittelType={FaktablokkTitteltype.undertittel}
                />
            );
        default:
            return <></>;
    }
};

export default VilkårsOppsummering;
