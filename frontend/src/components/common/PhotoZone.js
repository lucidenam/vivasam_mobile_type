import React, { Component, Fragment } from 'react';
import * as viewerActions from 'store/modules/viewer';
import {bindActionCreators} from "redux";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {getContentTarget} from "./utils";
import {getContentInfo} from "../../lib/api";

{/* 비바샘 포토존 Container - 3단계 */}
class PhotoZone extends Component {


    /* 뷰어 실행 */
    handleViewer = async (e) => {
        e.preventDefault();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('event', '뷰어 실행', {
            'parameter': '라이브러리'
        });
        const { ViewerActions } = this.props;
        const target = getContentTarget((await getContentInfo(e.target.dataset.id)).data);
        ViewerActions.openViewer({title: target.dataset.name, target: target});
    };

    render() {
        let imageUrl = 'url("'+this.props.thumbNail+'")';

        return (
            <div className="photozone_img">
                <div>
                    <a onClick={this.handleViewer} class="library_thumb">
                         <span className="img thumb_img" style={{ backgroundImage: imageUrl}}
                               onClick={this.handleViewer}
                               data-id={this.props.contentID}
                               alt="비바샘 포토존"></span>
                         <span className="name">
                            {this.props.subject}
                        </span>
                    </a>
                </div>
            </div>
        );
    }
}

export default connect(
    (state) => ({

    }),
    (dispatch) => ({
        ViewerActions: bindActionCreators(viewerActions, dispatch)
    })
)(withRouter(PhotoZone));

