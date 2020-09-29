export enum Rolle {
    Attestant = 'Attestant',
    Saksbehandler = 'Saksbehandler',
    Veileder = 'Veileder',
}

export interface LoggedInUser {
    navIdent: string;
    roller: Rolle[];
}
