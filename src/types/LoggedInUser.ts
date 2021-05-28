export enum Rolle {
    Attestant = 'Attestant',
    Saksbehandler = 'Saksbehandler',
    Veileder = 'Veileder',
    Drift = 'Drift',
}

export interface LoggedInUser {
    navn: string;
    navIdent: string;
    roller: Rolle[];
}
