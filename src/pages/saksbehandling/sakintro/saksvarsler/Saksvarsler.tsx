import { Alert, BodyShort } from '@navikt/ds-react';

import { Person } from '~src/types/Person';
import { Sak, SakvarselType } from '~src/types/Sak';
import { getSakvarsler, SakvarseltypeMedContext } from '~src/utils/SakUtils';

import FnrEndringsvarsel from './fnrEndringsvarsel/FnrEndringsvarsel';
import NyttKravgrunnlagsvarsel from './nyttKravgrunnlagsvarsel/NyttKravgrunnlagsvarsel';
import styles from './Saksvarsler.module.less';

const Saksvarsler = (props: { sak: Sak; søker: Person }) => {
    const varsler = getSakvarsler({ sak: props.sak, søker: props.søker });

    if (varsler.length === 0) {
        return null;
    }

    return (
        <Alert variant={'warning'} className={styles.alert}>
            <ul>
                {varsler.map((v, i) => (
                    <li key={i}>{saksvarseltypeToComponent({ sak: props.sak, søker: props.søker, varsel: v })}</li>
                ))}
            </ul>
        </Alert>
    );
};

const saksvarseltypeToComponent = (arg: { sak: Sak; søker: Person; varsel: SakvarseltypeMedContext }) => {
    switch (arg.varsel.type) {
        case SakvarselType.FNR_ENDRING:
            return <FnrEndringsvarsel sak={arg.sak} søker={arg.søker} />;
        case SakvarselType.NYTT_KRAVGRUNNLAG_MED_ÅPEN_TILBAKEKREVING: {
            if (!arg.varsel.context?.behandlingId) {
                return (
                    <BodyShort>
                        Har identifisert et nytt kravgrunnlag på sak, men mangler behandlingscontext - Behov for å sende
                        en melding til utviklerne fordi vi er så primitive
                    </BodyShort>
                );
            }
            if (!arg.sak.uteståendeKravgrunnlag) {
                return (
                    <BodyShort>
                        Har identifisert et nytt kravgrunnlag på sak, men mangler det utestående kravgrunnlaget på sak -
                        Behov for å sende en melding til utviklerne fordi vi er så primitive
                    </BodyShort>
                );
            }
            const behandling = arg.sak.tilbakekrevinger.find((t) => t.id === arg.varsel.context!.behandlingId);

            if (!behandling) {
                return (
                    <BodyShort>
                        Har identifisert et nytt kravgrunnlag på sak, men fant ikke behandlingen på sak - Behov for å
                        sende en melding til utviklerne fordi vi er så primitive
                    </BodyShort>
                );
            }
            return (
                <NyttKravgrunnlagsvarsel
                    saksversjon={arg.sak.versjon}
                    uteståendeKravgrunnlag={arg.sak.uteståendeKravgrunnlag}
                    behandling={behandling}
                />
            );
        }
        case SakvarselType.NYTT_KRAVGRUNNLAG_UTEN_ÅPEN_TILBAKEKREVING: {
            return <BodyShort>Det er mottatt kravgrunnlag til tilbakekrevingssak</BodyShort>;
        }
    }
};

export default Saksvarsler;
