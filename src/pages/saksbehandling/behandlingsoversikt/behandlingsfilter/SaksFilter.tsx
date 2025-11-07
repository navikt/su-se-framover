import { Box, Checkbox, Label } from '@navikt/ds-react';

import { useI18n } from '~src/lib/i18n';
import { Sakstypefilter } from '~src/pages/saksbehandling/behandlingsoversikt/behandlingsfilter/Filter.tsx';
import styles from '~src/pages/saksbehandling/behandlingsoversikt/behandlingsfilter/filter.module.less';
import messages from '~src/pages/saksbehandling/behandlingsoversikt/behandlingsfilter/filter-nb';

export const SaksFilter = ({
    saktypeFilter,
    oppdaterSakstype,
}: {
    saktypeFilter: Sakstypefilter;
    oppdaterSakstype: (key: keyof Sakstypefilter, verdi: boolean) => void;
}) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <Box padding="2">
            <Label className={styles.label}>Sakstype</Label>
            {Object.entries(saktypeFilter).map(([key, value]) => (
                <Checkbox
                    key={key as keyof Sakstypefilter}
                    checked={value}
                    onChange={(e) => oppdaterSakstype?.(key as keyof Sakstypefilter, e.target.checked)}
                >
                    {formatMessage(key as keyof Sakstypefilter)}
                </Checkbox>
            ))}
        </Box>
    );
};
