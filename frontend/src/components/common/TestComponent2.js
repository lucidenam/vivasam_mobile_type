import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { getContentInfo, getHtmlContentList } from 'lib/api';
import { LiveLessonPopupContainer, LiveLessonDownloadContainer } from 'containers/livelesson';
import {fromJS} from "immutable";
import $ from "jquery";
import {DOWNLOAD_IMAGE_PATH} from "../../constants";
import SubTabMenuOnlineClass from 'components/menu/SubTabMenuOnlineClass';
import { ScrollMenu } from 'components/common';
import * as common from 'lib/common'
import { SoobakcPopupContainer, SoobakcDownloadPopupContainer } from 'containers/soobakc'
import DownloadInfo from 'components/common/DownloadInfo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import * as viewerActions from 'store/modules/viewer';

class TestComponent2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }

    componentDidMount = async() => {
        await this.getContentList();
    }

    componentWillUpdate = () => {

    }

    getContentList = async () => {
        const { textbookCd } = this.props;
        try {
            const response = await getHtmlContentList(textbookCd);

            this.setState({
                data: response.data,
            });
        } catch (e) {
            console.log(e);
        }
    }

    handleViewer = async (id) => {
        const { ViewerActions } = this.props;
        try {
            const response = await getContentInfo(id);
            const { contentId, contentGubun, filePath, saveFileName, fileType, subject, summary, copyrightName, siteUrl } = response.data;
            let type;
            type = 'test';
            const target = {
                dataset: {
                    type: type,
                    src: DOWNLOAD_IMAGE_PATH + filePath + saveFileName,
                    name: subject,
                    id: contentId,
                    gubun: contentGubun,
                    summary: summary,
                    sourcename: copyrightName,
                    siteurl: siteUrl
                }
            };
            ViewerActions.openViewer({title:target.dataset.id+'-'+target.dataset.name, target:target});
        }catch(e) {
            console.log(e);
        }
    }

    render() {
        const { data } = this.state;

        return (
            <div>
                <section className="online_class_survive_way">
                    <ul className="ocsw_tbl">
                        {
                            data.map((item, idx) => {
                                return (
                                    <li className="google">
                                        <h3 className="fir">{ item.PERIOD_NAME }({ item.CONTENT_ID })</h3>
                                        <div className="lt" onClick={() => {this.handleViewer(item.CONTENT_ID)}}>
                                            <span className="tl">{ item.SUBJECT }</span>
                                            <button className="viewing"><span className="blind">클릭</span></button>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </section>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS()
    }),
    (dispatch) => ({
        ViewerActions: bindActionCreators(viewerActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(TestComponent2));