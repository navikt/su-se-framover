import { Kontrollsamtale, KontrollsamtaleStatus } from '~src/types/Kontrollsamtale';

export const erKontrollsamtaleGjennomført = (k: Kontrollsamtale) => k.status === KontrollsamtaleStatus.GJENNOMFØRT;
export const erKontrollsamtaleAnnullert = (k: Kontrollsamtale) => k.status === KontrollsamtaleStatus.ANNULLERT;
export const erKontrollsamtaleIkkeMøttInnenFrist = (k: Kontrollsamtale) =>
    k.status === KontrollsamtaleStatus.IKKE_MØTT_INNEN_FRIST;
