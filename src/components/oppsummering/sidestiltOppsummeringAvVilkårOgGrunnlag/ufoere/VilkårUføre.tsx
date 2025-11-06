import { InformationSquareIcon } from '@navikt/aksel-icons';
import { Accordion } from '@navikt/ds-react';

import OppsummeringAvFlyktningstatus from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvFlyktningstatus.tsx';
import OppsummeringAvUføre from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvUføre.tsx';
import OppsummeringAvFlyktningvilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFlyktning.tsx';
import OppsummeringAvUførevilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvUføre.tsx';
import styles from '~src/components/oppsummering/sidestiltOppsummeringAvVilkårOgGrunnlag/SidestiltOppsummeringAvVilkårOgGrunnlag.module.less';
import messages from '~src/components/oppsummering/sidestiltOppsummeringAvVilkårOgGrunnlag/SidestiltOppsummeringAvVilkårOgGrunnlag-nb.ts';
import { VilkårResultatStatusIkon } from '~src/components/VilkårvurderingStatusIcon.tsx';
import { useI18n } from '~src/lib/i18n.ts';
import { Nullable } from '~src/lib/types.ts';
import {
    FlyktningVilkår,
    flyktningErLik,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/flyktning/FlyktningVilkår.ts';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger.ts';
import { UføreVilkår, uføreErlik } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår.ts';
import { Flyktningstatus, SøknadInnhold, SøknadInnholdUføre, Uførevedtak } from '~src/types/Søknadinnhold.ts';
import { isUføresøknad } from '~src/utils/søknad/søknadUtils.ts';

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
            <Accordion.Header className={styles.accordionHeader}>
                <div className={styles.accordionHeaderContent}>
                    <VilkårResultatStatusIkon resultat={props.uføreFraGrunnlagsdata?.resultat ?? null} />
                    {formatMessage('accordion.header.uføre')}
                </div>
                {harEndretUføre && (
                    <div className={styles.accordionHeaderContent}>
                        <InformationSquareIcon width={'1.8rem'} height={'1.8rem'} />
                    </div>
                )}
            </Accordion.Header>
            <Accordion.Content>
                <div className={styles.accordionContent}>
                    <OppsummeringAvUførevilkår uførevilkår={props.uføreFraGrunnlagsdata} />
                    {props.sidestiltUførevilkår && (
                        <OppsummeringAvUførevilkår uførevilkår={props.sidestiltUførevilkår} />
                    )}
                    {props.sidestiltUføreFraSøknad && <OppsummeringAvUføre uføre={props.sidestiltUføreFraSøknad} />}
                </div>
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
            <Accordion.Header className={styles.accordionHeader}>
                <div className={styles.accordionHeaderContent}>
                    <VilkårResultatStatusIkon resultat={props.flyktningFraGrunnlag?.resultat ?? null} />
                    {formatMessage('accordion.header.flyktning')}
                </div>
                {harEndretFlyktning && (
                    <div className={styles.accordionHeaderContent}>
                        <InformationSquareIcon width={'1.8rem'} height={'1.8rem'} />
                    </div>
                )}
            </Accordion.Header>
            <Accordion.Content>
                <div className={styles.accordionContent}>
                    <OppsummeringAvFlyktningvilkår flyktning={props.flyktningFraGrunnlag} />
                    {props.sidestiltFlyktningVilkår && (
                        <OppsummeringAvFlyktningvilkår flyktning={props.sidestiltFlyktningVilkår} />
                    )}
                    {props.sidestiltFlyktningFraSøknad && (
                        <OppsummeringAvFlyktningstatus flyktningstatus={props.sidestiltFlyktningFraSøknad} />
                    )}
                </div>
            </Accordion.Content>
        </Accordion.Item>
    );
};

export const VilkårUføre = (props: {
    uføre: Nullable<UføreVilkår>;
    flyktning: Nullable<FlyktningVilkår>;
    visesSidestiltMed: GrunnlagsdataOgVilkårsvurderinger | SøknadInnhold;
    sidestiltMedSøknad: boolean;
    sidestiltMedGrunnlagOgVilkår: boolean;
}) => {
    return (
        <>
            <Accordion variant="neutral" size="large">
                {props.uføre && (
                    <AccordionItemUføre
                        uføreFraGrunnlagsdata={props.uføre}
                        sidestiltUførevilkår={
                            props.sidestiltMedGrunnlagOgVilkår
                                ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).uføre
                                : undefined
                        }
                        sidestiltUføreFraSøknad={
                            props.sidestiltMedSøknad && isUføresøknad(props.visesSidestiltMed as SøknadInnhold)
                                ? (props.visesSidestiltMed as SøknadInnholdUføre).uførevedtak
                                : undefined
                        }
                    />
                )}
                {props.flyktning && (
                    <AccordionItemFlyktning
                        flyktningFraGrunnlag={props.flyktning}
                        sidestiltFlyktningVilkår={
                            props.sidestiltMedGrunnlagOgVilkår
                                ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).flyktning
                                : undefined
                        }
                        sidestiltFlyktningFraSøknad={
                            props.sidestiltMedSøknad && isUføresøknad(props.visesSidestiltMed as SøknadInnhold)
                                ? (props.visesSidestiltMed as SøknadInnholdUføre).flyktningsstatus
                                : undefined
                        }
                    />
                )}
            </Accordion>
        </>
    );
};
