import { Nøkkeltall, Søknader } from '~types/Nøkkeltall';

export const ferdigBehandlet = (søknader: Søknader) =>
    søknader.iverksatteInnvilget + søknader.iverksatteAvslag + søknader.lukket;
export const ikkeFerdigbehandlet = (søknader: Søknader) => søknader.påbegynt + søknader.ikkePåbegynt;
export const søknader = (søknader: Søknader) => søknader.digitalsøknader + søknader.papirsøknader;
export const brukere = (nøkkeltall: Nøkkeltall) => nøkkeltall.antallUnikePersoner + nøkkeltall.løpendeSaker;
