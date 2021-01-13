import Config from '~/config';

const FeatureToggles = {
    Hendelseslogg: Config.FEATURE_HENDELSESLOGG === 'true',
};

export default FeatureToggles;
