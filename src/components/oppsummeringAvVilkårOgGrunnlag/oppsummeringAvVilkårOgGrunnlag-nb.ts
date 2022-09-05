import { uførevilkårstatusMessages, vilkårstatusMessages } from '~src/typeMappinger/Vilkårsstatus';

export default {
    'uførhet.vilkår.resultat': 'Resultat av vilkår',
    'uførhet.vilkår.erOppfylt': 'Er vilkår §12-4 til §12-7 i folketrygdloven oppfylt?',
    'uførhet.grunnlag.uføregrad': 'Uføregrad',
    'uførhet.grunnlag.forventetInntekt': 'Forventet inntekt etter uførhet',
    'uførhet.vilkår.ikkeVurdert': 'Vilkåret er ikke vurdert',

    'bosituasjon.sats': 'Sats',
    'bosituasjon.harEPS': 'Har søker ektefelle eller samboer?',
    'bosituasjon.delerBolig': 'Deler søker bolig med noen over 18 år?',
    'bosituasjon.eps.fnr': 'Ektefelles/samboers fødselsnummer',
    'bosituasjon.eps.erEpsUførFlyktning': 'Er ektefelle/samboer ufør flyktning',
    'bosituasjon.ORDINÆR': 'Ordinær',
    'bosituasjon.HØY': 'Høy',

    ...vilkårstatusMessages,
    ...uførevilkårstatusMessages,

    'grunnlagOgVilkår.oppfylt.ja': 'Ja',
    'grunnlagOgVilkår.ikkeOppfylt.nei': 'Nei',
    'grunnlagOgVilkår.uavklart': 'Uavklart',

    periode: 'Periode',
    'bool.true': 'Ja',
    'bool.false': 'Nei',
};
