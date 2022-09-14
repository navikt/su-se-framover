import {
    opplysningspliktStatusMessages,
    uførevilkårstatusMessages,
    utenlandsoppholdStatusMessages,
    vilkårstatusMessages,
} from '~src/typeMappinger/Vilkårsstatus';

import {
    ikkeVelgbareFradragskategoriMessages,
    velgbareFradragskategoriMessages,
} from '../beregningOgSimulering/beregning/fradragInputs/fradragInputs-nb';

export default {
    'uførhet.vilkår.erOppfylt': 'Er vilkår §12-4 til §12-7 i folketrygdloven oppfylt?',
    'uførhet.grunnlag.uføregrad': 'Uføregrad',
    'uførhet.grunnlag.forventetInntekt': 'Forventet inntekt etter uførhet',

    'bosituasjon.sats': 'Sats',
    'bosituasjon.harEPS': 'Har søker ektefelle eller samboer?',
    'bosituasjon.delerBolig': 'Deler søker bolig med noen over 18 år?',
    'bosituasjon.eps.fnr': 'Ektefelles/samboers fødselsnummer',
    'bosituasjon.eps.erEpsUførFlyktning': 'Er ektefelle/samboer ufør flyktning',
    'bosituasjon.ORDINÆR': 'Ordinær',
    'bosituasjon.HØY': 'Høy',
    'bosituasjon.harIkkeSatsgrunnlag': 'Ikke noe satsgrunnlag',

    'formue.verdi.bolig': 'Verdi på bolig',
    'formue.verdi.eiendom': 'Verdi på eiendom',
    'formue.verdi.kjøretøy': 'Verdi på kjøretøy',
    'formue.innskuddsbeløp': 'Innskuddsbeløp',
    'formue.verdipapir': 'Verdipapir',
    'formue.noenIGjeld': 'Står noen i gjeld til deg',
    'formue.kontanterOver1000': 'Kontanter over 1000',
    'formue.depositumskonto': 'Depositumskonto',

    'fradrag.utenlandsk.beløp': 'Beløp i utenlandsk valuta',
    'fradrag.utenlandsk.kurs': 'Kurs',
    'fradrag.suffix.eps': '(ektefelle/samboer)',

    'utenlandsopphold.vilkår.text': 'Skal søkeren oppholde seg mer enn 90 dager i utlandet?',
    'utenlandsopphold.vilkår.erOppfylt.SkalHoldeSegINorge': 'Oppfylt',
    'utenlandsopphold.vilkår.erOppfylt.SkalVæreMerEnn90DagerIUtlandet': 'Ikke oppfylt',
    'utenlandsopphold.vilkår.erOppfylt.Uavklart': 'Uavklart',

    'opplysningsplikt.vilkår.vurderingAvDokumentasjon': 'Vurdering av dokumentasjon',

    'lovligOpphold.vilkår.text': 'Har søker lovlig opphold i Norge?',

    'flyktning.vilkår.text': 'Er søker registrert flyktning etter utlendingslova §28?',

    'fastOpphold.vilkår.text': 'Oppholder søker seg fast i Norge?',

    ...velgbareFradragskategoriMessages,
    ...ikkeVelgbareFradragskategoriMessages,
    ...vilkårstatusMessages,

    ...uførevilkårstatusMessages,
    ...utenlandsoppholdStatusMessages,
    ...opplysningspliktStatusMessages,

    'grunnlagOgVilkår.oppfylt.ja': 'Ja',
    'grunnlagOgVilkår.ikkeOppfylt.nei': 'Nei',
    'grunnlagOgVilkår.uavklart': 'Uavklart',

    periode: 'Periode',
    'bool.true': 'Ja',
    'bool.false': 'Nei',
    'bool.VilkårOppfylt': 'Ja',
    'bool.VilkårIkkeOppfylt': 'Nei',
    'bool.Uavklart': 'Uavklart',

    ubesvart: 'Ubesvart',
    'vilkår.resultat': 'Resultat av vilkår',
    'vilkår.ikkeVurdert': 'Vilkåret er ikke vurdert',
    'feil.ukjent.periode': 'Ukjent periode',
};
