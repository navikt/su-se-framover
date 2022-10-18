import { formatISO } from 'date-fns';

import { Fradrag, FradragTilhører, VelgbareFradragskategorier } from '~src/types/Fradrag';
import { Periode } from '~src/types/Periode';
import { Søknadsbehandling, SøknadsbehandlingStatus } from '~src/types/Søknadsbehandling';
import { toDateOrNull } from '~src/utils/date/dateUtils';

import { FradragFormData } from '../components/beregningOgSimulering/beregning/fradragInputs/FradragInputs';

export const erIGyldigStatusForÅKunneBeregne = (behandling: Søknadsbehandling) =>
    [
        SøknadsbehandlingStatus.BEREGNET_AVSLAG,
        SøknadsbehandlingStatus.BEREGNET_INNVILGET,
        SøknadsbehandlingStatus.SIMULERT,
        SøknadsbehandlingStatus.VILKÅRSVURDERT_INNVILGET,
        SøknadsbehandlingStatus.UNDERKJENT_AVSLAG,
        SøknadsbehandlingStatus.UNDERKJENT_INNVILGET,
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
});
