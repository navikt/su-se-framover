import { InformationSquareIcon } from '~node_modules/@navikt/aksel-icons';
import { Accordion } from '~node_modules/@navikt/ds-react';
import OppsummeringAvBoforhold from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvBoforhold.tsx';
import OppsummeringAvFormue from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvFormue.tsx';
import OppsummeringAvForNav from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvForNav.tsx';
import OppsummeringAvInnlagtPåInstitusjon from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvInnlagtPåInstitusjon.tsx';
import OppsummeringAvOpphold from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvOpphold.tsx';
import OppsummeringAvUtenlandsoppholdSøknad from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvUtenlandsopphold.tsx';
import OppsummeringAvBosituasjongrunnlag from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvBosituasjon.tsx';
import OppsummeringAvFastOppholdvilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFastOpphold.tsx';
import OppsummeringAvFormueVilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFormue.tsx';
import OppsummeringAvFradrag from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFradrag.tsx';
import OppsummeringAvInstitusjonsoppholdvilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvInstitusjonsopphold.tsx';
import OppsummeringAvLovligOppholdvilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvLovligOpphold.tsx';
import OppsummeringAvPersonligoppmøtevilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvPersonligOppmøte.tsx';
import OppsummeringAvUtenlandsopphold from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvUtenlandsopphold.tsx';
import messages from '~src/components/oppsummering/sidestiltOppsummeringAvVilkårOgGrunnlag/SidestiltOppsummeringAvVilkårOgGrunnlag-nb.ts';
import styles from '~src/components/oppsummering/sidestiltOppsummeringAvVilkårOgGrunnlag/SidestiltOppsummeringAvVilkårOgGrunnlag.module.less';
import { VilkårResultatStatusIkon } from '~src/components/VilkårvurderingStatusIcon.tsx';
import { useI18n } from '~src/lib/i18n.ts';
import { Nullable } from '~src/lib/types.ts';
import { EksternGrunnlagSkatt } from '~src/types/EksterneGrunnlag.ts';
import { Fradrag, fradragErlik } from '~src/types/Fradrag.ts';
import {
    Bosituasjon,
    bosituasjonErlik,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag.ts';
import {
    fastOppholdErLik,
    FastOppholdVilkår,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/fastOpphold/FastOppholdVilkår.ts';
import { formueErlik, FormueVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår.ts';
import {
    institusjonsoppholdErLik,
    InstitusjonsoppholdVilkår,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/institusjonsopphold/Institusjonsopphold.ts';
import {
    lovligOppholdErLik,
    LovligOppholdVilkår,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/lovligOpphold/LovligOppholdVilkår.ts';
import {
    personligOppmøteErLik,
    PersonligOppmøteVilkår,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøteVilkår.ts';
import {
    utenlandsoppholdErlik,
    UtenlandsoppholdVilkår,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold.ts';
import {
    Boforhold,
    Formue,
    ForNav,
    InnlagtPåInstitusjon,
    Oppholdstillatelse,
    Utenlandsopphold,
} from '~src/types/Søknadinnhold.ts';

export const AccordionItemLovligOpphold = (props: {
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
            <Accordion.Header className={styles.accordionHeader}>
                <div className={styles.accordionHeaderContent}>
                    <VilkårResultatStatusIkon resultat={props.lovligOppholdFraGrunnlag?.resultat ?? null} />
                    {formatMessage('accordion.header.lovligOpphold')}
                </div>
                {harEndretLovligOpphold && (
                    <div className={styles.accordionHeaderContent}>
                        <InformationSquareIcon width={'1.8rem'} height={'1.8rem'} />
                    </div>
                )}
            </Accordion.Header>
            <Accordion.Content>
                <div className={styles.accordionContent}>
                    <OppsummeringAvLovligOppholdvilkår lovligOpphold={props.lovligOppholdFraGrunnlag} />
                    {props.sidestiltLovligOppholdVilkår && (
                        <OppsummeringAvLovligOppholdvilkår lovligOpphold={props.sidestiltLovligOppholdVilkår} />
                    )}
                    {props.sidestiltOppholdstillatelseFraSøknad && (
                        <OppsummeringAvOpphold oppholdstillatelse={props.sidestiltOppholdstillatelseFraSøknad} />
                    )}
                </div>
            </Accordion.Content>
        </Accordion.Item>
    );
};

export const AccordionItemFastOpphold = (props: {
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
            <Accordion.Header className={styles.accordionHeader}>
                <div className={styles.accordionHeaderContent}>
                    <VilkårResultatStatusIkon resultat={props.fastOppholdFraGrunnlag?.resultat ?? null} />
                    {formatMessage('accordion.header.fastOpphold')}
                </div>
                {harEndretFastOpphold && (
                    <div className={styles.accordionHeaderContent}>
                        <InformationSquareIcon width={'1.8rem'} height={'1.8rem'} />
                    </div>
                )}
            </Accordion.Header>
            <Accordion.Content>
                <div className={styles.accordionContent}>
                    <OppsummeringAvFastOppholdvilkår fastOpphold={props.fastOppholdFraGrunnlag} />
                    {props.sidestiltFastOppholdVilkår && (
                        <OppsummeringAvFastOppholdvilkår fastOpphold={props.sidestiltFastOppholdVilkår} />
                    )}
                    {props.sidestiltOppholdstillatelseFraSøknad && (
                        <OppsummeringAvOpphold
                            oppholdstillatelse={props.sidestiltOppholdstillatelseFraSøknad.oppholdstillatelse}
                            visAdresse={props.sidestiltOppholdstillatelseFraSøknad.boforhold}
                        />
                    )}
                </div>
            </Accordion.Content>
        </Accordion.Item>
    );
};

export const AccordionItemInstitusjonsopphold = (props: {
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
            <Accordion.Header className={styles.accordionHeader}>
                <div className={styles.accordionHeaderContent}>
                    <VilkårResultatStatusIkon resultat={props.institusjonsoppholdFraGrunnlag?.resultat ?? null} />
                    {formatMessage('accordion.header.institusjonsopphold')}
                </div>
                {harEndretInstitusjonsopphold && (
                    <div className={styles.accordionHeaderContent}>
                        <InformationSquareIcon width={'1.8rem'} height={'1.8rem'} />
                    </div>
                )}
            </Accordion.Header>
            <Accordion.Content>
                <div className={styles.accordionContent}>
                    <OppsummeringAvInstitusjonsoppholdvilkår
                        institusjonsopphold={props.institusjonsoppholdFraGrunnlag}
                    />
                    {props.sidestiltInstitusjonsopphold && (
                        <OppsummeringAvInstitusjonsoppholdvilkår
                            institusjonsopphold={props.sidestiltInstitusjonsopphold}
                        />
                    )}
                    {props.sidestiltInstitusjonsoppholdFraSøknad !== undefined && (
                        <OppsummeringAvInnlagtPåInstitusjon
                            innlagtPåInstitusjon={props.sidestiltInstitusjonsoppholdFraSøknad}
                        />
                    )}
                </div>
            </Accordion.Content>
        </Accordion.Item>
    );
};

export const AccordionItemUtenlandsopphold = (props: {
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
            <Accordion.Header className={styles.accordionHeader}>
                <div className={styles.accordionHeaderContent}>
                    <VilkårResultatStatusIkon resultat={props.utenlandsoppholdFraGrunnlag?.status ?? null} />
                    {formatMessage('accordion.header.utenlandsopphold')}
                </div>
                {harEndretUtenlandsopphold && (
                    <div className={styles.accordionHeaderContent}>
                        <InformationSquareIcon width={'1.8rem'} height={'1.8rem'} />
                    </div>
                )}
            </Accordion.Header>
            <Accordion.Content>
                <div className={styles.accordionContent}>
                    <OppsummeringAvUtenlandsopphold utenlandsopphold={props.utenlandsoppholdFraGrunnlag} />
                    {props.sidestiltUtenlandsopphold && (
                        <OppsummeringAvUtenlandsopphold utenlandsopphold={props.sidestiltUtenlandsopphold} />
                    )}
                    {props.sidestiltUtenlandsoppholdFraSøknad && (
                        <OppsummeringAvUtenlandsoppholdSøknad
                            utenlandsopphold={props.sidestiltUtenlandsoppholdFraSøknad}
                        />
                    )}
                </div>
            </Accordion.Content>
        </Accordion.Item>
    );
};

export const AccordionItemFormue = (props: {
    formueFraGrunnlag: FormueVilkår;
    sidestiltFormue?: FormueVilkår;
    sidestiltFormueFraSøknad?: {
        søkers: Formue;
        eps?: Nullable<Formue>;
    };
    eksternGrunnlagSkatt: Nullable<EksternGrunnlagSkatt>;
}) => {
    const { formatMessage } = useI18n({ messages });
    const harEndretFormue = props.sidestiltFormue && !formueErlik(props.formueFraGrunnlag, props.sidestiltFormue);
    return (
        <Accordion.Item>
            <Accordion.Header className={styles.accordionHeader}>
                <div className={styles.accordionHeaderContent}>
                    <VilkårResultatStatusIkon resultat={props.formueFraGrunnlag.resultat ?? null} />
                    {formatMessage('accordion.header.formue')}
                </div>
                {harEndretFormue && (
                    <div className={styles.accordionHeaderContent}>
                        <InformationSquareIcon width={'1.8rem'} height={'1.8rem'} />
                    </div>
                )}
            </Accordion.Header>
            <Accordion.Content>
                <div className={styles.accordionContent}>
                    <OppsummeringAvFormueVilkår
                        eksternGrunnlagSkatt={props.eksternGrunnlagSkatt}
                        formue={props.formueFraGrunnlag}
                    />
                    {props.sidestiltFormue && <OppsummeringAvFormueVilkår formue={props.sidestiltFormue} />}
                    {props.sidestiltFormueFraSøknad && (
                        <div className={styles.oppsummeringAvSøknadsformueContainer}>
                            <OppsummeringAvFormue formue={props.sidestiltFormueFraSøknad} />
                        </div>
                    )}
                </div>
            </Accordion.Content>
        </Accordion.Item>
    );
};

export const AccordionItemPersonligOppmøte = (props: {
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
            <Accordion.Header className={styles.accordionHeader}>
                <div className={styles.accordionHeaderContent}>
                    <VilkårResultatStatusIkon resultat={props.personligOppmøteFraGrunnlag?.resultat ?? null} />
                    {formatMessage('accordion.header.personligOppmøte')}
                </div>
                {harEndretPersonligOppmøte && (
                    <div className={styles.accordionHeaderContent}>
                        <InformationSquareIcon width={'1.8rem'} height={'1.8rem'} />
                    </div>
                )}
            </Accordion.Header>
            <Accordion.Content>
                <div className={styles.accordionContent}>
                    <OppsummeringAvPersonligoppmøtevilkår personligoppmøte={props.personligOppmøteFraGrunnlag} />
                    {props.sidestiltPersonligOppmøte && (
                        <OppsummeringAvPersonligoppmøtevilkår personligoppmøte={props.sidestiltPersonligOppmøte} />
                    )}
                    {props.sidestiltForNav && <OppsummeringAvForNav forNav={props.sidestiltForNav} />}
                </div>
            </Accordion.Content>
        </Accordion.Item>
    );
};

export const AccordionItemBosituasjon = (props: {
    bosituasjonFraGrunnlag: Bosituasjon[];
    sidestiltBosituasjon?: Bosituasjon[];
    boforholdFraSøknad?: Boforhold;
}) => {
    const { formatMessage } = useI18n({ messages });
    const harEndretBosituasjon =
        props.sidestiltBosituasjon && !bosituasjonErlik(props.bosituasjonFraGrunnlag, props.sidestiltBosituasjon);

    return (
        <Accordion.Item>
            <Accordion.Header className={styles.accordionHeader}>
                <div className={styles.accordionHeaderContent}>{formatMessage('accordion.header.bosituasjon')}</div>
                {harEndretBosituasjon && (
                    <div className={styles.accordionHeaderContent}>
                        <InformationSquareIcon width={'1.8rem'} height={'1.8rem'} />
                    </div>
                )}
            </Accordion.Header>
            <Accordion.Content>
                <div className={styles.accordionContent}>
                    <OppsummeringAvBosituasjongrunnlag bosituasjon={props.bosituasjonFraGrunnlag} />
                    {props.sidestiltBosituasjon && (
                        <OppsummeringAvBosituasjongrunnlag bosituasjon={props.sidestiltBosituasjon} />
                    )}
                    {props.boforholdFraSøknad && <OppsummeringAvBoforhold boforhold={props.boforholdFraSøknad} />}
                </div>
            </Accordion.Content>
        </Accordion.Item>
    );
};

export const AccordionItemFradrag = (props: { fradragFraGrunnlag: Fradrag[]; sidestiltFradrag: Fradrag[] }) => {
    const { formatMessage } = useI18n({ messages });
    const harEndretFradrag = !fradragErlik(props.fradragFraGrunnlag, props.sidestiltFradrag);

    return (
        <Accordion.Item>
            <Accordion.Header className={styles.accordionHeader}>
                <div className={styles.accordionHeaderContent}>{formatMessage('accordion.header.inntekt')}</div>
                {harEndretFradrag && (
                    <div className={styles.accordionHeaderContent}>
                        <InformationSquareIcon width={'1.8rem'} height={'1.8rem'} />
                    </div>
                )}
            </Accordion.Header>
            <Accordion.Content>
                <div className={styles.accordionContent}>
                    <OppsummeringAvFradrag fradrag={props.fradragFraGrunnlag} />
                    <OppsummeringAvFradrag fradrag={props.sidestiltFradrag} />
                </div>
            </Accordion.Content>
        </Accordion.Item>
    );
};
