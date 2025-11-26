import React, {Component} from 'react';
import HeaderContainer from 'containers/page/HeaderContainer';
import FooterContainer from 'containers/page/FooterContainer';

class PageTemplate extends Component {
    componentDidMount() {
        window.scrollTo(0, 0);
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-MZNXNH8PXM');
        // gtag('config', 'G-B7GPBXLL3E');
        // gtag('config', 'G-SQPSJHDHZM'); // 공통
        // gtag('config', 'UA-71629292-17');
        // gtag('config', 'UA-71629292-2');
    }

    render() {
        const {children, title, rightMenu, isHidden, clazz, disableSticky} = this.props;
        return (
            <div className={clazz ? clazz : ''}>
                <HeaderContainer title={title} rightMenu={rightMenu} disableSticky={disableSticky}/>
                <div>
                    {children}
                </div>
                <FooterContainer isHidden={isHidden}/>
            </div>
        );
    }
}
export default PageTemplate;
