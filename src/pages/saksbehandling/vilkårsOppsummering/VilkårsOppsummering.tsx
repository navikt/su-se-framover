import { Systemtittel } from 'nav-frontend-typografi';
import React from 'react';

import { mapToVilkårsinformasjon, Vilkårsinformasjon } from '~features/saksoversikt/utils';
import { useI18n } from '~lib/hooks';
import { Behandlingsinformasjon } from '~types/Behandlingsinformasjon';
import { SøknadInnhold } from '~types/Søknad';
import { Vilkårtype } from '~types/Vilkårsvurdering';

import { Behandlingsstatus } from '../../../types/Behandling';
import { FastOppholdVilkårsblokk } from '../steg/faktablokk/faktablokker/FastOppholdFaktablokk';
import { FlyktningVilkårsblokk } from '../steg/faktablokk/faktablokker/FlyktningFaktablokk';
import { FormueVilkårsblokk } from '../steg/faktablokk/faktablokker/FormueFaktablokk';
import { InstitusjonsoppholdVilkårsblokk } from '../steg/faktablokk/faktablokker/InstitusjonsoppholdBlokk';
import { LovligOppholdVilkårsblokk } from '../steg/faktablokk/faktablokker/LovligOppholdFaktablokk';
import { PersonligOppmøteVilkårsblokk } from '../steg/faktablokk/faktablokker/PersonligOppmøteFaktablokk';
import { SatsVilkårsblokk } from '../steg/faktablokk/faktablokker/SatsFaktablokk';
import { UførhetVilkårsblokk } from '../steg/faktablokk/faktablokker/UførhetFaktablokk';
import { UtenlandsoppholdVilkårsblokk } from '../steg/faktablokk/faktablokker/UtenlandsOppholdFaktablokk';

import messages from './vilkårsOppsummering-nb';
import styles from './vilkårsOppsummering.module.less';

function shouldShowSats(status: Behandlingsstatus) {
    return [
        Behandlingsstatus.VILKÅRSVURDERT_INNVILGET,
        Behandlingsstatus.BEREGNET_INNVILGET,
        Behandlingsstatus.SIMULERT,
        Behandlingsstatus.TIL_ATTESTERING_INNVILGET,
        Behandlingsstatus.UNDERKJENT_INNVILGET,
        Behandlingsstatus.IVERKSATT_INNVILGET,
    ].includes(status);
}

const VilkårsOppsummering = (props: {
    søknadInnhold: SøknadInnhold;
    behandlingsinformasjon: Behandlingsinformasjon;
    behandlingstatus: Behandlingsstatus;
}) => {
    const intl = useI18n({ messages });
    const vilkårsinformasjon = mapToVilkårsinformasjon(props.behandlingsinformasjon);

    return (
        <div className={styles.container}>
            <Systemtittel className={styles.tittel}>{intl.formatMessage({ id: 'page.tittel' })}</Systemtittel>
            <div className={styles.vilkårsblokkerContainer}>
                {vilkårsinformasjon.map((v) => (
                    <Vilkårsting
                        key={v.vilkårtype}
                        info={v}
                        søknadInnhold={props.søknadInnhold}
                        behandlingsinformasjon={props.behandlingsinformasjon}
                    />
                ))}
                {shouldShowSats(props.behandlingstatus) && (
                    <SatsVilkårsblokk
                        bosituasjon={props.behandlingsinformasjon.bosituasjon}
                        ektefelle={props.behandlingsinformasjon.ektefelle}
                        sats={props.behandlingsinformasjon.utledetSats}
                        søknadInnhold={props.søknadInnhold}
                    />
                )}
            </div>
        </div>
    );
};

const Vilkårsting = (props: {
    info: Vilkårsinformasjon;
    søknadInnhold: SøknadInnhold;
    behandlingsinformasjon: Behandlingsinformasjon;
}) => {
    switch (props.info.vilkårtype) {
        case Vilkårtype.Uførhet:
            return (
                <UførhetVilkårsblokk
                    info={props.info}
                    søknadInnhold={props.søknadInnhold}
                    behandlingsinformasjon={props.behandlingsinformasjon.uførhet}
                />
            );
        case Vilkårtype.Flyktning:
            return (
                <FlyktningVilkårsblokk
                    info={props.info}
                    søknadInnhold={props.søknadInnhold}
                    behandlingsinformasjon={props.behandlingsinformasjon.flyktning}
                />
            );
        case Vilkårtype.LovligOpphold:
            return (
                <LovligOppholdVilkårsblokk
                    info={props.info}
                    søknadInnhold={props.søknadInnhold}
                    behandlingsinformasjon={props.behandlingsinformasjon.lovligOpphold}
                />
            );
        case Vilkårtype.FastOppholdINorge:
            return (
                <FastOppholdVilkårsblokk
                    info={props.info}
                    søknadInnhold={props.søknadInnhold}
                    behandlingsinformasjon={props.behandlingsinformasjon.fastOppholdINorge}
                />
            );
        case Vilkårtype.Institusjonsopphold:
            return (
                <InstitusjonsoppholdVilkårsblokk
                    info={props.info}
                    søknadInnhold={props.søknadInnhold}
                    behandlingsinformasjon={props.behandlingsinformasjon.institusjonsopphold}
                />
            );
        case Vilkårtype.OppholdIUtlandet:
            return (
                <UtenlandsoppholdVilkårsblokk
                    info={props.info}
                    søknadInnhold={props.søknadInnhold}
                    behandlingsinformasjon={props.behandlingsinformasjon.oppholdIUtlandet}
                />
            );
        case Vilkårtype.Formue:
            return (
                <FormueVilkårsblokk
                    info={props.info}
                    søknadInnhold={props.søknadInnhold}
                    behandlingsinformasjon={props.behandlingsinformasjon.formue}
                />
            );
        case Vilkårtype.PersonligOppmøte:
            return (
                <PersonligOppmøteVilkårsblokk
                    info={props.info}
                    søknadInnhold={props.søknadInnhold}
                    behandlingsinformasjon={props.behandlingsinformasjon.personligOppmøte}
                />
            );
        default:
            return null;
    }
};

export default VilkårsOppsummering;
