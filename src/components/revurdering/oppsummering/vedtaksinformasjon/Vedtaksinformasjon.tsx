import { Heading } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';

import OppsummeringAvBosituasjongrunnlag from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvBosituasjon';
import OppsummeringAvFormueVilkår from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFormue';
import OppsummeringAvFradrag from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFradrag';
import OppsummeringAvUførevilkår from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvUføre';
import FastOppholdOppsummering from '~src/components/revurdering/oppsummering/fastOpphold/FastOppholdOppsummering';
import FlyktningOppsummering from '~src/components/revurdering/oppsummering/flyktning/FlyktningOppsummering';
import { Utenlandsoppsummering } from '~src/components/revurdering/oppsummering/utenlandsopphold/Utenlandsoppsummering';
import { useI18n } from '~src/lib/i18n';
import { fradragErlik } from '~src/types/Fradrag';
import { bosituasjonErlik } from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { fastOppholdErLik } from '~src/types/grunnlagsdataOgVilkårsvurderinger/fastOpphold/FastOppholdVilkår';
import { flyktningErLik } from '~src/types/grunnlagsdataOgVilkårsvurderinger/flyktning/FlyktningVilkår';
import { formueErlik } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { institusjonsoppholdErLik } from '~src/types/grunnlagsdataOgVilkårsvurderinger/institusjonsopphold/Institusjonsopphold';
import { lovligOppholdErLik } from '~src/types/grunnlagsdataOgVilkårsvurderinger/lovligOpphold/LovligOppholdVilkår';
import { opplysningspliktErLik } from '~src/types/grunnlagsdataOgVilkårsvurderinger/opplysningsplikt/Opplysningsplikt';
import { personligOppmøteErLik } from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøteVilkår';
import { uføreErlik } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { utenlandsoppholdErlik } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { InformasjonsRevurdering, Vurderingstatus } from '~src/types/Revurdering';

import InstitusjonsoppholdOppsummering from '../institusjonsopphold/InstitusjonsoppholdOppsummering';
import LovligOppholdOppsummering from '../lovligOpphold/LovligOppholdOppsummering';
import OpplysningspliktOppsummering from '../opplysningspliktoppsummering/Opplysningspliktoppsummering';
import PersonligOppmøteOppsummering from '../personligOppmøte/PersonligOppmøteOppsummering';

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
    const skalViseFastOpphold =
        !fastOppholdErLik(nyeData.fastOpphold, gamleData.fastOpphold) ||
        valgtRevurderingssteg.FastOppholdINorge === Vurderingstatus.Vurdert;
    const skalVisePersonligOppmøte =
        !personligOppmøteErLik(nyeData.personligOppmøte, gamleData.personligOppmøte) ||
        valgtRevurderingssteg.PersonligOppmøte === Vurderingstatus.Vurdert;
    const skalViseInstitusjonsopphold =
        !institusjonsoppholdErLik(nyeData.institusjonsopphold, gamleData.institusjonsopphold) ||
        valgtRevurderingssteg.Institusjonsopphold === Vurderingstatus.Vurdert;

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
                            <OppsummeringAvUførevilkår uførevilkår={nyeData.uføre} visesIVedtak />
                        ) : null,
                        høyre: gamleData.uføre ? (
                            <OppsummeringAvUførevilkår uførevilkår={gamleData.uføre} visesIVedtak />
                        ) : null,
                    }}
                </Rad>
            )}
            {skalVisebosituasjon && (
                <Rad radTittel={formatMessage('radTittel.bosituasjon')}>
                    {{
                        venstre: <OppsummeringAvBosituasjongrunnlag bosituasjon={nyeData.bosituasjon} visesIVedtak />,
                        høyre: <OppsummeringAvBosituasjongrunnlag bosituasjon={gamleData.bosituasjon} visesIVedtak />,
                    }}
                </Rad>
            )}
            {skalViseformue && (
                <Rad radTittel={formatMessage('radTittel.formue')}>
                    {{
                        venstre: <OppsummeringAvFormueVilkår formue={nyeData.formue} visesIVedtak />,
                        høyre: <OppsummeringAvFormueVilkår formue={gamleData.formue} visesIVedtak />,
                    }}
                </Rad>
            )}
            {skalVisefradrag && (
                <Rad radTittel={formatMessage('radTittel.fradrag')}>
                    {{
                        venstre:
                            nyeData.fradrag.length > 0 ? (
                                <OppsummeringAvFradrag fradrag={nyeData.fradrag} visesIVedtak />
                            ) : null,
                        høyre:
                            gamleData.fradrag.length > 0 ? (
                                <OppsummeringAvFradrag fradrag={gamleData.fradrag} visesIVedtak />
                            ) : null,
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
            {skalViseFastOpphold && (
                <Rad radTittel={formatMessage('radTittel.fastOpphold')}>
                    {{
                        venstre: nyeData.fastOpphold ? (
                            <FastOppholdOppsummering fastOppholdVilkår={nyeData.fastOpphold} />
                        ) : null,
                        høyre: gamleData.fastOpphold ? (
                            <FastOppholdOppsummering fastOppholdVilkår={gamleData.fastOpphold} />
                        ) : null,
                    }}
                </Rad>
            )}
            {skalVisePersonligOppmøte && (
                <Rad radTittel={formatMessage('radTittel.personligOppmøte')}>
                    {{
                        venstre: nyeData.personligOppmøte ? (
                            <PersonligOppmøteOppsummering personligOppmøteVilkår={nyeData.personligOppmøte} />
                        ) : null,
                        høyre: gamleData.personligOppmøte ? (
                            <PersonligOppmøteOppsummering personligOppmøteVilkår={gamleData.personligOppmøte} />
                        ) : null,
                    }}
                </Rad>
            )}
            {skalViseInstitusjonsopphold && (
                <Rad radTittel={formatMessage('radTittel.institusjonsopphold')}>
                    {{
                        venstre: nyeData.institusjonsopphold ? (
                            <InstitusjonsoppholdOppsummering institusjonsoppholdVilkår={nyeData.institusjonsopphold} />
                        ) : null,
                        høyre: gamleData.institusjonsopphold ? (
                            <InstitusjonsoppholdOppsummering
                                institusjonsoppholdVilkår={gamleData.institusjonsopphold}
                            />
                        ) : null,
                    }}
                </Rad>
            )}
        </div>
    );
};

export default Vedtaksinformasjon;
