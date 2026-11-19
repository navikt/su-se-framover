import { Heading, Page, VStack } from '@navikt/ds-react';

import { Statistikkinnhold } from '~src/pages/drift/statistikk/Statistikk';

import styles from './statistikkPage.module.less';

const StatistikkPage = () => (
    <Page.Block width="xl" gutters className={styles.side}>
        <VStack gap="8">
            <Heading level="1" size="xlarge">
                Statistikk
            </Heading>
            <Statistikkinnhold />
        </VStack>
    </Page.Block>
);

export default StatistikkPage;
