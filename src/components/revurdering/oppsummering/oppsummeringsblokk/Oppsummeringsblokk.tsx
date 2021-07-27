import { Normaltekst, Element } from 'nav-frontend-typografi';
import * as React from 'react';

import UnderkjenteAttesteringer from '~components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { useI18n } from '~lib/hooks';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Revurdering } from '~types/Revurdering';
import * as DateUtils from '~utils/date/dateUtils';
import { getRevurderingsårsakMessageId } from '~utils/revurdering/revurderingUtils';

import Oppsummeringspanel, { Oppsummeringsfarge, Oppsummeringsikon } from '../oppsummeringspanel/Oppsummeringspanel';
import Vedtaksinformasjon from '../vedtaksinformasjon/Vedtaksinformasjon';

import messages from './oppsummeringsblokk-nb';
import styles from './oppsummeringsblokk.module.less';

const Intro = (props: { revurdering: Revurdering }) => {
    const { intl } = useI18n({ messages: { ...sharedMessages, ...messages } });
    return (
        <div className={styles.introContainer}>
            <div className={styles.intro}>
                {[
                    {
                        tittel: intl.formatMessage({ id: 'label.saksbehandler' }),
                        verdi: props.revurdering.saksbehandler,
                    },
                    {
                        tittel: intl.formatMessage({ id: 'label.periode' }),
                        verdi: DateUtils.formatPeriode(props.revurdering.periode),
                    },
                    {
                        tittel: intl.formatMessage({ id: 'label.startet' }),
                        verdi: DateUtils.formatDateTime(props.revurdering.opprettet),
                    },
                    {
                        tittel: intl.formatMessage({ id: 'label.årsak' }),
                        verdi: intl.formatMessage({
                            id: getRevurderingsårsakMessageId(props.revurdering.årsak),
                        }),
                    },
                    {
                        tittel: intl.formatMessage({ id: 'label.begrunnelse' }),
                        verdi: props.revurdering.begrunnelse,
                    },
                ].map((item) => (
                    <div className={styles.introItem} key={item.tittel}>
                        <Element>{item.tittel}</Element>
                        <Normaltekst>{item.verdi}</Normaltekst>
                    </div>
                ))}
            </div>
            <UnderkjenteAttesteringer attesteringer={props.revurdering.attesteringer} />
        </div>
    );
};

const Oppsummeringsblokk = (props: {
    revurdering: Revurdering;
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
