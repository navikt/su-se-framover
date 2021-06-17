import { toDateOrNull } from '~lib/dateUtils';
import { Behandling, Behandlingsstatus } from '~types/Behandling';
import { Fradrag, FradragTilhører } from '~types/Fradrag';

export const erIGyldigStatusForÅKunneBeregne = (behandling: Behandling) =>
    [
        Behandlingsstatus.BEREGNET_AVSLAG,
        Behandlingsstatus.BEREGNET_INNVILGET,
        Behandlingsstatus.SIMULERT,
        Behandlingsstatus.VILKÅRSVURDERT_INNVILGET,
        Behandlingsstatus.UNDERKJENT_AVSLAG,
        Behandlingsstatus.UNDERKJENT_INNVILGET,
    ].some((status) => status === behandling.status);

export const fradragTilFradragFormData = (fradrag: Fradrag) => ({
    type: fradrag.type || null,
    beløp: fradrag.beløp.toString() || null,
    fraUtland: fradrag.utenlandskInntekt !== null,
    utenlandskInntekt: {
        beløpIUtenlandskValuta: fradrag.utenlandskInntekt?.beløpIUtenlandskValuta.toString() ?? '',
        valuta: fradrag.utenlandskInntekt?.valuta ?? '',
        kurs: fradrag.utenlandskInntekt?.kurs.toString() ?? '',
    },
    tilhørerEPS: fradrag.tilhører === FradragTilhører.EPS,
    periode: {
        fraOgMed: toDateOrNull(fradrag.periode?.fraOgMed),
        tilOgMed: toDateOrNull(fradrag.periode?.tilOgMed),
    },
});
