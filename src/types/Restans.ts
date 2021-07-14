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
    UNDER_BEHANDLING = 'UNDER_BEHANDLING',
    NY_SØKNAD = 'NY_SØKNAD',
    UNDERKJENT = 'UNDERKJENT',
    TIL_ATTESTERING = 'TIL_ATTESTERING',
}
