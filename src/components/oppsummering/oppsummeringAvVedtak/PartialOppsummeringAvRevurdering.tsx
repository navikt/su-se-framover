
import * as RemoteData from '@devexperts/remote-data-ts';
import { Loader } from '@navikt/ds-react';
import { useEffect } from 'react';

import { hentTidligereGrunnlagsdataForVedtak } from '~src/api/revurderingApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import messages from '~src/components/oppsummering/oppsummeringAvVedtak/OppsummeringAvVedtak-nb';
import styles from '~src/components/oppsummering/oppsummeringAvVedtak/OppsummeringAvVedtak.module.less';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import SidestiltOppsummeringAvVilkårOgGrunnlag from '~src/components/oppsummering/sidestiltOppsummeringAvVilkårOgGrunnlag/SidestiltOppsummeringAvVilkårOgGrunnlag';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { erOmgjøring, Revurdering, TilbakekrevingsAvgjørelse } from '~src/types/Revurdering';
import { Sak } from '~src/types/Sak';
import { Vedtak } from '~src/types/Vedtak';
import { formatDateTime } from '~src/utils/date/dateUtils';
import {
    erInformasjonsRevurdering,
    erRevurderingIverksattMedTilbakekreving,
    splitStatusOgResultatFraRevurdering,
} from '~src/utils/revurdering/revurderingUtils';

export const PartialOppsummeringAvRevurdering = (props: { sak: Sak; v: Vedtak; r: Revurdering }) => {
    const { formatMessage } = useI18n({ messages: { ...messages } });
    const [revurderingSnapshot, hentRevurderingSnapshot] = useApiCall(hentTidligereGrunnlagsdataForVedtak);

    useEffect(() => {
        if (erInformasjonsRevurdering(props.r)) {
            hentRevurderingSnapshot({ sakId: props.sak.id, vedtakId: props.v.id });
        }
    }, []);

    return (
        <div>
            <div className={styles.vedtakOgBehandlingInfoContainer}>
                <OppsummeringPar
                    label={formatMessage('behandling.resultat')}
                    verdi={splitStatusOgResultatFraRevurdering(props.r).resultat}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('revurdering.startet')}
                    verdi={formatDateTime(props.r.opprettet)}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('revurdering.årsakForRevurdering')}
                    verdi={formatMessage(props.r.årsak)}
                    retning={'vertikal'}
                />
                {erOmgjøring(props.r.årsak) && (
                    <OppsummeringPar
                        label={formatMessage('label.omgjøring')}
                        verdi={formatMessage(props.r.omgjøringsgrunn!)}
                        retning={'vertikal'}
                    />
                )}
                {erRevurderingIverksattMedTilbakekreving(props.r) && (
                    <OppsummeringPar
                        label={formatMessage('revurdering.skalTilbakekreves')}
                        verdi={formatMessage(
                            `bool.${props.r.tilbakekrevingsbehandling.avgjørelse === TilbakekrevingsAvgjørelse.TILBAKEKREV}`,
                        )}
                        retning={'vertikal'}
                    />
                )}
            </div>
            <OppsummeringPar
                label={formatMessage('revurdering.begrunnelse')}
                verdi={props.r.begrunnelse}
                retning={'vertikal'}
            />
            {pipe(
                revurderingSnapshot,
                RemoteData.fold(
                    () => <></>,
                    () => <Loader />,
                    (error) => <ApiErrorAlert error={error} />,
                    (snapshotRevurderingGrunnlagsdataOgVilkår) => (
                        <SidestiltOppsummeringAvVilkårOgGrunnlag
                            grunnlagsdataOgVilkårsvurderinger={props.r.grunnlagsdataOgVilkårsvurderinger}
                            visesSidestiltMed={snapshotRevurderingGrunnlagsdataOgVilkår}
                            sakstype={props.sak.sakstype}
                        />
                    ),
                ),
            )}
        </div>
    );
};
