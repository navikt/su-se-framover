import { InformationColored } from '@navikt/ds-icons';
import { Accordion, Heading } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { Fradrag, fradragErlik } from '~src/types/Fradrag';
import {
    Bosituasjon,
    bosituasjonErlik,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import {
    fastOppholdErLik,
    FastOppholdVilkår,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/fastOpphold/FastOppholdVilkår';
import {
    flyktningErLik,
    FlyktningVilkår,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/flyktning/FlyktningVilkår';
import { formueErlik, FormueVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import {
    institusjonsoppholdErLik,
    InstitusjonsoppholdVilkår,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/institusjonsopphold/Institusjonsopphold';
import {
    lovligOppholdErLik,
    LovligOppholdVilkår,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/lovligOpphold/LovligOppholdVilkår';
import {
    personligOppmøteErLik,
    PersonligOppmøteVilkår,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøteVilkår';
import { uføreErlik, UføreVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import {
    utenlandsoppholdErlik,
    UtenlandsoppholdVilkår,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import {
    Boforhold,
    Flyktningstatus,
    Formue,
    ForNav,
    InnlagtPåInstitusjon,
    Oppholdstillatelse,
    SøknadInnhold,
    SøknadInnholdUføre,
    Uførevedtak,
    Utenlandsopphold,
} from '~src/types/Søknadinnhold';
import { isUføresøknad } from '~src/utils/søknad/søknadUtils';

import OppsummeringAvBoforhold from '../oppsummeringAvSøknadinnhold/OppsummeringAvBoforhold';
import OppsummeringAvFlyktningstatus from '../oppsummeringAvSøknadinnhold/OppsummeringAvFlyktningstatus';
import OppsummeringAvFormue from '../oppsummeringAvSøknadinnhold/OppsummeringAvFormue';
import OppsummeringAvForNav from '../oppsummeringAvSøknadinnhold/OppsummeringAvForNav';
import OppsummeringAvInnlagtPåInstitusjon from '../oppsummeringAvSøknadinnhold/OppsummeringAvInnlagtPåInstitusjon';
import OppsummeringAvOpphold from '../oppsummeringAvSøknadinnhold/OppsummeringAvOpphold';
import OppsummeringAvUføre from '../oppsummeringAvSøknadinnhold/OppsummeringAvUføre';
import OppsummeringAvUtenlandsoppholdSøknad from '../oppsummeringAvSøknadinnhold/OppsummeringAvUtenlandsopphold';
import OppsummeringAvBosituasjongrunnlag from '../oppsummeringAvVilkårOgGrunnlag/OppsummeringAvBosituasjon';
import OppsummeringAvFastOppholdvilkår from '../oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFastOpphold';
import OppsummeringAvFlyktningvilkår from '../oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFlyktning';
import OppsummeringAvFormueVilkår from '../oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFormue';
import OppsummeringAvFradrag from '../oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFradrag';
import OppsummeringAvInstitusjonsoppholdvilkår from '../oppsummeringAvVilkårOgGrunnlag/OppsummeringAvInstitusjonsopphold';
import OppsummeringAvLovligOppholdvilkår from '../oppsummeringAvVilkårOgGrunnlag/OppsummeringAvLovligOpphold';
import OppsummeringAvPersonligoppmøtevilkår from '../oppsummeringAvVilkårOgGrunnlag/OppsummeringAvPersonligOppmøte';
import OppsummeringAvUførevilkår from '../oppsummeringAvVilkårOgGrunnlag/OppsummeringAvUføre';
import OppsummeringAvUtenlandsopphold from '../oppsummeringAvVilkårOgGrunnlag/OppsummeringAvUtenlandsopphold';
import { VilkårResultatStatusIkon } from '../VilkårvurderingStatusIcon';

import messages from './SidestiltOppsummeringAvVilkårOgGrunnlag-nb';
import styles from './SidestiltOppsummeringAvVilkårOgGrunnlag.module.less';

const SidestiltOppsummeringAvVilkårOgGrunnlag = (props: {
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    visesSidestiltMed: GrunnlagsdataOgVilkårsvurderinger | SøknadInnhold;
}) => {
    const { formatMessage } = useI18n({ messages });

    const sidestiltMedSøknad = sidestiltMedSøknadInnhold(props.visesSidestiltMed);
    const sidestiltMedGrunnlagOgVilkår = sidestiltMedGrunnlagsdataOgVilkårsvurderinger(props.visesSidestiltMed);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.accordionOverskrift}>
                {sidestiltMedSøknad ? (
                    <Heading size="medium">{formatMessage('accordion.overskrift.fraSaksbehandling')}</Heading>
                ) : (
                    <Heading size="medium">{formatMessage('accordion.overskrift.nyVedtaksinformasjon')}</Heading>
                )}
                {sidestiltMedGrunnlagOgVilkår && (
                    <Heading size="medium">
                        {formatMessage('accordion.overskrift.eksisterendeVedtaksinformasjon')}
                    </Heading>
                )}
                {sidestiltMedSøknad && (
                    <Heading size="medium">{formatMessage('accordion.overskrift.fraSøknad')}</Heading>
                )}
            </div>
            <Accordion>
                <AccordionItemUføre
                    uføreFraGrunnlagsdata={props.grunnlagsdataOgVilkårsvurderinger.uføre}
                    sidestiltUførevilkår={
                        sidestiltMedGrunnlagOgVilkår
                            ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).uføre
                            : undefined
                    }
                    sidestiltUføreFraSøknad={
                        sidestiltMedSøknad && isUføresøknad(props.visesSidestiltMed as SøknadInnhold)
                            ? (props.visesSidestiltMed as SøknadInnholdUføre).uførevedtak
                            : undefined
                    }
                />
                <AccordionItemFlyktning
                    flyktningFraGrunnlag={props.grunnlagsdataOgVilkårsvurderinger.flyktning}
                    sidestiltFlyktningVilkår={
                        sidestiltMedGrunnlagOgVilkår
                            ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).flyktning
                            : undefined
                    }
                    sidestiltFlyktningFraSøknad={
                        sidestiltMedSøknad && isUføresøknad(props.visesSidestiltMed as SøknadInnhold)
                            ? (props.visesSidestiltMed as SøknadInnholdUføre).flyktningsstatus
                            : undefined
                    }
                />
                <AccordionItemLovligOpphold
                    lovligOppholdFraGrunnlag={props.grunnlagsdataOgVilkårsvurderinger.lovligOpphold}
                    sidestiltLovligOppholdVilkår={
                        sidestiltMedGrunnlagOgVilkår
                            ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).lovligOpphold
                            : undefined
                    }
                    sidestiltOppholdstillatelseFraSøknad={
                        sidestiltMedSøknad ? (props.visesSidestiltMed as SøknadInnhold).oppholdstillatelse : undefined
                    }
                />
                <AccordionItemFastOpphold
                    fastOppholdFraGrunnlag={props.grunnlagsdataOgVilkårsvurderinger.fastOpphold}
                    sidestiltFastOppholdVilkår={
                        sidestiltMedGrunnlagOgVilkår
                            ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).fastOpphold
                            : undefined
                    }
                    sidestiltOppholdstillatelseFraSøknad={
                        sidestiltMedSøknad
                            ? {
                                  oppholdstillatelse: (props.visesSidestiltMed as SøknadInnhold).oppholdstillatelse,
                                  boforhold: (props.visesSidestiltMed as SøknadInnhold).boforhold,
                              }
                            : undefined
                    }
                />
                <AccordionItemInstitusjonsopphold
                    institusjonsoppholdFraGrunnlag={props.grunnlagsdataOgVilkårsvurderinger.institusjonsopphold}
                    sidestiltInstitusjonsopphold={
                        sidestiltMedGrunnlagOgVilkår
                            ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).institusjonsopphold
                            : undefined
                    }
                    sidestiltInstitusjonsoppholdFraSøknad={
                        sidestiltMedSøknad
                            ? (props.visesSidestiltMed as SøknadInnhold).boforhold.innlagtPåInstitusjon
                            : undefined
                    }
                />
                <AccordionItemUtenlandsopphold
                    utenlandsoppholdFraGrunnlag={props.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold}
                    sidestiltUtenlandsopphold={
                        sidestiltMedGrunnlagOgVilkår
                            ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).utenlandsopphold
                            : undefined
                    }
                    sidestiltUtenlandsoppholdFraSøknad={
                        sidestiltMedSøknad ? (props.visesSidestiltMed as SøknadInnhold).utenlandsopphold : undefined
                    }
                />
                <AccordionItemFormue
                    formueFraGrunnlag={props.grunnlagsdataOgVilkårsvurderinger.formue}
                    sidestiltFormue={
                        sidestiltMedGrunnlagOgVilkår
                            ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).formue
                            : undefined
                    }
                    sidestiltFormueFraSøknad={
                        sidestiltMedSøknad
                            ? {
                                  søkers: (props.visesSidestiltMed as SøknadInnhold).formue,
                                  eps: (props.visesSidestiltMed as SøknadInnhold).ektefelle?.formue,
                              }
                            : undefined
                    }
                />
                <AccordionItemPersonligOppmøte
                    personligOppmøteFraGrunnlag={props.grunnlagsdataOgVilkårsvurderinger.personligOppmøte}
                    sidestiltPersonligOppmøte={
                        sidestiltMedGrunnlagOgVilkår
                            ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).personligOppmøte
                            : undefined
                    }
                    sidestiltForNav={sidestiltMedSøknad ? (props.visesSidestiltMed as SøknadInnhold).forNav : undefined}
                />
                <AccordionItemBosituasjon
                    bosituasjonFraGrunnlag={props.grunnlagsdataOgVilkårsvurderinger.bosituasjon}
                    sidestiltBosituasjon={
                        sidestiltMedGrunnlagOgVilkår
                            ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).bosituasjon
                            : undefined
                    }
                    boforholdFraSøknad={
                        sidestiltMedSøknad ? (props.visesSidestiltMed as SøknadInnhold).boforhold : undefined
                    }
                />
                {sidestiltMedGrunnlagOgVilkår && (
                    <AccordionItemFradrag
                        fradragFraGrunnlag={props.grunnlagsdataOgVilkårsvurderinger.fradrag}
                        sidestiltFradrag={(props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).fradrag}
                    />
                )}
            </Accordion>
        </div>
    );
};

