import { Heading } from '@navikt/ds-react';
import classNames from 'classnames';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as React from 'react';
import { IntlShape } from 'react-intl';

import Formuestatus from '~components/revurdering/formuestatus/Formuestatus';
import { OppsummeringPar } from '~components/revurdering/oppsummering/oppsummeringspar/Oppsummeringspar';
import { Utenlandsoppsummering } from '~components/revurdering/oppsummering/utenlandsopphold/Utenlandsoppsummering';
import { useI18n } from '~lib/i18n';
import { FormueResultat, FormueVilkår } from '~types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Vurderingstatus, InformasjonSomRevurderes, InformasjonsRevurdering } from '~types/Revurdering';
import { regnUtFormuegrunnlag } from '~utils/revurdering/formue/RevurderFormueUtils';
import { hentBosituasjongrunnlag } from '~utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';

import FormuevilkårOppsummering, { Formuevurdering } from '../formuevilkåroppsummering/FormuevilkårOppsummering';
import Fradragoppsummering from '../fradragoppsummering/Fradragoppsummering';

import { getBosituasjongrunnlagsblokker, getUførevilkårgrunnlagsblokker, Grunnlagsblokk } from './grunnlagsblokker';
import messages from './vedtaksinformasjon-nb';
import styles from './vedtaksinformasjon.module.less';

const Rad = (props: {
    overskrift?: boolean;
    radTittel?: string;
    children: { venstre: React.ReactNode; høyre: React.ReactNode };
}) => (
    <div className={classNames(styles.rad, { [styles.overskriftsrad]: props.overskrift })}>
        {props.radTittel && (
            <div className={styles.radTittelContainer}>
                <Heading level="4" size="small">
                    {props.radTittel}
                </Heading>
            </div>
        )}
        <div className={styles.childrenContainer}>
            <div className={styles.cellecontainer}>
                <div className={styles.celle}>{props.children.venstre}</div>
            </div>
            <div className={styles.cellecontainer}>
                <div className={styles.celle}>{props.children.høyre}</div>
            </div>
        </div>
    </div>
);

const Vilkårvisning = (props: { grunnlagsblokker: Grunnlagsblokk[] }) => (
    <div className={styles.vilkårvisningContainer}>
        {props.grunnlagsblokker.map((grunnlagsblokk, idx) => (
            <div key={idx} className={styles.grunnlagsblokk}>
                {grunnlagsblokk.map(({ label, verdi }) => (
                    <OppsummeringPar key={label} className={styles.info} label={label} verdi={verdi} />
                ))}
            </div>
        ))}
    </div>
);

