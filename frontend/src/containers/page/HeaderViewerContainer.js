import React, { Component, Fragment } from 'react';
import { withRouter,Prompt } from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import * as viewerActions from 'store/modules/viewer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Draggable from 'react-draggable';
import { debounce } from 'lodash';
import * as common from 'lib/common'

class HeaderViewerContainer extends Component {

    //뷰어 높이 값 컨트롤
    state = {
        controlledPosition: {x: 0, y: 0},
        tooltipVisible: false,
    }

    tooltipToggle = () => {
        if (this.state.tooltipVisible) {
            this.setState({ tooltipVisible: false });
        } else {
            this.setState({ tooltipVisible: true });
        }
    };
    tooltipClose = () => {
        this.setState({ tooltipVisible: false });
    }

    constructor(props){
        super(props);
        //뒤로가기 시 뷰어 종료할 함수
        window.viewerClose = this.viewerClose;
        this.Viewer = React.createRef();

    }

    //뷰어 닫을시 library 충돌 방지하기 위해 debounce
    viewerClose = debounce(() => {
        const { ViewerActions } = this.props;
        ViewerActions.closeViewer();
    }, 300);

    //뷰어가 닫히고 초기화 하기 위해 debounce
    defaultPositionSafe = debounce(() => {
        this.setState({
            controlledPosition: {x:0, y:0}
        });
    }, 500);

    //뷰어가 닫히고 초기화 하기 위해 debounce
    defaultPosition = () => {
        this.setState({
            controlledPosition: {x:0, y:0}
        });
    };

    //뷰어 위치값 제어
    onControlledDrag = (e, position) => {
        const {x, y} = position;
        this.setState({controlledPosition: {x:0, y}});
    }

    onControlledDragStop = (e, position) => {
        this.onControlledDrag(e, position);
        this.onStop();
    }

    //드래그( 아래 방향 )로 뷰어 종료
    onStop = () => {
        const {y} = this.state.controlledPosition;
        let percent = y/window.innerHeight*100;
        if(percent > 30){
            this.viewerClose();
            this.defaultPositionSafe();
        }else{
            this.defaultPosition();
        }
    }

    handleChange = (e) => {
        const { doc, ViewerActions } = this.props;
        if (!e.target.value) {
            doc.no = e.target.value;
            ViewerActions.pushValues({type: "doc", object: doc});
            return;
        }
        const parseNum = parseInt(e.target.value);
        if (isNaN(parseNum)) {
            common.error("숫자만 입력 가능합니다.");
            doc.no = e.target.value.replace(/[^0-9.]/g, '');
        } else if (parseNum > doc.totalCount) {
            this.sendMessageToVSkin('page', parseNum);
            return;
        } else {
            doc.no = e.target.value;
        }

        this.sendMessageToVSkin('page', parseNum);
        this.setViewed();
        ViewerActions.pushValues({type: "doc", object: doc});
    }

    sendMessageToVSkin = (type, data) => {
        const messageData = {
            from: 'launcher',
            skin: 'basic01',
            msg: {
                type: type,
                data: data
            }
        };

        const vSkinContainer = document.getElementById('v-skin-container');
        if (vSkinContainer) {
            let detail = JSON.stringify(messageData);
            const customEvent = new CustomEvent('message', {
                detail: detail
            });
            vSkinContainer.dispatchEvent(customEvent);
        }
    }

    copyClipBoard = (shortUrl) => {
        // 글을 쓸 수 있는 란을 만든다.
        let aux = document.createElement("input");
        // 지정된 요소의 값을 할당 한다.
        aux.setAttribute("value", "https://v-sam.com/"+shortUrl);
        // bdy에 추가한다.
        document.body.appendChild(aux);
        // 지정된 내용을 강조한다.
        aux.select();
        // 텍스트를 카피 하는 변수를 생성
        document.execCommand("copy");
        // body 로 부터 다시 반환 한다.
        document.body.removeChild(aux);
        common.info('링크가 복사되었습니다.');
    };

    setViewed = () => {
        const {doc} = this.props;

        //화살표 visible
        var prev = document.getElementById('btn_action_prev').classList;
        var next = document.getElementById('btn_action_next').classList;
        if (parseInt(doc.no) === 1) {
            if (!prev.contains('hide')) prev.add('hide');
        } else {
            if (prev.contains('hide')) prev.remove('hide');
        }
        if (parseInt(doc.no) === parseInt(doc.totalCount)) {
            if (!next.contains('hide')) next.add('hide');
        } else {
            if (next.contains('hide')) next.remove('hide');
        }
    }