const sidestiltMedSøknadInnhold = (
    sidestilt: GrunnlagsdataOgVilkårsvurderinger | SøknadInnhold
): sidestilt is SøknadInnhold => 'forNav' in sidestilt;

const sidestiltMedGrunnlagsdataOgVilkårsvurderinger = (
    sidestilt: GrunnlagsdataOgVilkårsvurderinger | SøknadInnhold
): sidestilt is GrunnlagsdataOgVilkårsvurderinger => 'bosituasjon' in sidestilt;

const AccordionItemUføre = (props: {
    uføreFraGrunnlagsdata: Nullable<UføreVilkår>;
    sidestiltUførevilkår?: Nullable<UføreVilkår>;
    sidestiltUføreFraSøknad?: Uførevedtak;
}) => {
    const { formatMessage } = useI18n({ messages });
    const harEndretUføre =
        props.sidestiltUførevilkår && !uføreErlik(props.uføreFraGrunnlagsdata, props.sidestiltUførevilkår);

    return (
        <Accordion.Item>
            <Accordion.Header>
                <div className={styles.accordionHeaderContentContainer}>
                    <div className={styles.accordionHeaderContent}>
                        <VilkårResultatStatusIkon resultat={props.uføreFraGrunnlagsdata?.resultat ?? null} />
                        {formatMessage('accordion.header.uføre')}
                    </div>
                    {harEndretUføre && (
                        <div className={styles.accordionHeaderContent}>
                            <InformationColored width={'1.2em'} height={'1.2em'} />
                        </div>
                    )}
                </div>
            </Accordion.Header>
            <Accordion.Content className={styles.accordionContent}>
                <OppsummeringAvUførevilkår uførevilkår={props.uføreFraGrunnlagsdata} visesIVedtak />
                {props.sidestiltUførevilkår && (
                    <OppsummeringAvUførevilkår uførevilkår={props.sidestiltUførevilkår} visesIVedtak />
                )}
                {props.sidestiltUføreFraSøknad && (
                    <OppsummeringAvUføre uføre={props.sidestiltUføreFraSøknad} visesIVedtak />
                )}
            </Accordion.Content>
        </Accordion.Item>
    );
};

