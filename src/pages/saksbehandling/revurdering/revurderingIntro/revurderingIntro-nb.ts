import { InformasjonSomRevurderes } from '~types/Revurdering';

type infomessagesType = { [key in InformasjonSomRevurderes]: string };

const messages: infomessagesType & { [key: string]: string } = {
    'datovelger.fom.legend': 'Fra',
    'datovelger.tom.legend': 'Til',

    'input.årsak.label': 'Årsak for revurdering',
    'input.årsak.value.default': 'Velg årsak',
    'input.begrunnelse.label': 'Begrunnelse',
    'input.informasjonSomRevurderes.label': 'Hva vil du revurdere?',

    [InformasjonSomRevurderes.Uførhet]: 'Uførhet',
    [InformasjonSomRevurderes.Inntekt]: 'Inntekt',
    [InformasjonSomRevurderes.Bosituasjon]: 'Bosituasjon',
    [InformasjonSomRevurderes.Formue]: 'Formue',
    [InformasjonSomRevurderes.Utenlandsopphold]: 'Utenlandsopphold',

    'info.bosituasjon': 'Ved boforhold kan det være relevant å endre inntekt og formue også',
};

export default messages;
