import { BodyShort, Heading, Label } from '@navikt/ds-react';
import * as React from 'react';

import { useI18n } from '~src/lib/i18n';
import messages from '~src/pages/saksbehandling/revurdering/uførhet/uførhet-nb';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { formatPeriode } from '~src/utils/date/dateUtils';
import { formatCurrency } from '~src/utils/format/formatUtils';

import styles from './gjeldendegrunnlagsdata.module.less';

export const GjeldendeGrunnlagsdata = (props: { vilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger }) => {
    const { formatMessage } = useI18n({ messages });
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
                    </li>
                ))}
            </ul>
        </div>
    );
};
