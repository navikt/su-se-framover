export enum Rolle {
    Attestant = 'Attestant',
    Saksbehandler = 'Saksbehandler',
    Veileder = 'Veileder',
}

export interface LoggedInUser {
    navn: string;
    navIdent: string;
    roller: Rolle[];
}
