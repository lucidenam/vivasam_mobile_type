import React, {Component, Fragment} from 'react';
import HeaderViewerContainer from 'containers/page/HeaderViewerContainer';

class PageViewerTemplate extends Component {
    componentDidMount() {
        window.scrollTo(0, 0);
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-MZNXNH8PXM'); // 중고등
        // gtag('config', 'G-B7GPBXLL3E'); // 중고등
        // gtag('config', 'G-SQPSJHDHZM'); // 공통
        // gtag('config', 'UA-71629292-17');
        // gtag('config', 'UA-71629292-2');

    }

    render() {
        const {title,icon,visible,children,auth,target,handleAuth,handleDownload,handleAddFolder,handleApplyPoint} = this.props;
        return (
            <div>
                <div id="dim" className={"dim" + (visible && auth? " on" : "")}></div>
                <HeaderViewerContainer title={title} icon={icon} target={target}
                                       handleAuth={handleAuth}
                                       handleDownload={handleDownload}
                                       handleAddFolder={handleAddFolder}
                                       handleApplyPoint={handleApplyPoint}>
                {children}
                </HeaderViewerContainer>
            </div>
        );
    }
}
export default PageViewerTemplate;
