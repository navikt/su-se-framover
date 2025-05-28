import { InformasjonSomRevurderes } from '~src/types/Revurdering';

export const InformasjonSomRevurderesTextMapper: { [key in InformasjonSomRevurderes]: string } = {
    [InformasjonSomRevurderes.Uførhet]: 'Uførhet',
    [InformasjonSomRevurderes.Inntekt]: 'Inntekt',
    [InformasjonSomRevurderes.Bosituasjon]: 'Bosituasjon',
    [InformasjonSomRevurderes.Formue]: 'Formue',
    [InformasjonSomRevurderes.Utenlandsopphold]: 'Utenlandsopphold',
    [InformasjonSomRevurderes.Flyktning]: 'Flyktingsstatus',
    [InformasjonSomRevurderes.FastOpphold]: 'Opphold i Norge',
    [InformasjonSomRevurderes.Opplysningsplikt]: 'Opplysningsplikt',
    [InformasjonSomRevurderes.Oppholdstillatelse]: 'Oppholdstillatelse',
    [InformasjonSomRevurderes.PersonligOppmøte]: 'Personlig oppmøte',
    [InformasjonSomRevurderes.Institusjonsopphold]: 'Institusjonsopphold',
    [InformasjonSomRevurderes.Familiegjenforening]: 'Familiegjenforening',
    [InformasjonSomRevurderes.Pensjon]: 'Alderspensjon',
};
