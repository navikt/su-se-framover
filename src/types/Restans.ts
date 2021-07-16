export interface Restans {
    saksnummer: string;
    behandlingId: string;
    typeBehandling: RestansType;
    status: RestansStatus;
    opprettet: string;
}

export enum RestansType {
    SØKNADSBEHANDLING = 'SØKNADSBEHANDLING',
    REVURDERING = 'REVURDERING',
}

export enum RestansStatus {
    NY_SØKNAD = 'NY_SØKNAD',
    UNDER_BEHANDLING = 'UNDER_BEHANDLING',
    TIL_ATTESTERING = 'TIL_ATTESTERING',
    UNDERKJENT = 'UNDERKJENT',
}
