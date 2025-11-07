import { Heading, Ingress } from '@navikt/ds-react';
import { useEffect, useRef } from 'react';

import { SøknadState } from '~src/features/søknad/søknad.slice';
import { DelerBoligMed } from '~src/features/søknad/types';
import * as routes from '~src/lib/routes';
import styles from '~src/pages/søknad/index.module.less';
import Alderspensjon from '~src/pages/søknad/steg/alderspensjon/Alderspensjon';
import BoOgOppholdINorge from '~src/pages/søknad/steg/bo-og-opphold-i-norge/Bo-og-opphold-i-norge';
import FlyktningstatusOppholdstillatelse from '~src/pages/søknad/steg/flyktningstatus-oppholdstillatelse/Flyktningstatus-oppholdstillatelse';
import ForVeileder from '~src/pages/søknad/steg/for-veileder/ForVeileder';
import EktefellesFormue from '~src/pages/søknad/steg/formue/epsFormue/EktefellesFormue';
import Formue from '~src/pages/søknad/steg/formue/søkersFormue/DinFormue';
import InformasjonOmPapirsøknad from '~src/pages/søknad/steg/informasjon-om-papirsøknad/InformasjonOmPapirsøknad';
import EktefellesInntekt from '~src/pages/søknad/steg/inntekt/epsInntekt/EktefellesInntekt';
import Inntekt from '~src/pages/søknad/steg/inntekt/søkersInntekt/Inntekt';
import Oppholdstillatelse from '~src/pages/søknad/steg/oppholdstillatelse/Oppholdstillatelse';
import Oppsummering from '~src/pages/søknad/steg/oppsummering/Oppsummering';
import Uførevedtak from '~src/pages/søknad/steg/uførevedtak/Uførevedtak';
import Utenlandsopphold from '~src/pages/søknad/steg/utenlandsopphold/Utenlandsopphold';
import { Alderssteg, Fellessteg, Søknadssteg, Uføresteg } from '~src/pages/søknad/types';
import { Person } from '~src/types/Person';
import { Sakstype } from '~src/types/Sak';
import { Søknadstype } from '~src/types/Søknadinnhold';

export const Steg = (props: {
    title: string;
    step: Søknadssteg;
    sakstype: Sakstype;
    søknad: SøknadState;
    søker: Person;
    erSaksbehandler: boolean;
    hjelpetekst?: string;
}) => {
    const sectionRef = useRef<HTMLDivElement>(null);

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
                sakstype={props.sakstype}
                søknad={props.søknad}
                søker={props.søker}
                erSaksbehandler={props.erSaksbehandler}
            />
        </section>
    );
};

const ShowSteg = (props: {
    step: Søknadssteg;
    sakstype: Sakstype;
    søknad: SøknadState;
    søker: Person;
    erSaksbehandler: boolean;
}) => {
    const avbrytUrl = routes.soknadPersonSøk.createURL({
        papirsøknad: props.erSaksbehandler && props.søknad.forVeileder.type === Søknadstype.Papirsøknad,
        soknadstema: routes.urlForSakstype(props.sakstype),
    });
    const stegUrl = (steg: Søknadssteg) =>
        routes.soknadsutfylling.createURL({
            step: steg,
            soknadstema: routes.urlForSakstype(props.sakstype),
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
                    nesteUrl={stegUrl(Alderssteg.Oppholdstillatelse)}
                    forrigeUrl={avbrytUrl}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Alderssteg.Oppholdstillatelse:
            return (
                <Oppholdstillatelse
                    nesteUrl={stegUrl(Fellessteg.BoOgOppholdINorge)}
                    forrigeUrl={stegUrl(Alderssteg.Alderspensjon)}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Fellessteg.BoOgOppholdINorge:
            return (
                <BoOgOppholdINorge
                    forrigeUrl={stegUrl(
                        props.sakstype === Sakstype.Uføre
                            ? Uføresteg.FlyktningstatusOppholdstillatelse
                            : Alderssteg.Oppholdstillatelse,
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
                        soknadstema: routes.urlForSakstype(props.sakstype),
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
                            : Fellessteg.InformasjonOmPapirsøknad,
                    )}
                    nesteUrl={routes.søknadskvittering.createURL({
                        soknadstema: routes.urlForSakstype(props.sakstype),
                    })}
                    avbrytUrl={avbrytUrl}
                    søker={props.søker}
                />
            );
    }
};
