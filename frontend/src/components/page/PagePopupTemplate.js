import React, {Component} from 'react';
import HeaderPopupContainer from 'containers/page/HeaderPopupContainer';
import FooterPopupContainer from 'containers/page/FooterPopupContainer';

class PagePopupTemplate extends Component {
    componentDidMount() {
        window.scrollTo(0, 0);
    }
    render() {
        const {title,visible,children, handleClose, templateClassName, counter} = this.props;
        return (
            <div style={{display: visible ? 'block' : 'none'}} className={templateClassName}>
                <HeaderPopupContainer title={title} handleClose={handleClose} counter={counter}>
                    {children}
                </HeaderPopupContainer>
                <FooterPopupContainer />
            </div>
        );
    }
}
export default PagePopupTemplate;
