import { BodyShort, Heading, Label } from '@navikt/ds-react';
import * as React from 'react';

import { useI18n } from '~lib/i18n';
import messages from '~pages/saksbehandling/revurdering/uførhet/uførhet-nb';
import styles from '~pages/saksbehandling/revurdering/uførhet/uførhet.module.less';
import sharedMessages from '~pages/saksbehandling/søknadsbehandling/sharedI18n-nb';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { UføreResultat } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { formatPeriode } from '~utils/date/dateUtils';
import { formatCurrency } from '~utils/format/formatUtils';

export const GjeldendeGrunnlagsdata = (props: { vilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger }) => {
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages } });
    return (
        <div>
            <Heading level="2" size="large" spacing>
                {formatMessage('heading.gjeldendeGrunnlag')}
            </Heading>
            <ul className={styles.grunnlagsliste}>
                {props.vilkårsvurderinger.uføre?.vurderinger.map((item) => (
                    <li key={item.periode.fraOgMed + item.periode.tilOgMed}>
                        <Label>{formatPeriode(item.periode)}</Label>
                        <div>
                            <BodyShort>{formatMessage('gjeldende.vilkårOppfylt')}</BodyShort>
                            <Label>
                                {formatMessage(
                                    item.resultat === UføreResultat.VilkårOppfylt ? 'radio.label.ja' : 'radio.label.nei'
                                )}
                            </Label>
                        </div>
                        <div>
                            <BodyShort>{formatMessage('gjeldende.uføregrad')}</BodyShort>
                            <Label>{item.grunnlag ? `${item.grunnlag.uføregrad}%` : '—'}</Label>
                        </div>
                        <div>
                            <BodyShort>{formatMessage('gjeldende.inntektEtterUførhet')}</BodyShort>
                            <Label>{item.grunnlag ? formatCurrency(item.grunnlag.forventetInntekt) : '—'}</Label>
                        </div>
                        {item.begrunnelse && (
                            <div>
                                <BodyShort>{formatMessage('gjeldende.begrunnelse')}</BodyShort>
                                <Label>{item.begrunnelse}</Label>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};
