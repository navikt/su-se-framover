import * as Option from 'fp-ts/Option';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';

import { omgjøringsgrunnerTekstMapper } from '~src/components/forms/revurdering/Omgjøringgrunner-nb.ts';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import SidestiltOppsummeringAvVilkårOgGrunnlag from '~src/components/oppsummering/sidestiltOppsummeringAvVilkårOgGrunnlag/SidestiltOppsummeringAvVilkårOgGrunnlag';
import UnderkjenteAttesteringer from '~src/components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import { pipe, maxBy } from '~src/lib/fp';
import { MessageFormatter, useI18n } from '~src/lib/i18n';
import sharedMessages from '~src/pages/saksbehandling/revurdering/revurdering-nb';
import { opprettRevurderingÅrsakTekstMapper } from '~src/typeMappinger/OpprettRevurderingÅrsak.ts';
import { Attestering } from '~src/types/Behandling';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import {
    erOmgjøring,
    InformasjonsRevurdering,
    InformasjonsRevurderingStatus,
    RevurderingStatus,
    UtbetalingsRevurderingStatus,
} from '~src/types/Revurdering';
import { Sakstype } from '~src/types/Sak.ts';
import * as DateUtils from '~src/utils/date/dateUtils';
import { formatPeriode } from '~src/utils/periode/periodeUtils';
import { erRevurderingIverksattMedTilbakekreving } from '~src/utils/revurdering/revurderingUtils';

import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '../../../oppsummeringspanel/Oppsummeringspanel';

import messages from './oppsummeringsblokk-nb';
import styles from './oppsummeringsblokk.module.less';

const Intro = (props: { revurdering: InformasjonsRevurdering }) => {
    const { formatMessage } = useI18n({
        messages: {
            ...sharedMessages,
            ...messages,
            ...opprettRevurderingÅrsakTekstMapper,
            ...omgjøringsgrunnerTekstMapper,
        },
    });

    let oppsummeringselementerRevurdering = [
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
                    (a) => a.attestant,
                ),
            ),
        },
        {
            tittel: formatMessage('label.startet'),
            verdi: DateUtils.formatDateTime(props.revurdering.opprettet),
        },
        {
            tittel: formatMessage('label.periode'),
            verdi: formatPeriode(props.revurdering.periode),
        },
        {
            tittel: formatMessage('label.årsak'),
            verdi: formatMessage(props.revurdering.årsak),
        },
    ];
    if (erOmgjøring(props.revurdering.årsak) && props.revurdering.omgjøringsgrunn) {
        oppsummeringselementerRevurdering = [
            ...oppsummeringselementerRevurdering,
            {
                tittel: formatMessage('label.omgjøring'),
                verdi: formatMessage(props.revurdering.omgjøringsgrunn),
            },
        ];
    }
    return (
        <div className={styles.introContainer}>
            <div className={styles.intro}>
                {oppsummeringselementerRevurdering.map((item) => (
                    <div key={item.tittel}>
                        <OppsummeringPar label={item.tittel} verdi={item.verdi} retning={'vertikal'} />
                    </div>
                ))}
            </div>
            <div>
                {erRevurderingIverksattMedTilbakekreving(props.revurdering) && (
                    <OppsummeringPar
                        label={formatMessage('tilbakekreving.skalTilbakekreves')}
                        verdi={formatMessage(
                            `tilbakekreving.resultat.tilJaNei.${props.revurdering.tilbakekrevingsbehandling.avgjørelse}`,
                        )}
                        retning={'vertikal'}
                    />
                )}
            </div>
            <div className={styles.begrunnelseContainer}>
                <OppsummeringPar
                    label={formatMessage('label.begrunnelse')}
                    verdi={props.revurdering.begrunnelse}
                    retning={'vertikal'}
                />
            </div>
            <UnderkjenteAttesteringer attesteringer={props.revurdering.attesteringer} />
        </div>
    );
};

const Oppsummeringsblokk = (props: {
    revurdering: InformasjonsRevurdering;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    sakstype: Sakstype;
}) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <Oppsummeringspanel
            tittel={formatMessage('heading')}
            farge={Oppsummeringsfarge.Lilla}
            ikon={Oppsummeringsikon.Liste}
        >
            <div className={styles.container}>
                <Intro revurdering={props.revurdering} />
                <SidestiltOppsummeringAvVilkårOgGrunnlag
                    grunnlagsdataOgVilkårsvurderinger={props.revurdering.grunnlagsdataOgVilkårsvurderinger}
                    visesSidestiltMed={props.grunnlagsdataOgVilkårsvurderinger}
                    sakstype={props.sakstype}
                />
            </div>
        </Oppsummeringspanel>
    );
};

function statusTilTekst(status: RevurderingStatus, formatMessage: MessageFormatter<typeof messages>): string {
    switch (status) {
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
