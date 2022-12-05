import * as RemoteData from '@devexperts/remote-data-ts';
import { Button } from '@navikt/ds-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { hentgjeldendeGrunnlagsdataOgVilkårsvurderinger } from '~src/api/GrunnlagOgVilkårApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { Seksjon } from '~src/components/framdriftsindikator/Framdriftsindikator';
import SpinnerMedTekst from '~src/components/henterInnhold/SpinnerMedTekst';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import {
    InformasjonsRevurdering,
    RevurderingOppsummeringSteg,
    RevurderingSeksjoner,
    RevurderingSteg,
} from '~src/types/Revurdering';

import ForhåndsvarselForm from './forhåndsvarsel/ForhåndsvarselForm';
import messages from './RevurderingOppsummeringPage-nb';
import * as styles from './RevurderingOppsummeringPage.module.less';
import SendTilAttestering from './sendTilAttestering/SendTilAttestering';
import TilbakekrevingForm from './tilbakekreving/TilbakekrevingForm';

const RevurderingOppsummeringPage = (props: {
    sakId: string;
    revurdering: InformasjonsRevurdering;
    aktivSeksjonOgSteg: { seksjon: RevurderingSeksjoner; steg: RevurderingSteg };
    seksjoner: Seksjon[];
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    const [gjeldendeData, hentGjeldendeData] = useApiCall(hentgjeldendeGrunnlagsdataOgVilkårsvurderinger);

    React.useEffect(() => {
        if (RemoteData.isInitial(gjeldendeData)) {
            hentGjeldendeData({
                sakId: props.sakId,
                fraOgMed: props.revurdering.periode.fraOgMed,
                tilOgMed: props.revurdering.periode.tilOgMed,
            });
        }
    }, [props.revurdering.id]);

    return pipe(
        gjeldendeData,
        RemoteData.fold(
            () => <SpinnerMedTekst className={styles.henterInnholdContainer} />,
            () => <SpinnerMedTekst className={styles.henterInnholdContainer} />,
            (err) => (
                <div className={styles.content}>
                    <ApiErrorAlert error={err} />
                    <Button variant="secondary" onClick={() => navigate(props.seksjoner[1].linjer.at(-1)!.url)}>
                        {formatMessage('knapp.tilbake')}
                    </Button>
                </div>
            ),
            (gjeldendeGrunnlagOgVilkårData) => (
                <div className={styles.pageContainer}>
                    {props.aktivSeksjonOgSteg.steg === RevurderingOppsummeringSteg.Forhåndsvarsel && (
                        <ForhåndsvarselForm
                            sakId={props.sakId}
                            forrigeUrl={props.seksjoner[3].linjer.at(-1)!.url}
                            nesteUrl={props.seksjoner[4].linjer[1]!.url}
                            revurdering={props.revurdering}
                            gjeldendeGrunnlagOgVilkår={gjeldendeGrunnlagOgVilkårData.grunnlagsdataOgVilkårsvurderinger}
                        />
                    )}
                    {props.aktivSeksjonOgSteg.steg === RevurderingOppsummeringSteg.Tilbakekreving && (
                        <TilbakekrevingForm
                            sakId={props.sakId}
                            revurdering={props.revurdering}
                            gjeldendeGrunnlagOgVilkår={gjeldendeGrunnlagOgVilkårData.grunnlagsdataOgVilkårsvurderinger}
                        />
                    )}
                    {props.aktivSeksjonOgSteg.steg === RevurderingOppsummeringSteg.SendTilAttestering && (
                        <SendTilAttestering
                            sakId={props.sakId}
                            revurdering={props.revurdering}
                            gjeldendeGrunnlagOgVilkår={gjeldendeGrunnlagOgVilkårData.grunnlagsdataOgVilkårsvurderinger}
                            forrigeUrl={props.seksjoner[4].linjer.at(-2)!.url}
                        />
                    )}
                </div>
            )
        )
    );
};

export default RevurderingOppsummeringPage;
