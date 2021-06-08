import classNames from 'classnames';
import { Normaltekst, Element, Ingress } from 'nav-frontend-typografi';
import * as React from 'react';

import { formatPeriode } from '~lib/dateUtils';
import { formatCurrency } from '~lib/formatUtils';
import { useI18n } from '~lib/hooks';
import { Revurdering } from '~types/Revurdering';
import { GrunnlagsdataOgVilkårsvurderinger, UføreResultat, UføreVilkår } from '~types/Vilkår';

import messages from './vedtaksinformasjon-nb';
import styles from './vedtaksinformasjon.module.less';

const Rad = (props: { overskrift?: boolean; children: { venstre: JSX.Element; høyre: JSX.Element } }) => (
    <div className={classNames(styles.rad, { [styles.overskriftsrad]: props.overskrift })}>
        <div className={styles.cellecontainer}>
            <div className={styles.celle}>{props.children.venstre}</div>
        </div>
        <div className={styles.cellecontainer}>
            <div className={styles.celle}>{props.children.høyre}</div>
        </div>
    </div>
);

const Vilkårvisning = (props: {
    grunnlagsblokker: Array<
        Array<{
            label: string;
            verdi: string;
        }>
    >;
}) => (
    <div className={styles.vilkårvisningContainer}>
        {props.grunnlagsblokker.map((grunnlagsblokk, idx) => (
            <div key={idx} className={styles.grunnlagsblokk}>
                {grunnlagsblokk.map((grunnlagsinfo) => (
                    <div key={grunnlagsinfo.label} className={styles.info}>
                        <Normaltekst className={styles.infolabel}>{grunnlagsinfo.label}</Normaltekst>
                        <Element className={styles.infoverdi}>{grunnlagsinfo.verdi}</Element>
                    </div>
                ))}
            </div>
        ))}
    </div>
);

const Uførevilkår = (props: { vilkår: UføreVilkår }) => {
    const intl = useI18n({ messages });
    return (
        <Vilkårvisning
            grunnlagsblokker={props.vilkår.vurderinger.map((v) =>
                v.grunnlag && v.resultat === UføreResultat.VilkårOppfylt
                    ? [
                          {
                              label: intl.formatMessage({ id: 'uførhet.label.uføregrad' }),
                              verdi: `${v.grunnlag.uføregrad.toString()}%`,
                          },
                          {
                              label: intl.formatMessage({ id: 'generell.label.periode' }),
                              verdi: formatPeriode(v.grunnlag.periode, intl),
                          },
                          {
                              label: intl.formatMessage({ id: 'uførhet.label.ieu' }),
                              verdi: formatCurrency(intl, v.grunnlag.forventetInntekt),
                          },
                      ]
                    : [
                          {
                              label: intl.formatMessage({ id: 'uførhet.label.harUførevedtak' }),
                              verdi: intl.formatMessage({ id: 'generell.nei' }),
                          },
                          {
                              label: intl.formatMessage({ id: 'generell.label.periode' }),
                              verdi: formatPeriode(v.periode, intl),
                          },
                      ]
            )}
        />
    );
};

const Vedtaksinformasjon = (props: {
    revurdering: Revurdering;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const intl = useI18n({ messages });
    return (
        <div className={styles.container}>
            <Rad overskrift>
                {{
                    venstre: <Ingress>{intl.formatMessage({ id: 'heading.nyInfo' })}</Ingress>,
                    høyre: <Ingress>{intl.formatMessage({ id: 'heading.eksisterende' })}</Ingress>,
                }}
            </Rad>
            {props.revurdering.grunnlagsdataOgVilkårsvurderinger.uføre && (
                <Rad>
                    {{
                        venstre: <Uførevilkår vilkår={props.revurdering.grunnlagsdataOgVilkårsvurderinger.uføre} />,
                        høyre: props.grunnlagsdataOgVilkårsvurderinger.uføre ? (
                            <Uførevilkår vilkår={props.grunnlagsdataOgVilkårsvurderinger.uføre} />
                        ) : (
                            <span />
                        ),
                    }}
                </Rad>
            )}
        </div>
    );
};

export default Vedtaksinformasjon;
