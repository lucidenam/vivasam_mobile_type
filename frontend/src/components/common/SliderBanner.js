import React, { Component } from 'react';
import { PUBLIC_DOMAIN } from 'constants/index';

class SliderBanner extends Component {
    render() {
        const { bannerFilePath,bannerFileSav,bannerUrl,linkType,handleClick } = this.props;

        let domain = PUBLIC_DOMAIN;
        if( bannerFilePath.indexOf('http') > -1 ) domain = '';
        let src = domain+bannerFilePath+bannerFileSav;
        return (
            <img
                onClick={handleClick}
                data-url={bannerUrl}
                data-type={linkType}
                className="viva_slider_img"
                src={src}
                />
        );
    }
}

export default SliderBanner;