const AccordionItemFlyktning = (props: {
    flyktningFraGrunnlag: Nullable<FlyktningVilkår>;
    sidestiltFlyktningVilkår?: Nullable<FlyktningVilkår>;
    sidestiltFlyktningFraSøknad?: Flyktningstatus;
}) => {
    const { formatMessage } = useI18n({ messages });
    const harEndretFlyktning =
        props.sidestiltFlyktningVilkår && !flyktningErLik(props.flyktningFraGrunnlag, props.sidestiltFlyktningVilkår);

    return (
        <Accordion.Item>
            <Accordion.Header>
                <div className={styles.accordionHeaderContentContainer}>
                    <div className={styles.accordionHeaderContent}>
                        <VilkårResultatStatusIkon resultat={props.flyktningFraGrunnlag?.resultat ?? null} />
                        {formatMessage('accordion.header.flyktning')}
                    </div>
                    {harEndretFlyktning && (
                        <div className={styles.accordionHeaderContent}>
                            <InformationColored width={'1.2em'} height={'1.2em'} />
                        </div>
                    )}
                </div>
            </Accordion.Header>
            <Accordion.Content className={styles.accordionContent}>
                <OppsummeringAvFlyktningvilkår flyktning={props.flyktningFraGrunnlag} visesIVedtak />
                {props.sidestiltFlyktningVilkår && (
                    <OppsummeringAvFlyktningvilkår flyktning={props.sidestiltFlyktningVilkår} visesIVedtak />
                )}
                {props.sidestiltFlyktningFraSøknad && (
                    <OppsummeringAvFlyktningstatus flyktningstatus={props.sidestiltFlyktningFraSøknad} visesIVedtak />
                )}
            </Accordion.Content>
        </Accordion.Item>
    );
};

