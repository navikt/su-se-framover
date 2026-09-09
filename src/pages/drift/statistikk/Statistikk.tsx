import { Heading, Page, Tabs, VStack } from '@navikt/ds-react';
import { useState } from 'react';

import SakstatistikkPanel from './SakstatistikkPanel';
import StønadstatistikkPanel from './StønadstatistikkPanel';
import styles from './statistikk.module.less';

type Statistikkvisning = 'sak' | 'stønad';

const Statistikk = () => {
    const [visning, setVisning] = useState<Statistikkvisning>('sak');

    return (
        <Page.Block as="section" width="xl" gutters className={styles.statistikk}>
            <VStack gap={{ xs: '6', md: '8' }}>
                <div>
                    <Heading level="2" size="large">
                        Statistikk
                    </Heading>
                    <p className={styles.innledning}>
                        Se utvikling i behandlinger og stønader. Statistikken er adskilt fra nøkkeltallene.
                    </p>
                </div>

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
            </VStack>
        </Page.Block>
    );
};

export default Statistikk;
