import { RevurderingSteg } from '~pages/saksbehandling/types';

export const stegmessages: { [key in RevurderingSteg]: string } = {
    [RevurderingSteg.Periode]: 'Periode',
    [RevurderingSteg.Uførhet]: 'Uførhet',
    [RevurderingSteg.Bosituasjon]: 'Bosituasjon',
    [RevurderingSteg.EndringAvFradrag]: 'Inntekt',
    [RevurderingSteg.Formue]: 'Formue',
    [RevurderingSteg.Utenlandsopphold]: 'Utenlandsopphold',
    [RevurderingSteg.Oppsummering]: 'Oppsummering',
};

export default {
    'feil.fantIkkeRevurdering': 'Fant ikke revurdering',
};