const AccordionItemLovligOpphold = (props: {
    lovligOppholdFraGrunnlag: Nullable<LovligOppholdVilkår>;
    sidestiltLovligOppholdVilkår?: Nullable<LovligOppholdVilkår>;
    sidestiltOppholdstillatelseFraSøknad?: Oppholdstillatelse;
}) => {
    const { formatMessage } = useI18n({ messages });
    const harEndretLovligOpphold =
        props.sidestiltLovligOppholdVilkår &&
        !lovligOppholdErLik(props.lovligOppholdFraGrunnlag, props.sidestiltLovligOppholdVilkår);

    return (
        <Accordion.Item>
            <Accordion.Header>
                <div className={styles.accordionHeaderContentContainer}>
                    <div className={styles.accordionHeaderContent}>
                        <VilkårResultatStatusIkon resultat={props.lovligOppholdFraGrunnlag?.resultat ?? null} />
                        {formatMessage('accordion.header.lovligOpphold')}
                    </div>
                    {harEndretLovligOpphold && (
                        <div className={styles.accordionHeaderContent}>
                            <InformationColored width={'1.2em'} height={'1.2em'} />
                        </div>
                    )}
                </div>
            </Accordion.Header>
            <Accordion.Content className={styles.accordionContent}>
                <OppsummeringAvLovligOppholdvilkår lovligOpphold={props.lovligOppholdFraGrunnlag} visesIVedtak />
                {props.sidestiltLovligOppholdVilkår && (
                    <OppsummeringAvLovligOppholdvilkår
                        lovligOpphold={props.sidestiltLovligOppholdVilkår}
                        visesIVedtak
                    />
                )}
                {props.sidestiltOppholdstillatelseFraSøknad && (
                    <OppsummeringAvOpphold
                        oppholdstillatelse={props.sidestiltOppholdstillatelseFraSøknad}
                        visesIVedtak
                    />
                )}
            </Accordion.Content>
        </Accordion.Item>
    );
};

