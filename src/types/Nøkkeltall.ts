export interface Nøkkeltall {
    søknader: Søknader;
    antallUnikePersoner: number;
    løpendeSaker: number;
}

export interface Søknader {
    totaltAntall: number;
    iverksatteAvslag: number;
    iverksatteInnvilget: number;
    ikkePåbegynt: number;
    påbegynt: number;
    lukket: number;
    digitalsøknader: number;
    papirsøknader: number;
}

export const ferdigBehandlet = (søknader: Søknader) =>
    søknader.iverksatteInnvilget + søknader.iverksatteAvslag + søknader.lukket;
export const ikkeFerdigbehandlet = (søknader: Søknader) => søknader.påbegynt + søknader.ikkePåbegynt;
export const søknader = (søknader: Søknader) => søknader.digitalsøknader + søknader.papirsøknader;
export const brukere = (nøkkeltall: Nøkkeltall) => nøkkeltall.antallUnikePersoner + nøkkeltall.løpendeSaker;
