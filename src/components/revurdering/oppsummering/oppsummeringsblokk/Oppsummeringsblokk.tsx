import { BodyShort, Label } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import * as Option from 'fp-ts/Option';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';
import * as React from 'react';

import UnderkjenteAttesteringer from '~components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import { maxBy } from '~lib/fp';
import { useI18n } from '~lib/i18n';
import sharedMessages from '~pages/saksbehandling/revurdering/revurdering-nb';
import { Attestering } from '~types/Behandling';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { InformasjonsRevurdering, Revurdering } from '~types/Revurdering';
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
                        tittel: formatMessage('label.saksbehandler'),
                        verdi: props.revurdering.saksbehandler,
                    },
                    {
                        tittel: formatMessage('label.periode'),
                        verdi: DateUtils.formatPeriode(props.revurdering.periode),
                    },
                    {
                        tittel: formatMessage('label.startet'),
                        verdi: DateUtils.formatDateTime(props.revurdering.opprettet),
                    },
                    {
                        tittel: formatMessage('label.årsak'),
                        verdi: formatMessage(props.revurdering.årsak),
                    },
                    {
                        tittel: formatMessage('label.begrunnelse'),
                        verdi: props.revurdering.begrunnelse,
                    },
                    {
                        tittel: formatMessage('label.attestant'),
                        verdi: pipe(
                            props.revurdering.attesteringer.filter((a) => a.underkjennelse === null),
                            maxBy(Ord.contramap((a: Attestering) => a.opprettet)(S.Ord)),
                            Option.fold(
                                () => '–',
                                (a) => a.attestant
                            )
                        ),
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

export default Oppsummeringsblokk;
