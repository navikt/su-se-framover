import { InformationSquareIcon } from '~node_modules/@navikt/aksel-icons';
import { Accordion } from '~node_modules/@navikt/ds-react';
import OppsummeringAvAlderspensjon from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvAlderspensjon.tsx';
import OppsummeringAvOppholdstillatelseAlder from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvOppholdstillatelseAlder.tsx';
import OppsummeringAvAldersvilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvAldersvilkår.tsx';
import OppsummeringAvFamiliegjenforening from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFamiliegjenforening.tsx';
import messages from '~src/components/oppsummering/sidestiltOppsummeringAvVilkårOgGrunnlag/SidestiltOppsummeringAvVilkårOgGrunnlag-nb.ts';
import styles from '~src/components/oppsummering/sidestiltOppsummeringAvVilkårOgGrunnlag/SidestiltOppsummeringAvVilkårOgGrunnlag.module.less';
import { VilkårResultatStatusIkon } from '~src/components/VilkårvurderingStatusIcon.tsx';
import { useI18n } from '~src/lib/i18n.ts';
import { Nullable } from '~src/lib/types.ts';
import { Aldersvilkår, aldersvilkårErLik } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår.ts';
import {
    Familiegjenforening,
    familiegjenforeningErLik,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/familieforening/Familieforening.ts';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger.ts';
import { Alderspensjon, OppholdstillatelseAlder, SøknadInnhold, SøknadInnholdAlder } from '~src/types/Søknadinnhold.ts';
import { isAldersøknad } from '~src/utils/søknad/søknadUtils.ts';

const AccordionItemFamiliegjenforening = (props: {
    familiegjenforeningFraGrunnlagsdata: Nullable<Familiegjenforening>;
    sidestiltFamiliegjenforening?: Nullable<Familiegjenforening>;
    sidestiltOppholdstillatelseAlder?: OppholdstillatelseAlder;
}) => {
    const { formatMessage } = useI18n({ messages });
    const harEndretFamiliegjenforening =
        props.sidestiltFamiliegjenforening &&
        !familiegjenforeningErLik(props.familiegjenforeningFraGrunnlagsdata, props.sidestiltFamiliegjenforening);

    return (
        <Accordion.Item>
            <Accordion.Header className={styles.accordionHeader}>
                <div className={styles.accordionHeaderContent}>
                    <VilkårResultatStatusIkon resultat={props.familiegjenforeningFraGrunnlagsdata?.resultat ?? null} />
                    {formatMessage('accordion.header.familiegjenforening')}
                </div>
                {harEndretFamiliegjenforening && (
                    <div className={styles.accordionHeaderContent}>
                        <InformationSquareIcon width={'1.8rem'} height={'1.8rem'} />
                    </div>
                )}
            </Accordion.Header>
            <Accordion.Content>
                <div className={styles.accordionContent}>
                    <OppsummeringAvFamiliegjenforening
                        familiegjenforening={props.familiegjenforeningFraGrunnlagsdata}
                    />
                    {props.sidestiltFamiliegjenforening && (
                        <OppsummeringAvFamiliegjenforening familiegjenforening={props.sidestiltFamiliegjenforening} />
                    )}
                    {props.sidestiltOppholdstillatelseAlder && (
                        <OppsummeringAvOppholdstillatelseAlder
                            oppholdstillatelse={props.sidestiltOppholdstillatelseAlder}
                        />
                    )}
                </div>
            </Accordion.Content>
        </Accordion.Item>
    );
};

const AccordionItemAldersvilkår = (props: {
    aldersvilkårFraGrunnlagsdata: Nullable<Aldersvilkår>;
    sidestiltAldersvilkår?: Nullable<Aldersvilkår>;
    sidestiltAlderspensjon?: Alderspensjon;
}) => {
    const { formatMessage } = useI18n({ messages });
    const harEndretAldersvilkår =
        props.sidestiltAldersvilkår &&
        !aldersvilkårErLik(props.aldersvilkårFraGrunnlagsdata, props.sidestiltAldersvilkår);

    return (
        <Accordion.Item>
            <Accordion.Header className={styles.accordionHeader}>
                <div className={styles.accordionHeaderContent}>
                    <VilkårResultatStatusIkon resultat={props.aldersvilkårFraGrunnlagsdata?.resultat ?? null} />
                    {formatMessage('accordion.header.alderspensjon')}
                </div>
                {harEndretAldersvilkår && (
                    <div className={styles.accordionHeaderContent}>
                        <InformationSquareIcon width={'1.8rem'} height={'1.8rem'} />
                    </div>
                )}
            </Accordion.Header>
            <Accordion.Content>
                <div className={styles.accordionContent}>
                    <OppsummeringAvAldersvilkår aldersvilkår={props.aldersvilkårFraGrunnlagsdata} />
                    {props.sidestiltAldersvilkår && (
                        <OppsummeringAvAldersvilkår aldersvilkår={props.sidestiltAldersvilkår} />
                    )}
                    {props.sidestiltAlderspensjon && (
                        <OppsummeringAvAlderspensjon alderspensjon={props.sidestiltAlderspensjon} />
                    )}
                </div>
            </Accordion.Content>
        </Accordion.Item>
    );
};

export const VilkårAlder = (props: {
    familiegjenforening: Nullable<Familiegjenforening>;
    pensjon: Nullable<Aldersvilkår>;
    visesSidestiltMed: GrunnlagsdataOgVilkårsvurderinger | SøknadInnhold;
    sidestiltMedSøknad: boolean;
    sidestiltMedGrunnlagOgVilkår: boolean;
}) => {
    return (
        <>
            {props.familiegjenforening && (
                <AccordionItemFamiliegjenforening
                    familiegjenforeningFraGrunnlagsdata={props.familiegjenforening}
                    sidestiltFamiliegjenforening={
                        props.sidestiltMedGrunnlagOgVilkår
                            ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).familiegjenforening
                            : undefined
                    }
                    sidestiltOppholdstillatelseAlder={
                        props.sidestiltMedSøknad && isAldersøknad(props.visesSidestiltMed as SøknadInnhold)
                            ? (props.visesSidestiltMed as SøknadInnholdAlder).oppholdstillatelseAlder
                            : undefined
                    }
                />
            )}
            {props.pensjon && (
                <AccordionItemAldersvilkår
                    aldersvilkårFraGrunnlagsdata={props.pensjon}
                    sidestiltAldersvilkår={
                        props.sidestiltMedGrunnlagOgVilkår
                            ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).pensjon
                            : undefined
                    }
                    sidestiltAlderspensjon={
                        props.sidestiltMedSøknad && isAldersøknad(props.visesSidestiltMed as SøknadInnhold)
                            ? (props.visesSidestiltMed as SøknadInnholdAlder).harSøktAlderspensjon
                            : undefined
                    }
                />
            )}
        </>
    );
};
