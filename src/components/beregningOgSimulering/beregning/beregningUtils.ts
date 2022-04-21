import { Behandling, Behandlingsstatus } from '~src/types/Behandling';
import { Fradrag, FradragTilhører } from '~src/types/Fradrag';
import { toDateOrNull } from '~src/utils/date/dateUtils';

import { FradragFormData } from './fradragInputs/FradragInputs';

export const erIGyldigStatusForÅKunneBeregne = (behandling: Behandling) =>
    [
        Behandlingsstatus.BEREGNET_AVSLAG,
        Behandlingsstatus.BEREGNET_INNVILGET,
        Behandlingsstatus.SIMULERT,
        Behandlingsstatus.VILKÅRSVURDERT_INNVILGET,
        Behandlingsstatus.UNDERKJENT_AVSLAG,
        Behandlingsstatus.UNDERKJENT_INNVILGET,
    ].some((status) => status === behandling.status);

export const fradragTilFradragFormData = (fradrag: Fradrag): FradragFormData => ({
    kategori: fradrag.fradragskategoriWrapper.kategori || null,
    beløp: fradrag.beløp.toString() || null,
    spesifisertkategori: fradrag.fradragskategoriWrapper.spesifisertKategori,
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
