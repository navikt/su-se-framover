import { SøknadsbehandlingStatus } from '~src/types/Søknadsbehandling';

export const søknadsbehandlingStatusTilAvslagInnvilgelseTextMapper: { [key in SøknadsbehandlingStatus]: string } = {
    OPPRETTET: '',

    VILKÅRSVURDERT_INNVILGET: 'Innvilget',
    BEREGNET_INNVILGET: 'Innvilget',
    SIMULERT: 'Innvilget',
    TIL_ATTESTERING_INNVILGET: 'Innvilget',
    UNDERKJENT_INNVILGET: 'Innvilget',
    IVERKSATT_INNVILGET: 'Innvilget',

    VILKÅRSVURDERT_AVSLAG: 'Avslag',
    BEREGNET_AVSLAG: 'Avslag',
    TIL_ATTESTERING_AVSLAG: 'Avslag',
    UNDERKJENT_AVSLAG: 'Avslag',
    IVERKSATT_AVSLAG: 'Avslag',
};
