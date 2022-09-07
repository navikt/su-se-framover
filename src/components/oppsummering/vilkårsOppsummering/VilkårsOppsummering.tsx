import { Heading } from '@navikt/ds-react';
import React from 'react';

import { AlderspensjonVilkårsblokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/AlderspensjonFaktablokk';
import { FamilieforeningVilkårsblokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/FamilieforeningFaktablokk';
import { useI18n } from '~src/lib/i18n';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { isAldersøknad, isUføresøknad, SøknadInnhold } from '~src/types/Søknad';
import { Vilkårtype, VilkårtypeAlder } from '~src/types/Vilkårsvurdering';
import { mapToVilkårsinformasjon, Vilkårsinformasjon } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

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
    søknadInnhold: SøknadInnhold;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const { formatMessage } = useI18n({ messages });
    const vilkårsinformasjon = mapToVilkårsinformasjon(
        props.søknadInnhold.type,
        props.grunnlagsdataOgVilkårsvurderinger
    );

    return (
        <div>
            <Heading level="2" size="large" spacing>
                {formatMessage('page.tittel')}
            </Heading>
            <div className={styles.vilkårsblokkerContainer}>
                {vilkårsinformasjon.map((v) => (
                    <Vilkårsting
                        key={v.vilkårtype}
                        info={v}
                        søknadInnhold={props.søknadInnhold}
                        grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger}
                    />
                ))}
            </div>
        </div>
    );
};

const Vilkårsting = (props: {
    info: Vilkårsinformasjon;
    søknadInnhold: SøknadInnhold;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    switch (props.info.vilkårtype) {
        case VilkårtypeAlder.Alderspensjon:
            return isAldersøknad(props.søknadInnhold) ? (
                <AlderspensjonVilkårsblokk
                    status={props.info.status}
                    søknadInnhold={props.søknadInnhold}
                    grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger.pensjon}
                />
            ) : null;
        case VilkårtypeAlder.Familieforening:
            return isAldersøknad(props.søknadInnhold) ? (
                <FamilieforeningVilkårsblokk
                    status={props.info.status}
                    søknadInnhold={props.søknadInnhold}
                    grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger.familiegjenforening}
                />
            ) : null;
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
                    status={props.info.status}
                    søknadInnhold={props.søknadInnhold}
                    flyktningVilkår={props.grunnlagsdataOgVilkårsvurderinger.flyktning}
                />
            ) : null;
        case Vilkårtype.LovligOpphold:
            return (
                <LovligOppholdVilkårsblokk
                    info={props.info}
                    søknadInnhold={props.søknadInnhold}
                    lovligOpphold={props.grunnlagsdataOgVilkårsvurderinger.lovligOpphold}
                />
            );
        case Vilkårtype.FastOppholdINorge:
            return (
                <FastOppholdVilkårsblokk
                    status={props.info.status}
                    søknadInnhold={props.søknadInnhold}
                    grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger.fastOpphold}
                />
            );
        case Vilkårtype.Institusjonsopphold:
            return (
                <InstitusjonsoppholdVilkårsblokk
                    info={props.info}
                    søknadInnhold={props.søknadInnhold}
                    institusjonsopphold={props.grunnlagsdataOgVilkårsvurderinger.institusjonsopphold}
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
                />
            );
        case Vilkårtype.PersonligOppmøte:
            return (
                <PersonligOppmøteVilkårsblokk
                    info={props.info}
                    søknadInnhold={props.søknadInnhold}
                    personligOppmøte={props.grunnlagsdataOgVilkårsvurderinger.personligOppmøte}
                />
            );
        default:
            return null;
    }
};

export default VilkårsOppsummering;
