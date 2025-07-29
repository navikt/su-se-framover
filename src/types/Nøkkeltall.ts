import { Sakstype } from '~src/types/Sak.ts';

export interface Nøkkeltall {
    sakstype: Sakstype;
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
