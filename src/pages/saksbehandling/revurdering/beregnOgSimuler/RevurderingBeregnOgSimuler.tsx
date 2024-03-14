import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, HelpText } from '@navikt/ds-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BeregnOgSimuler } from '~src/api/revurderingApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { Seksjon } from '~src/components/framdriftsindikator/Framdriftsindikator';
import Beregningblokk from '~src/components/oppsummering/oppsummeringAvRevurdering/beregningblokk/Beregningblokk';
import * as RevurderingActions from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import {
    InformasjonsRevurdering,
    InformasjonsRevurderingStatus,
    RevurderingOppsummeringSteg,
    RevurderingSeksjoner,
    SimulertRevurdering,
} from '~src/types/Revurdering';
import {
    erRevurderingTilbakekrevingsbehandling,
    harBeregninger,
    harSimulering,
    periodenInneholderTilbakekrevingOgAndreTyper,
} from '~src/utils/revurdering/revurderingUtils';

import Navigasjonsknapper from '../../../../components/navigasjonsknapper/Navigasjonsknapper';
import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import messages from './RevurderingBeregnOgsimuler-nb';
import styles from './RevurderingBeregnOgSimuler.module.less';

const RevurderingBeregnOgSimuler = (props: {
    informasjonsRevurdering: InformasjonsRevurdering;
    seksjoner: Seksjon[];
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const forrigeUrl = props.seksjoner[1].linjer.at(-1)?.url;
    const [needsBeregning, setNeedsBeregning] = useState(false);
    const [beregnOgSimulerStatus, beregnOgSimuler] = useAsyncActionCreator(RevurderingActions.beregnOgSimuler);

    const beregningStatus = harBeregninger(props.informasjonsRevurdering)
        ? RemoteData.success<never, BeregnOgSimuler>({
              revurdering: props.informasjonsRevurdering as SimulertRevurdering,
              feilmeldinger: [],
              varselmeldinger: [],
          })
        : beregnOgSimulerStatus;

    const getNesteUrl = (beregnetOgSimulertRevurdering: InformasjonsRevurdering) => {
        if (erRevurderingTilbakekrevingsbehandling(beregnetOgSimulertRevurdering)) {
            return Routes.revurderingSeksjonSteg.createURL({
                sakId: props.informasjonsRevurdering.sakId,
                revurderingId: props.informasjonsRevurdering.id,
                seksjon: RevurderingSeksjoner.Oppsummering,
                steg: RevurderingOppsummeringSteg.Tilbakekreving,
            });
        } else {
            return Routes.revurderingSeksjonSteg.createURL({
                sakId: props.informasjonsRevurdering.sakId,
                revurderingId: props.informasjonsRevurdering.id,
                seksjon: RevurderingSeksjoner.Oppsummering,
                steg: RevurderingOppsummeringSteg.Forhåndsvarsel,
            });
        }
    };

    const handleBeregnOgSimuler = () => {
        beregnOgSimuler({
            sakId: props.informasjonsRevurdering.sakId,
            revurderingId: props.informasjonsRevurdering.id,
        });
    };

    const handleSubmit = () => {
        if (!RemoteData.isSuccess(beregningStatus)) {
            setNeedsBeregning(true);
            return;
        }
        navigate(getNesteUrl(beregningStatus.value.revurdering));
    };

    return (
        <form className={styles.container} onSubmit={handleSubmit}>
            <HelpText className={styles.helpText}>{formatMessage('beregnOgSimuler.helpText')}</HelpText>

            {RemoteData.isSuccess(beregningStatus) && (
                <div className={styles.successContainer}>
                    {harSimulering(beregningStatus.value.revurdering) &&
                        periodenInneholderTilbakekrevingOgAndreTyper(
                            beregningStatus.value.revurdering.simulering,
                            beregningStatus.value.revurdering.status === InformasjonsRevurderingStatus.SIMULERT_OPPHØRT,
                        ) && <Alert variant={'warning'}>{formatMessage('tilbakekreving.alert')}</Alert>}
                    <Beregningblokk revurdering={beregningStatus.value.revurdering} />
                    {beregningStatus.value.feilmeldinger.length > 0 && (
                        <UtfallSomIkkeStøttes feilmeldinger={beregningStatus.value.feilmeldinger} />
                    )}
                    {beregningStatus.value.varselmeldinger.length > 0 && (
                        <UtfallSomIkkeStøttes feilmeldinger={beregningStatus.value.varselmeldinger} infoMelding />
                    )}
                </div>
            )}

            <div className={styles.beregnKnappContainer}>
                <Button
                    variant="secondary"
                    type="button"
                    loading={RemoteData.isPending(beregnOgSimulerStatus)}
                    onClick={() => handleBeregnOgSimuler()}
                >
                    {formatMessage('beregnOgSimuler.ny')}
                </Button>
                {needsBeregning && (
                    <div>
                        <Alert variant="warning">{formatMessage('alert.advarsel.kjørBeregningFørst')}</Alert>
                    </div>
                )}
                {RemoteData.isFailure(beregnOgSimulerStatus) && <ApiErrorAlert error={beregnOgSimulerStatus.error} />}
            </div>

            <Navigasjonsknapper tilbake={{ url: forrigeUrl }} />
        </form>
    );
};

export default RevurderingBeregnOgSimuler;
