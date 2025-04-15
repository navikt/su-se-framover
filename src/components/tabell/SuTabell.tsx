import { Table } from '@navikt/ds-react';
import { useState } from 'react';

interface Props<Kolonner extends Record<string, string>> {
    kolonnerConfig: {
        kolonner: Kolonner;
        defaultKolonneSorteresEtter: ValueOf<Kolonner>;
    };
    tableHeader: () => React.ReactElement;
    tableBody: (k: ValueOf<Kolonner>, sortVerdi: AriaSortVerdi) => React.ReactElement;
}

type ValueOf<T> = T[keyof T];
export type AriaSortVerdi = 'ascending' | 'descending';

/**
 * En variant av aksels tabell, der vi har lagt til funksjonalitet for hvilken retning & kolonne skal sorteres etter.
 */
const SuTabell = <Kolonner extends Record<string, string>>(props: Props<Kolonner>) => {
    const [sortVerdi, setSortVerdi] = useState<AriaSortVerdi>('descending');
    const [sortertKolonne, setSortertKolonne] = useState<ValueOf<Kolonner>>(
        props.kolonnerConfig.defaultKolonneSorteresEtter,
    );

    const handleSorterClick = (kolonne: ValueOf<Kolonner>) => {
        if (sortertKolonne !== kolonne) {
            setSortertKolonne(kolonne);
            setSortVerdi('ascending');
            return;
        }

        setSortVerdi(nesteSortVerdi(sortVerdi));
    };

    const nesteSortVerdi = (sortVerdi: AriaSortVerdi) => {
        switch (sortVerdi) {
            case 'ascending':
                return 'descending';
            case 'descending':
                return 'ascending';
        }
    };

    return (
        <div>
            <Table
                size="medium"
                zebraStripes
                sort={sortVerdi && sortertKolonne ? { orderBy: sortertKolonne, direction: sortVerdi } : undefined}
                onSortChange={(sortKey) => handleSorterClick(sortKey as ValueOf<Kolonner>)}
            >
                {props.tableHeader()}
                {props.tableBody(sortertKolonne, sortVerdi)}
            </Table>
        </div>
    );
};
export default SuTabell;
