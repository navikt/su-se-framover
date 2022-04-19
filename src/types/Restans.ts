import { Nullable } from '~src/lib/types';

export interface Restans {
    saksnummer: string;
    behandlingId: string;
    typeBehandling: RestansType;
    status: RestansStatus;
    behandlingStartet: Nullable<string>;
}

export enum RestansType {
    SØKNADSBEHANDLING = 'SØKNADSBEHANDLING',
    REVURDERING = 'REVURDERING',
    KLAGE = 'KLAGE',
    REGULERING = 'REGULERING',
}

export enum RestansStatus {
    NY_SØKNAD = 'NY_SØKNAD',
    UNDER_BEHANDLING = 'UNDER_BEHANDLING',
    TIL_ATTESTERING = 'TIL_ATTESTERING',
    UNDERKJENT = 'UNDERKJENT',
    INNVILGET = 'INNVILGET',
    OPPHØR = 'OPPHØR',
    AVSLAG = 'AVSLAG',
    INGEN_ENDRING = 'INGEN_ENDRING',
    STANS = 'STANS',
    GJENOPPTAK = 'GJENOPPTAK',
    OVERSENDT = 'OVERSENDT',
}
