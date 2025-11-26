import React, {Component} from 'react';
import PagePopupTemplate from 'components/page/PagePopupTemplate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as popupActions from 'store/modules/popup';

class PopupPage extends Component{
    render () {
        const { title,visible,componet, templateClassName, counter } = this.props;
        const handleClose = componet.props && componet.props.handleClose;
        return (
            <PagePopupTemplate title={title} visible={visible} handleClose={handleClose} templateClassName={templateClassName} counter={counter}>
                {componet}
            </PagePopupTemplate>
        )
    }
}

export default connect(
  (state) => ({
    title: state.popup.get('title'),
    visible: state.popup.get('visible'),
    componet: state.popup.get('componet'),
    templateClassName: state.popup.get('templateClassName'),
    counter: state.popup.get('counter')
  }),
  (dispatch) => ({
    PopupActions: bindActionCreators(popupActions, dispatch)
  })
)(PopupPage);
