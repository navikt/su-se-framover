import { formatISO } from 'date-fns';

import { Behandling, Behandlingsstatus } from '~src/types/Behandling';
import { Fradrag, FradragTilhører, VelgbareFradragskategorier } from '~src/types/Fradrag';
import { Periode } from '~src/types/Periode';
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
    kategori: fradrag.type || null,
    beløp: fradrag.beløp.toString() || null,
    spesifisertkategori: fradrag.beskrivelse,
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

export const fradragFormdataTilFradrag = (f: FradragFormData, defaultPeriode: Periode<Date>): Fradrag => ({
    //valdiering sikrer at feltet ikke er null
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    periode:
        f.periode?.fraOgMed && f.periode.tilOgMed
            ? {
                  fraOgMed: formatISO(f.periode.fraOgMed, { representation: 'date' }),
                  tilOgMed: formatISO(f.periode.tilOgMed, { representation: 'date' }),
              }
            : {
                  fraOgMed: formatISO(defaultPeriode.fraOgMed, { representation: 'date' }),
                  tilOgMed: formatISO(defaultPeriode.tilOgMed, { representation: 'date' }),
              },

    beløp: parseInt(f.beløp!, 10),
    type: f.kategori!,
    utenlandskInntekt: f.fraUtland
        ? {
              beløpIUtenlandskValuta: parseInt(f.utenlandskInntekt.beløpIUtenlandskValuta),
              valuta: f.utenlandskInntekt.valuta,
              kurs: Number.parseFloat(f.utenlandskInntekt.kurs),
          }
        : null,
    tilhører: f.tilhørerEPS ? FradragTilhører.EPS : FradragTilhører.Bruker,
    beskrivelse: f.kategori === VelgbareFradragskategorier.Annet ? f.spesifisertkategori : null,
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
});