    render() {
        const { title, icon, visible, children, auth, logged, target, handleDownload, handleAddFolder, doc, contentInfo } = this.props;
        const { controlledPosition, tooltipVisible } = this.state;
        return (
            /* [vbook PUB] 뷰어 상단 UI 수정 퍼블 필요 */
            <Draggable
                axis="y"
                handle=".viewer_header"
                bounds={{top: 0}}
                position={controlledPosition}
                onStop={this.onControlledDragStop}
                cancel=".no-drag"
                >
                <div id="viewer" ref="Viewer" className={"viewer" + " textbook_viewer " + (logged && visible && auth ? " on" : "")}>
                    <div className="btnClose">
                        <button
                            type="button"
                            id="closeViewer"
                            onClick={this.viewerClose}
                            className="btn_close">
                                <span className="blind">
                                    이미지 뷰어 닫기
                                </span>
                        </button>
                    </div>
                    <div className={"viewer_header" + (target.dataset && target.dataset.type === 'document' ? "_doc" : "")}>
                        {target.dataset && target.dataset.type !== 'document' ?
                            (
                                <Fragment>
                                    <h1 className="header_tit" dangerouslySetInnerHTML={{__html: title}}></h1>
                                    <div className="allMenu">
                                        <span className={"icon_file_" + icon}></span>
                                    </div>
                                </Fragment>
                            )
                            :
                            (
                                <Fragment>
                                    <div className="total_count">
                                        <input type="text" className="no-drag" name="currentPage"
                                               onChange={this.handleChange}
                                               value={doc.no} />
                                        <em>/</em>
                                        {doc.totalCount}
                                    </div>
                                    <div className="button_group">
                                        <button type="button" onClick={handleAddFolder} className="btn_viewer btn_folder"> <span>담기</span></button>
                                        {
                                            target.dataset && target.dataset.downYn === 'Y' &&
                                            <button type="button" className={"btn_viewer btn_down" + (target.dataset.gubun === 'CN070' ? ' hide' : '')}
                                                    onClick={() => {
                                                        handleDownload(target)
                                                    }}> <span>다운로드</span></button>
                                        }
                                        {
                                            contentInfo.content.shortUrl &&
                                            (
                                                <button type="button"
                                                        className="btn_viewer btn_share"
                                                        onClick={() => {
                                                            this.copyClipBoard(contentInfo.content.shortUrl)
                                                        }}>
                                                    <span>공유하기</span>
                                                </button>
                                            )
                                        }
                                        <button type="button" className="btn_viewer btn_info" id="btn_content_info"
                                                onClick={this.tooltipToggle}
                                                disabled={!contentInfo.content.saveFileName}
                                        > <span>정보</span></button>
                                    </div>
                                    {tooltipVisible && (
                                        <div className="tooltip_info_box">
                                            <button type="button" onClick={this.tooltipClose} className="tooltip_close">
                                                <span className="blind">닫기</span>
                                            </button>
                                            <div className="tooltip_inner">
                                                <ul>
                                                    {
                                                        contentInfo.content.saveFileName &&
                                                        (
                                                            <li className="data_title">
                                                                <span>자료 :  </span><span>{contentInfo.content.saveFileName}</span>
                                                            </li>
                                                        )
                                                    }
                                                    {
                                                        contentInfo.content.copyrightName &&
                                                        (
                                                            <li>
                                                                <span>출처 :  </span><span>{contentInfo.content.copyrightName}</span>
                                                            </li>
                                                        )
                                                    }
                                                    {
                                                        contentInfo.content.additionalDesc &&
                                                        (
                                                            <li>
                                                                <span>코멘터리 :  </span><span>{contentInfo.content.additionalDesc}</span>
                                                            </li>
                                                        )
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </Fragment>
                            )}
                        {/*<h1 className="header_tit" dangerouslySetInnerHTML={{__html: title}}></h1>*/}
                        {/*<div className="allMenu">*/}
                        {/*    <span className={"icon_file_" + icon}></span>*/}
                        {/*</div>*/}
                    </div>
                    {children}
                </div>
            </Draggable>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        visible: state.viewer.get('visible'),
        doc: state.viewer.get('doc').toJS(),
        contentInfo: state.viewer.get('contentInfo').toJS(),
        auth: state.viewer.get('auth')
    }),
    (dispatch) => ({
        ViewerActions: bindActionCreators(viewerActions, dispatch)
    })
)(withRouter(HeaderViewerContainer));
