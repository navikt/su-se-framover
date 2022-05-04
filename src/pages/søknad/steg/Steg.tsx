import { Heading, Ingress } from '@navikt/ds-react';
import * as React from 'react';
import { useEffect } from 'react';

import { Person } from '~src/api/personApi';
import { SøknadState } from '~src/features/søknad/søknad.slice';
import { DelerBoligMed } from '~src/features/søknad/types';
import * as routes from '~src/lib/routes';
import * as styles from '~src/pages/søknad/index.module.less';
import Alderspensjon from '~src/pages/søknad/steg/alderspensjon/Alderspensjon';
import BoOgOppholdINorge from '~src/pages/søknad/steg/bo-og-opphold-i-norge/Bo-og-opphold-i-norge';
import FlyktningstatusOppholdstillatelse from '~src/pages/søknad/steg/flyktningstatus-oppholdstillatelse/Flyktningstatus-oppholdstillatelse';
import ForVeileder from '~src/pages/søknad/steg/for-veileder/ForVeileder';
import EktefellesFormue from '~src/pages/søknad/steg/formue/epsFormue/EktefellesFormue';
import Formue from '~src/pages/søknad/steg/formue/søkersFormue/DinFormue';
import InformasjonOmPapirsøknad from '~src/pages/søknad/steg/informasjon-om-papirsøknad/InformasjonOmPapirsøknad';
import EktefellesInntekt from '~src/pages/søknad/steg/inntekt/epsInntekt/EktefellesInntekt';
import Inntekt from '~src/pages/søknad/steg/inntekt/søkersInntekt/Inntekt';
import Oppsummering from '~src/pages/søknad/steg/oppsummering/Oppsummering';
import Uførevedtak from '~src/pages/søknad/steg/uførevedtak/Uførevedtak';
import Utenlandsopphold from '~src/pages/søknad/steg/utenlandsopphold/Utenlandsopphold';
import { Alderssteg, Fellessteg, Søknadssteg, Uføresteg } from '~src/pages/søknad/types';
import { Søknadstema, Søknadstype } from '~src/types/Søknad';

export const Steg = (props: {
    title: string;
    step: Søknadssteg;
    soknadstema: Søknadstema;
    søknad: SøknadState;
    søker: Person;
    erSaksbehandler: boolean;
    hjelpetekst?: string;
}) => {
    const sectionRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (sectionRef.current) {
            sectionRef.current.focus();
        }
    }, [props.step]);

    return (
        <section aria-labelledby="steg-heading">
            <div className={styles.stegHeadingContainer} ref={sectionRef} tabIndex={-1}>
                <Heading id="steg-heading" level="1" size="large" spacing>
                    {props.title}
                </Heading>
                <Ingress>{props.hjelpetekst}</Ingress>
            </div>
            <ShowSteg
                step={props.step}
                soknadstema={props.soknadstema}
                søknad={props.søknad}
                søker={props.søker}
                erSaksbehandler={props.erSaksbehandler}
            />
        </section>
    );
};

const ShowSteg = (props: {
    step: Søknadssteg;
    soknadstema: Søknadstema;
    søknad: SøknadState;
    søker: Person;
    erSaksbehandler: boolean;
}) => {
    const avbrytUrl = props.erSaksbehandler // TOOD: Hva er egentlig ønsket funksjonalitet her?
        ? routes.soknadPersonSøk.createURL({
              papirsøknad: props.søknad.forVeileder.type === Søknadstype.Papirsøknad,
              soknadstema: props.soknadstema,
          })
        : routes.soknad.createURL();

    const stegUrl = (steg: Søknadssteg) =>
        routes.soknadsutfylling.createURL({
            step: steg,
            soknadstema: props.soknadstema,
        });

    switch (props.step) {
        case Uføresteg.Uførevedtak:
            return (
                <Uførevedtak
                    forrigeUrl={avbrytUrl}
                    nesteUrl={stegUrl(Uføresteg.FlyktningstatusOppholdstillatelse)}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Uføresteg.FlyktningstatusOppholdstillatelse:
            return (
                <FlyktningstatusOppholdstillatelse
                    forrigeUrl={stegUrl(Uføresteg.Uførevedtak)}
                    nesteUrl={stegUrl(Fellessteg.BoOgOppholdINorge)}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Alderssteg.Alderspensjon:
            return (
                <Alderspensjon
                    nesteUrl={stegUrl(Fellessteg.BoOgOppholdINorge)}
                    forrigeUrl={avbrytUrl}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Fellessteg.BoOgOppholdINorge:
            return (
                <BoOgOppholdINorge
                    forrigeUrl={stegUrl(
                        props.soknadstema === Søknadstema.Uføre
                            ? Uføresteg.FlyktningstatusOppholdstillatelse
                            : Alderssteg.Alderspensjon
                    )}
                    nesteUrl={stegUrl(Fellessteg.DinFormue)}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Fellessteg.DinFormue:
            return (
                <Formue
                    forrigeUrl={stegUrl(Fellessteg.BoOgOppholdINorge)}
                    nesteUrl={stegUrl(Fellessteg.DinInntekt)}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Fellessteg.DinInntekt:
            return (
                <Inntekt
                    forrigeUrl={stegUrl(Fellessteg.DinFormue)}
                    nesteUrl={
                        props.søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER
                            ? stegUrl(Fellessteg.EktefellesFormue)
                            : stegUrl(Fellessteg.ReiseTilUtlandet)
                    }
                    avbrytUrl={avbrytUrl}
                />
            );
        case Fellessteg.EktefellesFormue:
            return (
                <EktefellesFormue
                    forrigeUrl={stegUrl(Fellessteg.DinInntekt)}
                    nesteUrl={stegUrl(Fellessteg.EktefellesInntekt)}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Fellessteg.EktefellesInntekt:
            return (
                <EktefellesInntekt
                    forrigeUrl={stegUrl(Fellessteg.EktefellesFormue)}
                    nesteUrl={stegUrl(Fellessteg.ReiseTilUtlandet)}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Fellessteg.ReiseTilUtlandet:
            return (
                <Utenlandsopphold
                    forrigeUrl={
                        props.søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER
                            ? stegUrl(Fellessteg.EktefellesInntekt)
                            : stegUrl(Fellessteg.DinInntekt)
                    }
                    nesteUrl={routes.soknadsutfylling.createURL({
                        soknadstema: props.soknadstema,
                        step:
                            props.søknad.forVeileder.type === Søknadstype.DigitalSøknad
                                ? Fellessteg.ForVeileder
                                : Fellessteg.InformasjonOmPapirsøknad,
                    })}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Fellessteg.ForVeileder:
            return (
                <ForVeileder
                    søker={props.søker}
                    forrigeUrl={stegUrl(Fellessteg.ReiseTilUtlandet)}
                    nesteUrl={stegUrl(Fellessteg.Oppsummering)}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Fellessteg.InformasjonOmPapirsøknad:
            return (
                <InformasjonOmPapirsøknad
                    forrigeUrl={stegUrl(Fellessteg.ReiseTilUtlandet)}
                    nesteUrl={stegUrl(Fellessteg.Oppsummering)}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Fellessteg.Oppsummering:
            return (
                <Oppsummering
                    forrigeUrl={stegUrl(
                        props.søknad.forVeileder.type === Søknadstype.DigitalSøknad
                            ? Fellessteg.ForVeileder
                            : Fellessteg.InformasjonOmPapirsøknad
                    )}
                    nesteUrl={routes.søkandskvittering.createURL()}
                    avbrytUrl={avbrytUrl}
                    søker={props.søker}
                />
            );
    }
};
