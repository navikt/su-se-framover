import { Alert, Heading, VStack } from '@navikt/ds-react';
import { useLocation, useNavigate } from 'react-router-dom';

import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import HistoriskAlderssakPersonoppslag from '~src/features/historiskAlderssak/HistoriskAlderssakPersonoppslag';
import { hentFnrFraNavigasjon } from '~src/features/historiskAlderssak/HistoriskAlderssakUtils';
import HistoriskAlderssakVisning from '~src/features/historiskAlderssak/HistoriskAlderssakVisning';
import historiskStyles from '~src/features/historiskAlderssak/HistoriskAlderssakVisning.module.less';
import * as Routes from '~src/lib/routes';

const HistoriskAlderssakDrift = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const fnr = hentFnrFraNavigasjon(state);

    if (fnr) {
        return (
            <HistoriskAlderssakVisning
                fnr={fnr}
                tilbakeHref={Routes.drift.createURL()}
                tilbakeTekst="Tilbake til Drift"
            />
        );
    }

    return (
        <section className={historiskStyles.side} aria-labelledby="infotrygd-tittel">
            <VStack gap="6">
                <Heading id="infotrygd-tittel" level="1" size="large">
                    Infotrygd-sak
                </Heading>
                <Alert variant="warning">
                    Personvalget mangler. Søk opp personen på nytt for å åpne Infotrygd-visningen.
                </Alert>
                <HistoriskAlderssakPersonoppslag
                    onTreff={(nyttFnr) =>
                        navigate(Routes.historiskAlderssakDrift.createURL(), {
                            replace: true,
                            state: { fnr: nyttFnr },
                        })
                    }
                />
                <div>
                    <LinkAsButton variant="secondary" href={Routes.drift.createURL()}>
                        Tilbake til Drift
                    </LinkAsButton>
                </div>
            </VStack>
        </section>
    );
};

export default HistoriskAlderssakDrift;
