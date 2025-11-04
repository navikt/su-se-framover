import { Person } from '~src/types/Person';
import { Sak, SakvarselType } from '~src/types/Sak';

import { erTilbakekrevingsbehandlingÅpen } from './ManuellTilbakekrevingsbehandlingUtils';

export interface SakvarseltypeMedContext {
    type: SakvarselType;
    context?: { behandlingId: string };
}

export const getSakvarsler = (arg: { sak: Sak; søker: Person }): SakvarseltypeMedContext[] => {
    const varsel = [];

    if (arg.sak.fnr !== arg.søker.fnr) {
        varsel.push({ type: SakvarselType.FNR_ENDRING });
    }

    if (arg.sak.tilbakekrevinger.length > 0) {
        arg.sak.tilbakekrevinger.filter(erTilbakekrevingsbehandlingÅpen).forEach((t) => {
            if (t.erKravgrunnlagUtdatert) {
                varsel.push({
                    type: SakvarselType.NYTT_KRAVGRUNNLAG_MED_ÅPEN_TILBAKEKREVING,
                    context: { behandlingId: t.id },
                });
            }
        });
    }
    if (arg.sak.uteståendeKravgrunnlag !== null && !arg.sak.tilbakekrevinger.some(erTilbakekrevingsbehandlingÅpen)) {
        varsel.push({
            type: SakvarselType.NYTT_KRAVGRUNNLAG_UTEN_ÅPEN_TILBAKEKREVING,
        });
    }
    return varsel;
};
