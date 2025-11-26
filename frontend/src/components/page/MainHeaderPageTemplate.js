import React, {Component} from 'react';
import MainHeaderContainer from 'containers/main/MainHeaderContainer';
import FooterContainer from 'containers/page/FooterContainer';

class MainHeaderPageTemplate extends Component {
    componentDidMount() {
        window.scrollTo(0, 0);
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-MZNXNH8PXM');
        //gtag('config', 'G-B7GPBXLL3E');
        //gtag('config', 'G-SQPSJHDHZM'); // 공통
        // gtag('config', 'UA-71629292-17');
        // gtag('config', 'UA-71629292-2');
    }
    render() {
        const {children} = this.props;
        return (
            <div>
                <MainHeaderContainer/>
                  {children}
                <FooterContainer />
            </div>
        );
    }
}
export default MainHeaderPageTemplate;
