import { UnderkjennelseGrunn, UnderkjennelseGrunnBehandling } from '~src/types/Behandling';
import { UnderkjennelseGrunnTilbakekreving } from '~src/types/ManuellTilbakekrevingsbehandling';
import { UnderkjennelseGrunnRegulering } from '~src/types/Regulering';

export const underkjennelsesGrunnTextMapper: { [key in UnderkjennelseGrunn]: string } = {
    [UnderkjennelseGrunnBehandling.ANDRE_FORHOLD]: 'Andre forhold',
    [UnderkjennelseGrunnBehandling.BEREGNINGEN_ER_FEIL]: 'Beregningen er feil',
    [UnderkjennelseGrunnBehandling.DOKUMENTASJON_MANGLER]: 'Dokumentasjon mangler',
    [UnderkjennelseGrunnBehandling.INNGANGSVILKÅRENE_ER_FEILVURDERT]: 'Inngangsvilkårene er feilvurdert',
    [UnderkjennelseGrunnBehandling.VEDTAKSBREVET_ER_FEIL]: 'Vedtaksbrev er feil',
    [UnderkjennelseGrunnTilbakekreving.IKKE_GRUNNLAG_FOR_TILBAKEKREVING]: 'Ikke grunnlag for tilbakekreving',
    [UnderkjennelseGrunnTilbakekreving.MANGLER_FORHÅNDSVARSEL]: 'Mangler forhåndsvarsel',
    [UnderkjennelseGrunnTilbakekreving.SKAL_AVKORTES]: 'Skal avkortes',
    [UnderkjennelseGrunnTilbakekreving.UTDATERT_KRAVGRUNNLAG]: 'Utdatert kravgrunnlag',
    [UnderkjennelseGrunnTilbakekreving.VURDERINGEN_ER_FEIL]: 'Vurderingen er feil',
    [UnderkjennelseGrunnRegulering.REGULERING_ER_FEIL]: 'Regulering er feil',
};
