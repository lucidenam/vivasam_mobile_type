import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import PageTitleChangeTemplate from "components/page/PageTitleChangeTemplate";
import {TextBookContainer, TextBookDataContainer} from 'containers/educourse';

class TextBookPage extends Component {
    render() {
        const { textbookCd, gubunCd, classCd } = this.props.match.params;
        const defaultGubunCd = gubunCd ? gubunCd : "L";
        let container = <TextBookContainer textbookCd={textbookCd} gubunCd={defaultGubunCd}/>;

        return (
            <PageTitleChangeTemplate>
                {container}
            </PageTitleChangeTemplate>
        );
    }
}

export default withRouter(TextBookPage);