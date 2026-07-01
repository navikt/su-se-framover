import { NotatResponse, ReferanseType } from '~src/types/Notat';

export type NotatPanelProps = {
    sakId: string;
    referanseId: string;
    referanseType: ReferanseType;
    underAttestering: boolean;
    kanRedigere: boolean;
};

export type TekstModalType = 'saksbehandler' | 'attestant';
export type NotatOppdatering = (gjeldendeNotat: NotatResponse) => NotatResponse;
