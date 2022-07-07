import { Heading } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';

import Formuestatus from '~src/components/revurdering/formuestatus/Formuestatus';
import FlyktningOppsummering from '~src/components/revurdering/oppsummering/flyktning/FlyktningOppsummering';
import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { Utenlandsoppsummering } from '~src/components/revurdering/oppsummering/utenlandsopphold/Utenlandsoppsummering';
import { useI18n } from '~src/lib/i18n';
import { FormueStatus } from '~src/types/Behandlingsinformasjon';
import { Bosituasjon } from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { FormueVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import {
    bosituasjonErlik,
    flyktningErLik,
    formueErlik,
    fradragErlik,
    GrunnlagsdataOgVilkårsvurderinger,
    lovligOppholdErLik,
    opplysningspliktErLik,
    uføreErlik,
    utenlandsoppholdErlik,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { InformasjonsRevurdering, Vurderingstatus } from '~src/types/Revurdering';
import { regnUtFormuegrunnlag } from '~src/utils/revurdering/formue/RevurderFormueUtils';

import FormuevilkårOppsummering, { Formuevurdering } from '../formuevilkåroppsummering/FormuevilkårOppsummering';
import Fradragoppsummering from '../fradragoppsummering/Fradragoppsummering';
import LovligOppholdOppsummering from '../lovligOpphold/LovligOppholdOppsummering';
import OpplysningspliktOppsummering from '../opplysningspliktoppsummering/Opplysningspliktoppsummering';

import { getBosituasjongrunnlagsblokker, getUførevilkårgrunnlagsblokker, Grunnlagsblokk } from './grunnlagsblokker';
import messages from './vedtaksinformasjon-nb';
import * as styles from './vedtaksinformasjon.module.less';

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

const Bosituasjonblokk = (props: { nyeData: Bosituasjon[]; gamleData: Bosituasjon[] }) => {
    const i18n = useI18n({ messages });

    return (
        <Rad radTittel={i18n.formatMessage('radTittel.bosituasjon')}>
            {{
                venstre: <Vilkårvisning grunnlagsblokker={getBosituasjongrunnlagsblokker(props.nyeData, i18n)} />,
                høyre: <Vilkårvisning grunnlagsblokker={getBosituasjongrunnlagsblokker(props.gamleData, i18n)} />,
            }}
        </Rad>
    );
};

const FormuevilkårVisning = (props: { formuevilkår: FormueVilkår }) => (
    <ul>
        {props.formuevilkår.vurderinger.map((vurdering) => {
            const søkersFormue = regnUtFormuegrunnlag(vurdering.grunnlag.søkersFormue);
            const epsFormue = regnUtFormuegrunnlag(vurdering.grunnlag.epsFormue);
            const bekreftetFormue = søkersFormue + epsFormue;

            return (
                <li key={vurdering.id} className={styles.formueVilkårResultatContainer}>
                    <Formuevurdering vurdering={vurdering} />
                    <Formuestatus
                        bekreftetFormue={bekreftetFormue}
                        erVilkårOppfylt={vurdering.resultat === FormueStatus.VilkårOppfylt}
                        skalVisesSomOppsummering
                    />
                </li>
            );
        })}
    </ul>
);

const Vedtaksinformasjon = (props: {
    revurdering: InformasjonsRevurdering;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const { formatMessage } = useI18n({ messages });
    const nyeData = props.revurdering.grunnlagsdataOgVilkårsvurderinger;
    const gamleData = props.grunnlagsdataOgVilkårsvurderinger;
    const valgtRevurderingssteg = props.revurdering.informasjonSomRevurderes;

    const skalViseUføre =
        !uføreErlik(nyeData.uføre, gamleData.uføre) || valgtRevurderingssteg.Uførhet === Vurderingstatus.Vurdert;
    const skalVisebosituasjon =
        !bosituasjonErlik(nyeData.bosituasjon, gamleData.bosituasjon) ||
        valgtRevurderingssteg.Bosituasjon === Vurderingstatus.Vurdert;
    const skalViseformue =
        !formueErlik(nyeData.formue, gamleData.formue) || valgtRevurderingssteg.Formue === Vurderingstatus.Vurdert;
    const skalVisefradrag =
        !fradragErlik(nyeData.fradrag, gamleData.fradrag) || valgtRevurderingssteg.Inntekt === Vurderingstatus.Vurdert;
    const skalViseutenlandsopphold =
        !utenlandsoppholdErlik(nyeData.utenlandsopphold, gamleData.utenlandsopphold) ||
        valgtRevurderingssteg.Utenlandsopphold === Vurderingstatus.Vurdert;
    const skalViseOpplysningsplikt =
        !opplysningspliktErLik(nyeData.opplysningsplikt, gamleData.opplysningsplikt) ||
        valgtRevurderingssteg.Opplysningsplikt === Vurderingstatus.Vurdert;
    const skalViseLovligOpphold =
        !lovligOppholdErLik(nyeData.lovligOpphold, gamleData.lovligOpphold) ||
        valgtRevurderingssteg.Oppholdstillatelse === Vurderingstatus.Vurdert;
    const skalViseFlyktning =
        !flyktningErLik(nyeData.flyktning, gamleData.flyktning) ||
        valgtRevurderingssteg.Flyktning === Vurderingstatus.Vurdert;

    return (
        <div className={styles.container}>
            <Rad overskrift>
                {{
                    venstre: (
                        <Heading level="3" size="medium">
                            {formatMessage('heading.nyInfo')}
                        </Heading>
                    ),
                    høyre: (
                        <Heading level="3" size="medium">
                            {formatMessage('heading.eksisterende')}
                        </Heading>
                    ),
                }}
            </Rad>
            {skalViseUføre && (
                <Rad radTittel={formatMessage('radTittel.uførhet')}>
                    {{
                        venstre: nyeData.uføre ? (
                            <Vilkårvisning
                                grunnlagsblokker={getUførevilkårgrunnlagsblokker(nyeData.uføre, formatMessage)}
                            />
                        ) : null,
                        høyre: gamleData.uføre ? (
                            <Vilkårvisning
                                grunnlagsblokker={getUførevilkårgrunnlagsblokker(gamleData.uføre, formatMessage)}
                            />
                        ) : null,
                    }}
                </Rad>
            )}
            {skalVisebosituasjon && (
                <Bosituasjonblokk nyeData={nyeData.bosituasjon} gamleData={gamleData.bosituasjon} />
            )}
            {skalViseformue && (
                <Rad radTittel={formatMessage('radTittel.formue')}>
                    {{
                        venstre: <FormuevilkårVisning formuevilkår={nyeData.formue} />,
                        høyre: <FormuevilkårOppsummering gjeldendeFormue={gamleData.formue} />,
                    }}
                </Rad>
            )}
            {skalVisefradrag && (
                <Rad radTittel={formatMessage('radTittel.fradrag')}>
                    {{
                        venstre: nyeData.fradrag.length > 0 ? <Fradragoppsummering fradrag={nyeData.fradrag} /> : null,
                        høyre:
                            gamleData.fradrag.length > 0 ? <Fradragoppsummering fradrag={gamleData.fradrag} /> : null,
                    }}
                </Rad>
            )}
            {skalViseutenlandsopphold && (
                <Rad radTittel={formatMessage('radTittel.utenlandsopphold')}>
                    {{
                        venstre: nyeData.utenlandsopphold ? (
                            <Utenlandsoppsummering utenlandsopphold={nyeData.utenlandsopphold} />
                        ) : null,
                        høyre: gamleData.utenlandsopphold ? (
                            <Utenlandsoppsummering utenlandsopphold={gamleData.utenlandsopphold} />
                        ) : null,
                    }}
                </Rad>
            )}
            {skalViseOpplysningsplikt && (
                <Rad radTittel={formatMessage('radTittel.opplysningsplikt')}>
                    {{
                        venstre: nyeData.opplysningsplikt ? (
                            <OpplysningspliktOppsummering opplysningsplikter={nyeData.opplysningsplikt} />
                        ) : null,
                        høyre: gamleData.opplysningsplikt ? (
                            <OpplysningspliktOppsummering opplysningsplikter={gamleData.opplysningsplikt} />
                        ) : null,
                    }}
                </Rad>
            )}
            {skalViseLovligOpphold && (
                <Rad radTittel={formatMessage('radTittel.lovligOpphold')}>
                    {{
                        venstre: nyeData.lovligOpphold ? (
                            <LovligOppholdOppsummering lovligOppholdVilkår={nyeData.lovligOpphold} />
                        ) : null,
                        høyre: gamleData.lovligOpphold ? (
                            <LovligOppholdOppsummering lovligOppholdVilkår={gamleData.lovligOpphold} />
                        ) : null,
                    }}
                </Rad>
            )}
            {skalViseFlyktning && (
                <Rad radTittel={formatMessage('radTittel.flyktning')}>
                    {{
                        venstre: nyeData.flyktning ? (
                            <FlyktningOppsummering flyktningVilkår={nyeData.flyktning} />
                        ) : null,
                        høyre: gamleData.flyktning ? (
                            <FlyktningOppsummering flyktningVilkår={gamleData.flyktning} />
                        ) : null,
                    }}
                </Rad>
            )}
        </div>
    );
};

export default Vedtaksinformasjon;
