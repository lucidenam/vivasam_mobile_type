import React, {Component} from 'react';
import HeaderContainer from 'containers/page/HeaderContainer';
import FooterContainer from 'containers/page/FooterContainer';
import { connect } from 'react-redux';
import MenuButton from "./MenuButton";

class PageTitleChangeTemplate extends Component {
    componentDidMount() {
        window.scrollTo(0, 0);
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-MZNXNH8PXM');
        // gtag('config', 'G-B7GPBXLL3E');
        // gtag('config', 'G-SQPSJHDHZM'); // 공통
    }

    render() {
        const {children, title, isHidden} = this.props;
        let rightMenu;

        if(window.location.href.indexOf("saemteo") > -1) {
            rightMenu = "";
        } else {
            rightMenu = <MenuButton/>;
        }

        return (
            <div>
                <HeaderContainer title={title} rightMenu={rightMenu}/>
                <div>
                    {children}
                </div>
                <FooterContainer isHidden={isHidden}/>
            </div>
        );
    }
}
export default connect(
    (state) => ({
        title: state.base.get('title')
    })
)(PageTitleChangeTemplate);
