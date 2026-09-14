import { ExpansionCard, Tabs } from '@navikt/ds-react';
import { useState } from 'react';

import SakstatistikkPanel from './SakstatistikkPanel';
import StønadstatistikkPanel from './StønadstatistikkPanel';
import styles from './statistikk.module.less';

type Statistikkvisning = 'sak' | 'stønad';

export const Statistikkinnhold = () => {
    const [visning, setVisning] = useState<Statistikkvisning>('sak');

    return (
        <Tabs value={visning} onChange={(value) => setVisning(value as Statistikkvisning)}>
            <Tabs.List aria-label="Velg statistikkvisning">
                <Tabs.Tab value="sak" label="Sak" />
                <Tabs.Tab value="stønad" label="Stønad" />
            </Tabs.List>
            <Tabs.Panel value="sak">
                <SakstatistikkPanel />
            </Tabs.Panel>
            <Tabs.Panel value="stønad">
                <StønadstatistikkPanel />
            </Tabs.Panel>
        </Tabs>
    );
};

const Statistikk = () => {
    const [åpen, setÅpen] = useState(false);

    return (
        <ExpansionCard aria-label="Statistikk" className={styles.statistikk} open={åpen} onToggle={setÅpen}>
            <ExpansionCard.Header>
                <ExpansionCard.Title as="h2" size="medium">
                    Statistikk
                </ExpansionCard.Title>
                <ExpansionCard.Description>
                    Se utvikling i behandlinger og stønader. Statistikken er adskilt fra nøkkeltallene.
                </ExpansionCard.Description>
            </ExpansionCard.Header>
            <ExpansionCard.Content>{åpen && <Statistikkinnhold />}</ExpansionCard.Content>
        </ExpansionCard>
    );
};

export default Statistikk;
