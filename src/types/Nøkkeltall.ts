export interface Nøkkeltall {
    søknader: Søknader;
    antallUnikePersoner: number;
    løpendeSaker: number;
}

interface Søknader {
    totaltAntall: number;
    iverksatteAvslag: number;
    iverksatteInnvilget: number;
    ikkePåbegynt: number;
    påbegynt: number;
    digitalsøknader: number;
    papirsøknader: number;
}