const Uførevilkårblokk = (props: {
    nyeData: GrunnlagsdataOgVilkårsvurderinger;
    gamleData: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const i18n = useI18n({ messages });
    return pipe(
        O.fromNullable(props.nyeData.uføre),
        O.fold(
            () => null,
            (uførevilkår) => (
                <Rad radTittel={i18n.formatMessage('radTittel.uførhet')}>
                    {{
                        venstre: <Vilkårvisning grunnlagsblokker={getUførevilkårgrunnlagsblokker(uførevilkår, i18n)} />,
                        høyre: pipe(
                            O.fromNullable(props.gamleData.uføre),
                            O.fold(
                                () => null,
                                (grunnlag) => (
                                    <Vilkårvisning grunnlagsblokker={getUførevilkårgrunnlagsblokker(grunnlag, i18n)} />
                                )
                            )
                        ),
                    }}
                </Rad>
            )
        )
    );
};

const Bosituasjonblokk = (props: {
    nyeData: GrunnlagsdataOgVilkårsvurderinger;
    gamleData: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const i18n = useI18n({ messages });

    return pipe(
        O.fromNullable(hentBosituasjongrunnlag(props.nyeData)),
        O.fold(
            () => null,
            (bosituasjongrunnlag) => (
                <Rad radTittel={i18n.formatMessage('radTittel.bosituasjon')}>
                    {{
                        venstre: (
                            <Vilkårvisning
                                grunnlagsblokker={getBosituasjongrunnlagsblokker(bosituasjongrunnlag, i18n)}
                            />
                        ),
                        høyre: pipe(
                            O.fromNullable(hentBosituasjongrunnlag(props.gamleData)),
                            O.fold(
                                () => null,
                                (grunnlag) => (
                                    <Vilkårvisning grunnlagsblokker={getBosituasjongrunnlagsblokker(grunnlag, i18n)} />
                                )
                            )
                        ),
                    }}
                </Rad>
            )
        )
    );
};

const FormuevilkårVisning = (props: { formuevilkår: FormueVilkår; intl: IntlShape }) => {
    return (
        <ul>
            {props.formuevilkår.vurderinger.map((vurdering) => {
                const søkersFormue = regnUtFormuegrunnlag(vurdering.grunnlag.søkersFormue);
                const epsFormue = regnUtFormuegrunnlag(vurdering.grunnlag.epsFormue);
                const bekreftetFormue = søkersFormue + epsFormue;

                return (
                    <li key={vurdering.id}>
                        <Formuevurdering vurdering={vurdering} />
                        <Formuestatus
                            bekreftetFormue={bekreftetFormue}
                            erVilkårOppfylt={vurdering.resultat === FormueResultat.VilkårOppfylt}
                        />
                        <OppsummeringPar
                            label={props.intl.formatMessage({ id: 'formue.begrunnelse' })}
                            verdi={vurdering.grunnlag.begrunnelse}
                        />
                    </li>
                );
            })}
        </ul>
    );
};

const Formueblokk = (props: {
    nyeData: GrunnlagsdataOgVilkårsvurderinger;
    gamleData: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const { intl } = useI18n({ messages });

    return pipe(
        O.fromNullable(props.nyeData.formue),
        O.fold(
            () => null,
            (formuevilkår) => (
                <Rad radTittel={intl.formatMessage({ id: 'radTittel.formue' })}>
                    {{
                        venstre: <FormuevilkårVisning formuevilkår={formuevilkår} intl={intl} />,
                        høyre: pipe(
                            O.fromNullable(props.gamleData.formue),
                            O.fold(
                                () => null,
                                (gjeldendeFormuevilkår) => (
                                    <FormuevilkårOppsummering gjeldendeFormue={gjeldendeFormuevilkår} />
                                )
                            )
                        ),
                    }}
                </Rad>
            )
        )
    );
};

const Fradragblokk = (props: {
    nyeData: GrunnlagsdataOgVilkårsvurderinger;
    gamleData: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Rad radTittel={formatMessage('radTittel.fradrag')}>
            {{
                venstre: <Fradragoppsummering fradrag={props.nyeData.fradrag} />,
                høyre:
                    props.gamleData.fradrag.length > 0 ? (
                        <Fradragoppsummering fradrag={props.gamleData.fradrag} />
                    ) : null,
            }}
        </Rad>
    );
};

const Utenlandsblokk = (props: {
    nyeData: GrunnlagsdataOgVilkårsvurderinger;
    gamleData: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Rad radTittel={formatMessage('radTittel.utenlandsopphold')}>
            {{
                venstre: <Utenlandsoppsummering utenlandsopphold={props.nyeData.utenlandsopphold} />,
                høyre: <Utenlandsoppsummering utenlandsopphold={props.gamleData.utenlandsopphold} />,
            }}
        </Rad>
    );
};

const Vedtaksinformasjon = (props: {
    revurdering: InformasjonsRevurdering;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const { intl } = useI18n({ messages });

    const skalViseEndringerIOppsummering = Object.entries(props.revurdering.informasjonSomRevurderes)
        .filter(([informasjon]) => informasjon !== InformasjonSomRevurderes.Inntekt)
        .some(([, status]) => status === Vurderingstatus.Vurdert);

    return (
        <div className={styles.container}>
            {skalViseEndringerIOppsummering && (
                <Rad overskrift>
                    {{
                        venstre: (
                            <Heading level="3" size="medium">
                                {intl.formatMessage({ id: 'heading.nyInfo' })}
                            </Heading>
                        ),
                        høyre: (
                            <Heading level="3" size="medium">
                                {intl.formatMessage({ id: 'heading.eksisterende' })}
                            </Heading>
                        ),
                    }}
                </Rad>
            )}
            {props.revurdering.informasjonSomRevurderes.Uførhet === Vurderingstatus.Vurdert && (
                <Uførevilkårblokk
                    nyeData={props.revurdering.grunnlagsdataOgVilkårsvurderinger}
                    gamleData={props.grunnlagsdataOgVilkårsvurderinger}
                />
            )}
            {props.revurdering.informasjonSomRevurderes.Bosituasjon === Vurderingstatus.Vurdert && (
                <Bosituasjonblokk
                    nyeData={props.revurdering.grunnlagsdataOgVilkårsvurderinger}
                    gamleData={props.grunnlagsdataOgVilkårsvurderinger}
                />
            )}
            {props.revurdering.informasjonSomRevurderes.Formue === Vurderingstatus.Vurdert && (
                <Formueblokk
                    nyeData={props.revurdering.grunnlagsdataOgVilkårsvurderinger}
                    gamleData={props.grunnlagsdataOgVilkårsvurderinger}
                />
            )}
            {props.revurdering.informasjonSomRevurderes.Inntekt === Vurderingstatus.Vurdert && (
                <Fradragblokk
                    nyeData={props.revurdering.grunnlagsdataOgVilkårsvurderinger}
                    gamleData={props.grunnlagsdataOgVilkårsvurderinger}
                />
            )}
            {props.revurdering.informasjonSomRevurderes.Utenlandsopphold === Vurderingstatus.Vurdert && (
                <Utenlandsblokk
                    nyeData={props.revurdering.grunnlagsdataOgVilkårsvurderinger}
                    gamleData={props.grunnlagsdataOgVilkårsvurderinger}
                />
            )}
        </div>
    );
};

export default Vedtaksinformasjon;