const AccordionItemFastOpphold = (props: {
    fastOppholdFraGrunnlag: Nullable<FastOppholdVilkår>;
    sidestiltFastOppholdVilkår?: Nullable<FastOppholdVilkår>;
    sidestiltOppholdstillatelseFraSøknad?: { oppholdstillatelse: Oppholdstillatelse; boforhold: Boforhold };
}) => {
    const { formatMessage } = useI18n({ messages });
    const harEndretFastOpphold =
        props.sidestiltFastOppholdVilkår &&
        !fastOppholdErLik(props.fastOppholdFraGrunnlag, props.sidestiltFastOppholdVilkår);

    return (
        <Accordion.Item>
            <Accordion.Header>
                <div className={styles.accordionHeaderContentContainer}>
                    <div className={styles.accordionHeaderContent}>
                        <VilkårResultatStatusIkon resultat={props.fastOppholdFraGrunnlag?.resultat ?? null} />
                        {formatMessage('accordion.header.fastOpphold')}
                    </div>
                    {harEndretFastOpphold && (
                        <div className={styles.accordionHeaderContent}>
                            <InformationColored width={'1.2em'} height={'1.2em'} />
                        </div>
                    )}
                </div>
            </Accordion.Header>
            <Accordion.Content className={styles.accordionContent}>
                <OppsummeringAvFastOppholdvilkår fastOpphold={props.fastOppholdFraGrunnlag} visesIVedtak />
                {props.sidestiltFastOppholdVilkår && (
                    <OppsummeringAvFastOppholdvilkår fastOpphold={props.sidestiltFastOppholdVilkår} visesIVedtak />
                )}
                {props.sidestiltOppholdstillatelseFraSøknad && (
                    <OppsummeringAvOpphold
                        oppholdstillatelse={props.sidestiltOppholdstillatelseFraSøknad.oppholdstillatelse}
                        visAdresse={props.sidestiltOppholdstillatelseFraSøknad.boforhold}
                        visesIVedtak
                    />
                )}
            </Accordion.Content>
        </Accordion.Item>
    );
};

const AccordionItemInstitusjonsopphold = (props: {
    institusjonsoppholdFraGrunnlag: Nullable<InstitusjonsoppholdVilkår>;
    sidestiltInstitusjonsopphold?: Nullable<InstitusjonsoppholdVilkår>;
    sidestiltInstitusjonsoppholdFraSøknad?: Nullable<InnlagtPåInstitusjon>;
}) => {
    const { formatMessage } = useI18n({ messages });
    const harEndretInstitusjonsopphold =
        props.sidestiltInstitusjonsopphold &&
        !institusjonsoppholdErLik(props.institusjonsoppholdFraGrunnlag, props.sidestiltInstitusjonsopphold);

    return (
        <Accordion.Item>
            <Accordion.Header>
                <div className={styles.accordionHeaderContentContainer}>
                    <div className={styles.accordionHeaderContent}>
                        <VilkårResultatStatusIkon resultat={props.institusjonsoppholdFraGrunnlag?.resultat ?? null} />
                        {formatMessage('accordion.header.institusjonsopphold')}
                    </div>
                    {harEndretInstitusjonsopphold && (
                        <div className={styles.accordionHeaderContent}>
                            <InformationColored width={'1.2em'} height={'1.2em'} />
                        </div>
                    )}
                </div>
            </Accordion.Header>
            <Accordion.Content className={styles.accordionContent}>
                <OppsummeringAvInstitusjonsoppholdvilkår
                    institusjonsopphold={props.institusjonsoppholdFraGrunnlag}
                    visesIVedtak
                />
                {props.sidestiltInstitusjonsopphold && (
                    <OppsummeringAvInstitusjonsoppholdvilkår
                        institusjonsopphold={props.sidestiltInstitusjonsopphold}
                        visesIVedtak
                    />
                )}
                {props.sidestiltInstitusjonsoppholdFraSøknad !== undefined && (
                    <OppsummeringAvInnlagtPåInstitusjon
                        innlagtPåInstitusjon={props.sidestiltInstitusjonsoppholdFraSøknad}
                        visesIVedtak
                    />
                )}
            </Accordion.Content>
        </Accordion.Item>
    );
};

