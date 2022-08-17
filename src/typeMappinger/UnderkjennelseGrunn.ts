import { UnderkjennelseGrunn } from '~src/types/Behandling';

export const underkjennelsesGrunnTextMapper: { [key in UnderkjennelseGrunn]: string } = {
    [UnderkjennelseGrunn.ANDRE_FORHOLD]: 'Andre forhold',
    [UnderkjennelseGrunn.BEREGNINGEN_ER_FEIL]: 'Beregningen er feil',
    [UnderkjennelseGrunn.DOKUMENTASJON_MANGLER]: 'Dokumentasjon mangler',
    [UnderkjennelseGrunn.INNGANGSVILKÅRENE_ER_FEILVURDERT]: 'Inngangsvilkårene er feilvurdert',
    [UnderkjennelseGrunn.VEDTAKSBREVET_ER_FEIL]: 'Vedtaksbrev er feil',
};
