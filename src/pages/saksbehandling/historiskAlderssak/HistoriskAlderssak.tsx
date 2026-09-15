import { Alert, Heading, VStack } from '@navikt/ds-react';
import { useOutletContext } from 'react-router-dom';

import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import HistoriskAlderssakVisning from '~src/features/historiskAlderssak/HistoriskAlderssakVisning';
import historiskStyles from '~src/features/historiskAlderssak/HistoriskAlderssakVisning.module.less';
import * as Routes from '~src/lib/routes';
import { Sakstype } from '~src/types/Sak';

const HistoriskAlderssak = () => {
    const { sak } = useOutletContext<SaksoversiktContext>();

    if (sak.sakstype === Sakstype.Alder) {
        return (
            <HistoriskAlderssakVisning
                fnr={sak.fnr}
                tilbakeHref={Routes.saksoversiktValgtSak.createURL({ sakId: sak.id })}
                tilbakeTekst="Tilbake til saksoversikten"
            />
        );
    }

    return (
        <section className={historiskStyles.side} aria-labelledby="infotrygd-tittel">
            <VStack gap="6">
                <Heading id="infotrygd-tittel" level="1" size="large">
                    Infotrygd-sak
                </Heading>
                <Alert variant="warning">Infotrygd-visningen er bare tilgjengelig for alderssaker.</Alert>
                <div>
                    <LinkAsButton variant="secondary" href={Routes.saksoversiktValgtSak.createURL({ sakId: sak.id })}>
                        Tilbake til saksoversikten
                    </LinkAsButton>
                </div>
            </VStack>
        </section>
    );
};

export default HistoriskAlderssak;