const AccordionItemUtenlandsopphold = (props: {
    utenlandsoppholdFraGrunnlag: Nullable<UtenlandsoppholdVilkår>;
    sidestiltUtenlandsopphold?: Nullable<UtenlandsoppholdVilkår>;
    sidestiltUtenlandsoppholdFraSøknad?: Nullable<Utenlandsopphold>;
}) => {
    const { formatMessage } = useI18n({ messages });
    const harEndretUtenlandsopphold =
        props.sidestiltUtenlandsopphold &&
        !utenlandsoppholdErlik(props.utenlandsoppholdFraGrunnlag, props.sidestiltUtenlandsopphold);

    return (
        <Accordion.Item>
            <Accordion.Header>
                <div className={styles.accordionHeaderContentContainer}>
                    <div className={styles.accordionHeaderContent}>
                        <VilkårResultatStatusIkon resultat={props.utenlandsoppholdFraGrunnlag?.status ?? null} />
                        {formatMessage('accordion.header.utenlandsopphold')}
                    </div>
                    {harEndretUtenlandsopphold && (
                        <div className={styles.accordionHeaderContent}>
                            <InformationColored width={'1.2em'} height={'1.2em'} />
                        </div>
                    )}
                </div>
            </Accordion.Header>
            <Accordion.Content className={styles.accordionContent}>
                <OppsummeringAvUtenlandsopphold utenlandsopphold={props.utenlandsoppholdFraGrunnlag} visesIVedtak />
                {props.sidestiltUtenlandsopphold && (
                    <OppsummeringAvUtenlandsopphold utenlandsopphold={props.sidestiltUtenlandsopphold} visesIVedtak />
                )}
                {props.sidestiltUtenlandsoppholdFraSøknad && (
                    <OppsummeringAvUtenlandsoppholdSøknad
                        utenlandsopphold={props.sidestiltUtenlandsoppholdFraSøknad}
                        visesIVedtak
                    />
                )}
            </Accordion.Content>
        </Accordion.Item>
    );
};

const AccordionItemFormue = (props: {
    formueFraGrunnlag: FormueVilkår;
    sidestiltFormue?: FormueVilkår;
    sidestiltFormueFraSøknad?: {
        søkers: Formue;
        eps?: Nullable<Formue>;
    };
}) => {
    const { formatMessage } = useI18n({ messages });
    const harEndretFormue = props.sidestiltFormue && !formueErlik(props.formueFraGrunnlag, props.sidestiltFormue);
    return (
        <Accordion.Item>
            <Accordion.Header>
                <div className={styles.accordionHeaderContentContainer}>
                    <div className={styles.accordionHeaderContent}>
                        <VilkårResultatStatusIkon resultat={props.formueFraGrunnlag.resultat ?? null} />
                        {formatMessage('accordion.header.formue')}
                    </div>
                    {harEndretFormue && (
                        <div className={styles.accordionHeaderContent}>
                            <InformationColored width={'1.2em'} height={'1.2em'} />
                        </div>
                    )}
                </div>
            </Accordion.Header>
            <Accordion.Content className={styles.accordionContent}>
                <OppsummeringAvFormueVilkår formue={props.formueFraGrunnlag} visesIVedtak />
                {props.sidestiltFormue && <OppsummeringAvFormueVilkår formue={props.sidestiltFormue} visesIVedtak />}
                {props.sidestiltFormueFraSøknad && (
                    <OppsummeringAvFormue formue={props.sidestiltFormueFraSøknad} visesIVedtak />
                )}
            </Accordion.Content>
        </Accordion.Item>
    );
};

