import React, {Component, Fragment} from 'react';

export const initializeGtag = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-MZNXNH8PXM');
    // gtag('config', 'G-B7GPBXLL3E');

};