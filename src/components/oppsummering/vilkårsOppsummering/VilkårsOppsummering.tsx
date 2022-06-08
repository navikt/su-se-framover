import { Heading } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Behandlingsinformasjon } from '~src/types/Behandlingsinformasjon';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { isUføresøknad, SøknadInnhold, SøknadInnholdAlder, SøknadInnholdUføre } from '~src/types/Søknad';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { mapToVilkårsinformasjon, Vilkårsinformasjon } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';
import { hentBosituasjongrunnlag } from '~src/utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';

import { FastOppholdVilkårsblokk } from './faktablokk/faktablokker/FastOppholdFaktablokk';
import { FlyktningVilkårsblokk } from './faktablokk/faktablokker/FlyktningFaktablokk';
import { FormueVilkårsblokk } from './faktablokk/faktablokker/FormueFaktablokk';
import { InstitusjonsoppholdVilkårsblokk } from './faktablokk/faktablokker/InstitusjonsoppholdBlokk';
import { LovligOppholdVilkårsblokk } from './faktablokk/faktablokker/LovligOppholdFaktablokk';
import { PersonligOppmøteVilkårsblokk } from './faktablokk/faktablokker/PersonligOppmøteFaktablokk';
import { UførhetVilkårsblokk } from './faktablokk/faktablokker/UførhetFaktablokk';
import { UtenlandsoppholdVilkårsblokk } from './faktablokk/faktablokker/UtenlandsOppholdFaktablokk';
import messages from './vilkårsOppsummering-nb';
import * as styles from './vilkårsOppsummering.module.less';

const VilkårsOppsummering = (props: {
    søknadInnhold: SøknadInnhold<SøknadInnholdUføre | SøknadInnholdAlder>;
    behandlingsinformasjon: Behandlingsinformasjon;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const { intl } = useI18n({ messages });
    const vilkårsinformasjon = mapToVilkårsinformasjon(
        props.behandlingsinformasjon,
        props.grunnlagsdataOgVilkårsvurderinger
    );

    return (
        <div>
            <Heading level="2" size="large" spacing>
                {intl.formatMessage({ id: 'page.tittel' })}
            </Heading>
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
            </div>
        </div>
    );
};

const Vilkårsting = (props: {
    info: Vilkårsinformasjon;
    søknadInnhold: SøknadInnhold<SøknadInnholdUføre | SøknadInnholdAlder>;
    behandlingsinformasjon: Behandlingsinformasjon;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    switch (props.info.vilkårtype) {
        case Vilkårtype.Uførhet:
            return isUføresøknad(props.søknadInnhold) ? (
                <UførhetVilkårsblokk
                    info={props.info}
                    søknadInnhold={props.søknadInnhold}
                    grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger}
                />
            ) : null;
        case Vilkårtype.Flyktning:
            return isUføresøknad(props.søknadInnhold) ? (
                <FlyktningVilkårsblokk
                    info={props.info}
                    søknadInnhold={props.søknadInnhold}
                    behandlingsinformasjon={props.behandlingsinformasjon.flyktning}
                />
            ) : null;
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
                    grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger}
                />
            );
        case Vilkårtype.Formue:
            return (
                <FormueVilkårsblokk
                    info={props.info}
                    søknadInnhold={props.søknadInnhold}
                    formue={props.grunnlagsdataOgVilkårsvurderinger.formue}
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
