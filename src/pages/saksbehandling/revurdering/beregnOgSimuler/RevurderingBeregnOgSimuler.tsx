import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { BeregnOgSimuler } from '~src/api/revurderingApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import BeregningOgSimulering from '~src/components/beregningOgSimulering/BeregningOgSimulering';
import { Seksjon } from '~src/components/framdriftsindikator/Framdriftsindikator';
import SpinnerMedTekst from '~src/components/henterInnhold/SpinnerMedTekst';
import * as RevurderingActions from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import {
    InformasjonsRevurdering,
    InformasjonsRevurderingStatus,
    RevurderingOppsummeringSeksjonSteg,
    RevurderingSeksjoner,
    SimulertRevurdering,
} from '~src/types/Revurdering';
import {
    harBeregninger,
    harSimulering,
    periodenInneholderTilbakekrevingOgAndreTyper,
} from '~src/utils/revurdering/revurderingUtils';

import Navigasjonsknapper from '../../bunnknapper/Navigasjonsknapper';
import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import messages from './RevurderingBeregnOgsimuler-nb';
import styles from './RevurderingBeregnOgSimuler.module.less';

const RevurderingBeregnOgSimuler = (props: {
    sakId: string;
    informasjonsRevurdering: InformasjonsRevurdering;
    seksjoner: Seksjon[];
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const forrigeUrl = props.seksjoner[1].linjer.at(-1)?.url;
    const nesteUrl = Routes.revurderingSeksjonSteg.createURL({
        sakId: props.sakId,
        revurderingId: props.informasjonsRevurdering.id,
        seksjon: RevurderingSeksjoner.Oppsummering,
        steg: RevurderingOppsummeringSeksjonSteg.Forhåndsvarsel,
    });

    const [beregnOgSimulerStatus, beregnOgSimuler] = useAsyncActionCreator(RevurderingActions.beregnOgSimuler);

    const beregningStatus = harBeregninger(props.informasjonsRevurdering)
        ? RemoteData.success<never, BeregnOgSimuler>({
              revurdering: props.informasjonsRevurdering as SimulertRevurdering,
              feilmeldinger: [],
              varselmeldinger: [],
          })
        : beregnOgSimulerStatus;

    React.useEffect(() => {
        if (RemoteData.isInitial(beregningStatus)) {
            beregnOgSimuler(
                {
                    sakId: props.sakId,
                    periode: props.informasjonsRevurdering.periode,
                    revurderingId: props.informasjonsRevurdering.id,
                },
                (rev) => {
                    if (rev.feilmeldinger.length === 0 && rev.varselmeldinger.length === 0) {
                        navigate(nesteUrl);
                    }
                }
            );
        }
    }, [props.informasjonsRevurdering.id]);

    return (
        <div className={styles.container}>
            {pipe(
                beregningStatus,
                RemoteData.fold3(
                    () => <SpinnerMedTekst text={formatMessage('beregnOgSimuler.beregner')} />,
                    (err) => (
                        <div className={styles.content}>
                            <ApiErrorAlert error={err} />
                            <Button variant="secondary" onClick={() => navigate(forrigeUrl!)}>
                                {formatMessage('knapp.tilbake')}
                            </Button>
                        </div>
                    ),
                    (res) => (
                        <div className={styles.successContainer}>
                            {harSimulering(res.revurdering) &&
                                periodenInneholderTilbakekrevingOgAndreTyper(
                                    res.revurdering.simulering,
                                    res.revurdering.status === InformasjonsRevurderingStatus.SIMULERT_OPPHØRT
                                ) && <Alert variant={'warning'}>{formatMessage('tilbakekreving.alert')}</Alert>}
                            <BeregningOgSimulering
                                beregning={res.revurdering.beregning}
                                simulering={res.revurdering.simulering}
                                kompakt
                            />
                            {res.feilmeldinger.length > 0 && <UtfallSomIkkeStøttes feilmeldinger={res.feilmeldinger} />}
                            {res.varselmeldinger.length > 0 && (
                                <UtfallSomIkkeStøttes feilmeldinger={res.varselmeldinger} infoMelding />
                            )}

                            <Button
                                variant="secondary"
                                loading={RemoteData.isPending(beregnOgSimulerStatus)}
                                onClick={() =>
                                    beregnOgSimuler({
                                        sakId: props.sakId,
                                        periode: props.informasjonsRevurdering.periode,
                                        revurderingId: props.informasjonsRevurdering.id,
                                    })
                                }
                            >
                                {formatMessage('beregnOgSimuler.ny')}
                            </Button>

                            <Navigasjonsknapper
                                neste={{ onClick: () => navigate(nesteUrl) }}
                                tilbake={{ url: forrigeUrl }}
                            />
                        </div>
                    )
                )
            )}
        </div>
    );
};

export default RevurderingBeregnOgSimuler;
