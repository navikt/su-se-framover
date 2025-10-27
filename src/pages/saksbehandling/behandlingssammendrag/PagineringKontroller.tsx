import { HStack, Pagination } from '@navikt/ds-react';

import { pagineringslisteverdier } from '~src/pages/saksbehandling/behandlingssammendrag/BehandlingssammendragTabell';

export interface Props {
    side: number;
    setSide: (side: number) => void;
    antallSider: number;
    oppgaverPerSide: number;
    setOppgaverPerSide: (oppgaverPerSide: number) => void;
}

export const PagineringKontroller = ({ side, setSide, oppgaverPerSide, antallSider, setOppgaverPerSide }: Props) => {
    return (
        <HStack gap="4" justify="center" align="center">
            <Pagination page={side} onPageChange={setSide} count={antallSider} size="small" />
            <select
                value={oppgaverPerSide}
                onChange={(e) => {
                    const antallOppgaverPerSide = Number(e.target.value);
                    setOppgaverPerSide(antallOppgaverPerSide);
                }}
                title="Antall oppgaver som vises"
            >
                {pagineringslisteverdier.map((rowsPerPage) => (
                    <option key={rowsPerPage} value={rowsPerPage}>
                        Vis {rowsPerPage} oppgaver
                    </option>
                ))}
            </select>
        </HStack>
    );
};
