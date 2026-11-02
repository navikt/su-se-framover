import { Nullable } from '~src/lib/types';
import { InntektOgPensjon } from '~src/types/Søknadinnhold';
import { Søknadsbehandling, SøknadsbehandlingStatus } from '~src/types/Søknadsbehandling';

export const erIGyldigStatusForÅKunneBeregne = (behandling: Søknadsbehandling) =>
    [
        SøknadsbehandlingStatus.BEREGNET_AVSLAG,
        SøknadsbehandlingStatus.BEREGNET_INNVILGET,
        SøknadsbehandlingStatus.SIMULERT,
        SøknadsbehandlingStatus.VILKÅRSVURDERT_INNVILGET,
        SøknadsbehandlingStatus.UNDERKJENT_AVSLAG,
        SøknadsbehandlingStatus.UNDERKJENT_INNVILGET,
    ].some((status) => status === behandling.status);

/**
 * Sjekker om brukeren har oppgitt noen inntekt for segselv eller eps.
 */
// Returverdiene brukes som tekstnøkler i inntektsvarselet. `andreYtelserINavBeløp` har ingen egen tekstnøkkel fordi beløpet bare avgjør om `andreYtelserINav` skal vises.
type InntektOgPensjonFelt = Exclude<keyof InntektOgPensjon, 'andreYtelserINavBeløp'>;

export const inntektFelter = (inntektOgPensjon: Nullable<InntektOgPensjon>): InntektOgPensjonFelt[] => {
    if (inntektOgPensjon === null) {
        return [];
    }

    const feltErOppgitt: [InntektOgPensjonFelt, boolean][] = [
        ['forventetInntekt', (inntektOgPensjon.forventetInntekt ?? 0) > 0],
        ['andreYtelserINav', (inntektOgPensjon.andreYtelserINavBeløp ?? 0) > 0],
        [
            'søktAndreYtelserIkkeBehandletBegrunnelse',
            (inntektOgPensjon.søktAndreYtelserIkkeBehandletBegrunnelse?.trim().length ?? 0) > 0,
        ],
        [
            'trygdeytelserIUtlandet',
            inntektOgPensjon.trygdeytelserIUtlandet?.some((ytelse) => ytelse.beløp > 0) === true,
        ],
        ['pensjon', inntektOgPensjon.pensjon?.some((pensjon) => pensjon.beløp > 0) === true],
    ];

    return feltErOppgitt.filter(([, harAvvik]) => harAvvik).map(([felt]) => felt);
};
