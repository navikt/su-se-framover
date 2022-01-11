import { BodyShort, Label } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import * as Option from 'fp-ts/Option';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';
import * as React from 'react';

import UnderkjenteAttesteringer from '~components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import { maxBy } from '~lib/fp';
import { MessageFormatter, useI18n } from '~lib/i18n';
import sharedMessages from '~pages/saksbehandling/revurdering/revurdering-nb';
import { Attestering } from '~types/Behandling';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import {
    InformasjonsRevurdering,
    InformasjonsRevurderingStatus,
    Revurdering,
    RevurderingsStatus,
    UtbetalingsRevurderingStatus,
} from '~types/Revurdering';
import * as DateUtils from '~utils/date/dateUtils';

import Oppsummeringspanel, { Oppsummeringsfarge, Oppsummeringsikon } from '../oppsummeringspanel/Oppsummeringspanel';
import Vedtaksinformasjon from '../vedtaksinformasjon/Vedtaksinformasjon';

import messages from './oppsummeringsblokk-nb';
import styles from './oppsummeringsblokk.module.less';

const Intro = (props: { revurdering: Revurdering }) => {
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages } });
    return (
        <div className={styles.introContainer}>
            <div className={styles.intro}>
                {[
                    {
                        tittel: formatMessage('label.resultat'),
                        verdi: statusTilTekst(props.revurdering.status, formatMessage),
                    },
                    {
                        tittel: formatMessage('label.saksbehandler'),
                        verdi: props.revurdering.saksbehandler,
                    },
                    {
                        tittel: formatMessage('label.attestant'),
                        verdi: pipe(
                            props.revurdering.attesteringer.filter((a) => a.underkjennelse === null),
                            maxBy(Ord.contramap((a: Attestering) => a.opprettet)(S.Ord)),
                            Option.fold(
                                () => '-',
                                (a) => a.attestant
                            )
                        ),
                    },
                    {
                        tittel: formatMessage('label.startet'),
                        verdi: DateUtils.formatDateTime(props.revurdering.opprettet),
                    },
                    {
                        tittel: formatMessage('label.periode'),
                        verdi: DateUtils.formatPeriode(props.revurdering.periode),
                    },
                    {
                        tittel: formatMessage('label.årsak'),
                        verdi: formatMessage(props.revurdering.årsak),
                    },
                    {
                        tittel: formatMessage('label.begrunnelse'),
                        verdi: props.revurdering.begrunnelse,
                    },
                ].map((item) => (
                    <div className={styles.introItem} key={item.tittel}>
                        <Label>{item.tittel}</Label>
                        <BodyShort>{item.verdi}</BodyShort>
                    </div>
                ))}
            </div>
            <UnderkjenteAttesteringer attesteringer={props.revurdering.attesteringer} />
        </div>
    );
};

const Oppsummeringsblokk = (props: {
    revurdering: InformasjonsRevurdering;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const { intl } = useI18n({ messages });
    return (
        <Oppsummeringspanel
            tittel={intl.formatMessage({ id: 'heading' })}
            farge={Oppsummeringsfarge.Lilla}
            ikon={Oppsummeringsikon.Liste}
        >
            <div className={styles.container}>
                <Intro revurdering={props.revurdering} />
                <Vedtaksinformasjon
                    revurdering={props.revurdering}
                    grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger}
                />
            </div>
        </Oppsummeringspanel>
    );
};

function statusTilTekst(status: RevurderingsStatus, formatMessage: MessageFormatter<typeof messages>): string {
    switch (status) {
        case InformasjonsRevurderingStatus.BEREGNET_INGEN_ENDRING:
        case InformasjonsRevurderingStatus.TIL_ATTESTERING_INGEN_ENDRING:
        case InformasjonsRevurderingStatus.UNDERKJENT_INGEN_ENDRING:
        case InformasjonsRevurderingStatus.IVERKSATT_INGEN_ENDRING:
            return formatMessage('vurdering.ingenEndring');
        case InformasjonsRevurderingStatus.SIMULERT_OPPHØRT:
        case InformasjonsRevurderingStatus.TIL_ATTESTERING_OPPHØRT:
        case InformasjonsRevurderingStatus.UNDERKJENT_OPPHØRT:
        case InformasjonsRevurderingStatus.IVERKSATT_OPPHØRT:
            return formatMessage('vurdering.opphør');
        case InformasjonsRevurderingStatus.BEREGNET_INNVILGET:
        case InformasjonsRevurderingStatus.SIMULERT_INNVILGET:
        case InformasjonsRevurderingStatus.TIL_ATTESTERING_INNVILGET:
        case InformasjonsRevurderingStatus.UNDERKJENT_INNVILGET:
        case InformasjonsRevurderingStatus.IVERKSATT_INNVILGET:
            return formatMessage('vurdering.endring');
        case InformasjonsRevurderingStatus.OPPRETTET:
            return formatMessage('vurdering.opprettet');
        case InformasjonsRevurderingStatus.AVSLUTTET:
            return formatMessage('vurdering.avsluttet');
        case UtbetalingsRevurderingStatus.AVSLUTTET_STANS:
        case UtbetalingsRevurderingStatus.SIMULERT_STANS:
        case UtbetalingsRevurderingStatus.IVERKSATT_STANS:
            return formatMessage('vurdering.stans');
        case UtbetalingsRevurderingStatus.SIMULERT_GJENOPPTAK:
        case UtbetalingsRevurderingStatus.AVSLUTTET_GJENOPPTAK:
        case UtbetalingsRevurderingStatus.IVERKSATT_GJENOPPTAK:
            return formatMessage('vurdering.gjenopptak');
    }
}

export default Oppsummeringsblokk;
