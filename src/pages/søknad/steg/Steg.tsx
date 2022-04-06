import { Heading, Ingress } from '@navikt/ds-react';
import { useEffect } from 'react';
import * as React from 'react';

import { Person } from '~src/api/personApi';
import { SøknadState } from '~src/features/søknad/søknad.slice';
import { DelerBoligMed } from '~src/features/søknad/types';
import * as routes from '~src/lib/routes';
import * as styles from '~src/pages/søknad/index.module.less';
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
import { Søknadsteg } from '~src/pages/søknad/types';
import { Søknadstype } from '~src/types/Søknad';

export const Steg = (props: {
    title: string;
    step: Søknadsteg;
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
                søknad={props.søknad}
                søker={props.søker}
                erSaksbehandler={props.erSaksbehandler}
            />
        </section>
    );
};

const ShowSteg = (props: { step: Søknadsteg; søknad: SøknadState; søker: Person; erSaksbehandler: boolean }) => {
    const avbrytUrl =
        props.søknad.forVeileder.type === Søknadstype.Papirsøknad && props.erSaksbehandler
            ? routes.soknadPersonSøk.createURL({ papirsøknad: true })
            : routes.soknad.createURL();

    const stegUrl = (steg: Søknadsteg) =>
        routes.soknadsutfylling.createURL({
            step: steg,
        });

    switch (props.step) {
        case Søknadsteg.Uførevedtak:
            return (
                <Uførevedtak
                    forrigeUrl={avbrytUrl}
                    nesteUrl={stegUrl(Søknadsteg.FlyktningstatusOppholdstillatelse)}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.FlyktningstatusOppholdstillatelse:
            return (
                <FlyktningstatusOppholdstillatelse
                    forrigeUrl={stegUrl(Søknadsteg.Uførevedtak)}
                    nesteUrl={stegUrl(Søknadsteg.BoOgOppholdINorge)}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.BoOgOppholdINorge:
            return (
                <BoOgOppholdINorge
                    forrigeUrl={stegUrl(Søknadsteg.FlyktningstatusOppholdstillatelse)}
                    nesteUrl={stegUrl(Søknadsteg.DinFormue)}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.DinFormue:
            return (
                <Formue
                    forrigeUrl={stegUrl(Søknadsteg.BoOgOppholdINorge)}
                    nesteUrl={stegUrl(Søknadsteg.DinInntekt)}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.DinInntekt:
            return (
                <Inntekt
                    forrigeUrl={stegUrl(Søknadsteg.DinFormue)}
                    nesteUrl={
                        props.søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER
                            ? stegUrl(Søknadsteg.EktefellesFormue)
                            : stegUrl(Søknadsteg.ReiseTilUtlandet)
                    }
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.EktefellesFormue:
            return (
                <EktefellesFormue
                    forrigeUrl={stegUrl(Søknadsteg.DinInntekt)}
                    nesteUrl={stegUrl(Søknadsteg.EktefellesInntekt)}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.EktefellesInntekt:
            return (
                <EktefellesInntekt
                    forrigeUrl={stegUrl(Søknadsteg.EktefellesFormue)}
                    nesteUrl={stegUrl(Søknadsteg.ReiseTilUtlandet)}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.ReiseTilUtlandet:
            return (
                <Utenlandsopphold
                    forrigeUrl={
                        props.søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER
                            ? stegUrl(Søknadsteg.EktefellesInntekt)
                            : stegUrl(Søknadsteg.DinInntekt)
                    }
                    nesteUrl={routes.soknadsutfylling.createURL({
                        step:
                            props.søknad.forVeileder.type === Søknadstype.DigitalSøknad
                                ? Søknadsteg.ForVeileder
                                : Søknadsteg.InformasjonOmPapirsøknad,
                    })}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.ForVeileder:
            return (
                <ForVeileder
                    søker={props.søker}
                    forrigeUrl={stegUrl(Søknadsteg.ReiseTilUtlandet)}
                    nesteUrl={stegUrl(Søknadsteg.Oppsummering)}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.InformasjonOmPapirsøknad:
            return (
                <InformasjonOmPapirsøknad
                    forrigeUrl={stegUrl(Søknadsteg.ReiseTilUtlandet)}
                    nesteUrl={stegUrl(Søknadsteg.Oppsummering)}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.Oppsummering:
            return (
                <Oppsummering
                    forrigeUrl={stegUrl(
                        props.søknad.forVeileder.type === Søknadstype.DigitalSøknad
                            ? Søknadsteg.ForVeileder
                            : Søknadsteg.InformasjonOmPapirsøknad
                    )}
                    nesteUrl={routes.søkandskvittering.createURL()}
                    avbrytUrl={avbrytUrl}
                    søker={props.søker}
                />
            );
    }
};
