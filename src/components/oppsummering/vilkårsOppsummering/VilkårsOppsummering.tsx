import { Systemtittel } from 'nav-frontend-typografi';
import React from 'react';

import { useI18n } from '~lib/hooks';
import { Behandlingsstatus } from '~types/Behandling';
import { Behandlingsinformasjon } from '~types/Behandlingsinformasjon';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { SøknadInnhold } from '~types/Søknad';
import { Vilkårtype } from '~types/Vilkårsvurdering';
import { hentBosituasjongrunnlag } from '~Utils/revurdering/revurderingUtils';
import { mapToVilkårsinformasjon, Vilkårsinformasjon } from '~Utils/søknadsbehandling/vilkår/vilkårUtils';

import { FastOppholdVilkårsblokk } from './faktablokk/faktablokker/FastOppholdFaktablokk';
import { FlyktningVilkårsblokk } from './faktablokk/faktablokker/FlyktningFaktablokk';
import { FormueVilkårsblokk } from './faktablokk/faktablokker/FormueFaktablokk';
import { InstitusjonsoppholdVilkårsblokk } from './faktablokk/faktablokker/InstitusjonsoppholdBlokk';
import { LovligOppholdVilkårsblokk } from './faktablokk/faktablokker/LovligOppholdFaktablokk';
import { PersonligOppmøteVilkårsblokk } from './faktablokk/faktablokker/PersonligOppmøteFaktablokk';
import { SatsVilkårsblokk } from './faktablokk/faktablokker/SatsFaktablokk';
import { UførhetVilkårsblokk } from './faktablokk/faktablokker/UførhetFaktablokk';
import { UtenlandsoppholdVilkårsblokk } from './faktablokk/faktablokker/UtenlandsOppholdFaktablokk';
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
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const { intl } = useI18n({ messages });
    const vilkårsinformasjon = mapToVilkårsinformasjon(props.behandlingsinformasjon);

    return (
        <div>
            <Systemtittel className={styles.tittel}>{intl.formatMessage({ id: 'page.tittel' })}</Systemtittel>
            <div className={styles.vilkårsblokkerContainer}>
                {vilkårsinformasjon.map((v) => (
                    <Vilkårsting
                        key={v.vilkårtype}
                        info={v}
                        søknadInnhold={props.søknadInnhold}
                        behandlingsinformasjon={props.behandlingsinformasjon}
                        grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger}
                    />
                ))}
                {shouldShowSats(props.behandlingstatus) && (
                    <SatsVilkårsblokk
                        bosituasjon={hentBosituasjongrunnlag(props.grunnlagsdataOgVilkårsvurderinger)}
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
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
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
                    formue={props.behandlingsinformasjon.formue}
                    ektefelle={{ fnr: hentBosituasjongrunnlag(props.grunnlagsdataOgVilkårsvurderinger)?.fnr }}
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