const AccordionItemPersonligOppmøte = (props: {
    personligOppmøteFraGrunnlag: Nullable<PersonligOppmøteVilkår>;
    sidestiltPersonligOppmøte?: Nullable<PersonligOppmøteVilkår>;
    sidestiltForNav?: ForNav;
}) => {
    const { formatMessage } = useI18n({ messages });
    const harEndretPersonligOppmøte =
        props.sidestiltPersonligOppmøte &&
        !personligOppmøteErLik(props.personligOppmøteFraGrunnlag, props.sidestiltPersonligOppmøte);

    return (
        <Accordion.Item>
            <Accordion.Header>
                <div className={styles.accordionHeaderContentContainer}>
                    <div className={styles.accordionHeaderContent}>
                        <VilkårResultatStatusIkon resultat={props.personligOppmøteFraGrunnlag?.resultat ?? null} />
                        {formatMessage('accordion.header.personligOppmøte')}
                    </div>
                    {harEndretPersonligOppmøte && (
                        <div className={styles.accordionHeaderContent}>
                            <InformationColored width={'1.2em'} height={'1.2em'} />
                        </div>
                    )}
                </div>
            </Accordion.Header>
            <Accordion.Content className={styles.accordionContent}>
                <OppsummeringAvPersonligoppmøtevilkår
                    personligoppmøte={props.personligOppmøteFraGrunnlag}
                    visesIVedtak
                />
                {props.sidestiltPersonligOppmøte && (
                    <OppsummeringAvPersonligoppmøtevilkår
                        personligoppmøte={props.sidestiltPersonligOppmøte}
                        visesIVedtak
                    />
                )}
                {props.sidestiltForNav && <OppsummeringAvForNav forNav={props.sidestiltForNav} visesIVedtak />}
            </Accordion.Content>
        </Accordion.Item>
    );
};

const AccordionItemBosituasjon = (props: {
    bosituasjonFraGrunnlag: Bosituasjon[];
    sidestiltBosituasjon?: Bosituasjon[];
    boforholdFraSøknad?: Boforhold;
}) => {
    const { formatMessage } = useI18n({ messages });
    const harEndretBosituasjon =
        props.sidestiltBosituasjon && !bosituasjonErlik(props.bosituasjonFraGrunnlag, props.sidestiltBosituasjon);

    return (
        <Accordion.Item>
            <Accordion.Header>
                <div className={styles.accordionHeaderContentContainer}>
                    <div className={styles.accordionHeaderContent}>{formatMessage('accordion.header.bosituasjon')}</div>
                    {harEndretBosituasjon && (
                        <div className={styles.accordionHeaderContent}>
                            <InformationColored width={'1.2em'} height={'1.2em'} />
                        </div>
                    )}
                </div>
            </Accordion.Header>
            <Accordion.Content className={styles.accordionContent}>
                <OppsummeringAvBosituasjongrunnlag bosituasjon={props.bosituasjonFraGrunnlag} visesIVedtak />
                {props.sidestiltBosituasjon && (
                    <OppsummeringAvBosituasjongrunnlag bosituasjon={props.sidestiltBosituasjon} visesIVedtak />
                )}
                {props.boforholdFraSøknad && (
                    <OppsummeringAvBoforhold boforhold={props.boforholdFraSøknad} visesIVedtak />
                )}
            </Accordion.Content>
        </Accordion.Item>
    );
};

const AccordionItemFradrag = (props: { fradragFraGrunnlag: Fradrag[]; sidestiltFradrag: Fradrag[] }) => {
    const { formatMessage } = useI18n({ messages });
    const harEndretFradrag = !fradragErlik(props.fradragFraGrunnlag, props.sidestiltFradrag);

    return (
        <Accordion.Item>
            <Accordion.Header>
                <div className={styles.accordionHeaderContentContainer}>
                    <div className={styles.accordionHeaderContent}>{formatMessage('accordion.header.inntekt')}</div>
                    {harEndretFradrag && (
                        <div className={styles.accordionHeaderContent}>
                            <InformationColored width={'1.2em'} height={'1.2em'} />
                        </div>
                    )}
                </div>
            </Accordion.Header>
            <Accordion.Content className={styles.accordionContent}>
                <OppsummeringAvFradrag fradrag={props.fradragFraGrunnlag} visesIVedtak />
                <OppsummeringAvFradrag fradrag={props.sidestiltFradrag} visesIVedtak />
            </Accordion.Content>
        </Accordion.Item>
    );
};

export default SidestiltOppsummeringAvVilkårOgGrunnlag;
