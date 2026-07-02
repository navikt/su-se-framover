import { Heading, Ingress } from '@navikt/ds-react';
import { useEffect, useRef } from 'react';
import styles from 'src/pages/søknad/index.module.less';
import * as routes from '~src/lib/routes.ts';
import AndreForhold from '~src/pages/kontrollsamtale/steg/andreforhold/AndreForhold.tsx';
import FullmaktOgLegeerklæring from '~src/pages/kontrollsamtale/steg/fullmakt/FullmaktOgLegeerklæring.tsx';
import Oppsummering from '~src/pages/kontrollsamtale/steg/oppsummering/Oppsummering.tsx';
import OriginalPass from '~src/pages/kontrollsamtale/steg/pass/OriginalPass.tsx';
import PersonligOppmøte from '~src/pages/kontrollsamtale/steg/personligOppmøte/PersonligOppmøte.tsx';
import SkatteOpplysninger from '~src/pages/kontrollsamtale/steg/skatteopplysninger/SkatteOpplysninger.tsx';
import Utenlandsopphold from '~src/pages/kontrollsamtale/steg/utenlandsopphold/Utenlandsopphold.tsx';
import ØkonomiskSituasjon from '~src/pages/kontrollsamtale/steg/økonomi/ØkonomiskSituasjon.tsx';
import { KontrollsamtaleSteg } from '~src/pages/kontrollsamtale/types.ts';

const Steg = (props: { step: KontrollsamtaleSteg; title: string; hjelpetekst?: string; sakId: string }) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        sectionRef.current?.focus();
    }, [props.step]);

    return (
        <section aria-labelledby="steg-heading">
            <div className={styles.stegHeadingContainer} ref={sectionRef} tabIndex={-1}>
                <Heading id="steg-heading" level="1" size="large" spacing>
                    {props.title}
                </Heading>
                {props.hjelpetekst && <Ingress>{props.hjelpetekst}</Ingress>}
            </div>
            <ShowSteg step={props.step} sakId={props.sakId} />
        </section>
    );
};
const ShowSteg = (props: { step: KontrollsamtaleSteg; sakId: string }) => {
    const avbrytUrl = routes.soknad.createURL();

    if (!props.sakId) {
        throw new Error('Mangler sakId');
    }
    switch (props.step) {
        case KontrollsamtaleSteg.PersonligOppmøte:
            return (
                <PersonligOppmøte
                    nesteUrl={routes.kontrollsamtaleUtfylling.createURL({
                        step: KontrollsamtaleSteg.FullmaktOgLegeerklæring,
                        sakId: props.sakId,
                    })}
                    avbrytUrl={avbrytUrl}
                />
            );
        case KontrollsamtaleSteg.FullmaktOgLegeerklæring:
            return (
                <FullmaktOgLegeerklæring
                    nesteUrl={routes.kontrollsamtaleUtfylling.createURL({
                        step: KontrollsamtaleSteg.OriginalPass,
                        sakId: props.sakId,
                    })}
                    forrigeUrl={routes.kontrollsamtaleUtfylling.createURL({
                        step: KontrollsamtaleSteg.PersonligOppmøte,
                        sakId: props.sakId,
                    })}
                    avbrytUrl={avbrytUrl}
                />
            );
        case KontrollsamtaleSteg.OriginalPass:
            return (
                <OriginalPass
                    nesteUrl={routes.kontrollsamtaleUtfylling.createURL({
                        step: KontrollsamtaleSteg.ReisetilUtlandet,
                        sakId: props.sakId,
                    })}
                    forrigeUrl={routes.kontrollsamtaleUtfylling.createURL({
                        step: KontrollsamtaleSteg.FullmaktOgLegeerklæring,
                        sakId: props.sakId,
                    })}
                    avbrytUrl={avbrytUrl}
                />
            );
        case KontrollsamtaleSteg.ReisetilUtlandet:
            return (
                <Utenlandsopphold
                    nesteUrl={routes.kontrollsamtaleUtfylling.createURL({
                        step: KontrollsamtaleSteg.ØkonomiskSituasjon,
                        sakId: props.sakId,
                    })}
                    forrigeUrl={routes.kontrollsamtaleUtfylling.createURL({
                        step: KontrollsamtaleSteg.OriginalPass,
                        sakId: props.sakId,
                    })}
                    avbrytUrl={avbrytUrl}
                />
            );
        case KontrollsamtaleSteg.ØkonomiskSituasjon:
            return (
                <ØkonomiskSituasjon
                    nesteUrl={routes.kontrollsamtaleUtfylling.createURL({
                        step: KontrollsamtaleSteg.AndreForhold,
                        sakId: props.sakId,
                    })}
                    forrigeUrl={routes.kontrollsamtaleUtfylling.createURL({
                        step: KontrollsamtaleSteg.ReisetilUtlandet,
                        sakId: props.sakId,
                    })}
                    avbrytUrl={avbrytUrl}
                />
            );
        case KontrollsamtaleSteg.AndreForhold:
            return (
                <AndreForhold
                    nesteUrl={routes.kontrollsamtaleUtfylling.createURL({
                        step: KontrollsamtaleSteg.SkatteOpplysninger,
                        sakId: props.sakId,
                    })}
                    forrigeUrl={routes.kontrollsamtaleUtfylling.createURL({
                        step: KontrollsamtaleSteg.ØkonomiskSituasjon,
                        sakId: props.sakId,
                    })}
                    avbrytUrl={avbrytUrl}
                />
            );
        case KontrollsamtaleSteg.SkatteOpplysninger:
            return (
                <SkatteOpplysninger
                    nesteUrl={routes.kontrollsamtaleUtfylling.createURL({
                        step: KontrollsamtaleSteg.Oppsummering,
                        sakId: props.sakId,
                    })}
                    forrigeUrl={routes.kontrollsamtaleUtfylling.createURL({
                        step: KontrollsamtaleSteg.AndreForhold,
                        sakId: props.sakId,
                    })}
                    avbrytUrl={avbrytUrl}
                />
            );
        case KontrollsamtaleSteg.Oppsummering:
            return (
                <Oppsummering
                    forrigeUrl={routes.kontrollsamtaleUtfylling.createURL({
                        step: KontrollsamtaleSteg.SkatteOpplysninger,
                        sakId: props.sakId,
                    })}
                    avbrytUrl={avbrytUrl}
                    nesteUrl={avbrytUrl} //todo: viderefør til kvittering (annen pr)
                />
            );
    }
};

export default Steg;
