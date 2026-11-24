export enum Rolle {
    Attestant = 'Attestant',
    Saksbehandler = 'Saksbehandler',
    Veileder = 'Veileder',
    Drift = 'Drift',
    Statistikk = 'Statistikk',
}

export interface LoggedInUser {
    navn: string;
    navIdent: string;
    roller: Rolle[];
    isProd: boolean;
}
