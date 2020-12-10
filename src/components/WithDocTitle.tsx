import * as React from 'react';

import { useDocTitle } from '../lib/hooks';

const WithDocTitle = ({ title, Page }: { title: string; Page: React.ComponentType }) => {
    useDocTitle(title);
    return <Page />;
};

export default WithDocTitle;
