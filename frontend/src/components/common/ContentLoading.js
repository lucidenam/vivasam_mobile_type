import React, { Component,Fragment } from 'react';
import ContentLoader from "react-content-loader"

class ContentLoading extends Component {
    render() {
        const ContentLoading = props => (
             <ContentLoader
                rtl
                height={100}
                width={500}
                speed={4}
                primaryColor="#4083ed"
                secondaryColor="#ecebeb"
                {...props}
                >
                <circle cx="230" cy="50" r="4" />
                <circle cx="245" cy="50" r="4" />
                <circle cx="260" cy="50" r="4" />
                <circle cx="275" cy="50" r="4" />
            </ContentLoader>
        )
        return (
            <ContentLoading/>
        );
    }
}
export default ContentLoading;
