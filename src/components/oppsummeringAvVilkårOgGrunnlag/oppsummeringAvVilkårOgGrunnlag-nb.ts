import { uførevilkårstatusMessages, vilkårstatusMessages } from '~src/typeMappinger/Vilkårsstatus';

export default {
    periode: 'Periode',
    'uførhet.vilkår.resultat': 'Resultat av vilkår',
    'uførhet.vilkår.erOppfylt': 'Er vilkår §12-4 til §12-7 i folketrygdloven oppfylt?',
    'uførhet.grunnlag.uføregrad': 'Uføregrad',
    'uførhet.grunnlag.forventetInntekt': 'Forventet inntekt etter uførhet',
    'uførhet.vilkår.ikkeVurdert': 'Vilkåret er ikke vurdert',

    ...vilkårstatusMessages,
    ...uførevilkårstatusMessages,

    'grunnlagOgVilkår.oppfylt.ja': 'Ja',
    'grunnlagOgVilkår.ikkeOppfylt.nei': 'Nei',
    'grunnlagOgVilkår.uavklart': 'Uavklart',
};
