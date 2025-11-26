import React, {Component,Fragment} from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as viewerActions from 'store/modules/viewer';
import * as api from 'lib/api';
import { CONVERT_IMAGE_PATH, LP_DOMAIN_PATH } from '../../constants';
import 'css/ImageViewer.css';
import RenderLoading from 'components/common/RenderLoading';
import { ScrollMenu } from 'components/common';

class OriginImages extends Component {
    render() {
        const { content } = this.props;
        let container;
        let url;
        let src;
        if(content){
            let path = content[0].mediaGubun === 'CN070' ? LP_DOMAIN_PATH : content[0].mediaGubun === null ? '' : CONVERT_IMAGE_PATH;
            container = content.map(
                (data, index) => {
                    url = path+data.filePath;
                    return (
                        <li key={index}><img src={url}/></li>
                    )
                }
            );
        }else{
            container = null;
        }
        return (
            <Fragment>
                {container}
            </Fragment>
        );
    }
}

class SliderList extends Component {
    render() {
        const { content,handleClick } = this.props;
        let container;
        let url;
        let src;
        if(content){
            let path = content[0].mediaGubun === 'CN070' ? LP_DOMAIN_PATH : CONVERT_IMAGE_PATH;
            let pages = content.map(
                (data, index) => {
                    url = path+data.filePath;
                    src = 'url('+path+data.thumbnailPath+')';
                    return (
                        <button
                            type="button"
                            key={index}
                            data-no={data.orderNo}
                            onClick={handleClick}
                            className="viewer_nav_list">
                            <em className="viewer_nav_paging">{data.orderNo}</em>
                            <span
                                className="viewer_nav_img"
                                data-id={data.mediaId}
                                data-gubun={data.mediaGubun}
                                data-no={data.orderNo}
                                data-pageno={data.pageNo}
                                data-url={url}
                                style={{backgroundImage: src}} />
                        </button>
                    )
                }
            );
            if(pages.length < 2) container = null;
            container = (<ScrollMenu
                            ref="ScrollPage"
                            data={pages}
                            selected={1}
                            onSelect={handleClick}
                            alignCenter={false}
                            innerWrapperClass={'scrollpage'}
                        />);
        }else{
            container = null;
        }
        return (
            <Fragment>
                {container}
            </Fragment>
        );
    }
}

class DocumentViewer extends Component{

    state = {
        isFirst : true,
        loading: true
    }

    constructor(props) {
        super(props);
        this.Canvas = React.createRef();
        this.vSkinContainerRef = React.createRef(); // v-skin-container 참조 추가
    }

    componentDidMount(){
        this._isMounted = true;
        this.startFunction();
    }

    componentWillUnmount() {
       this._isMounted = false;
    }

    // v-skin에 메시지를 전송하는 함수
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
                detail: detail,
                bubbles: true
            });
            vSkinContainer.dispatchEvent(customEvent);
        }
    }

    startFunction = async() => {
        const { target,doc,ViewerActions, handleAuth, handleApplyPoint } = this.props;
        let auth = await handleAuth();
        if(!auth) return false;

        handleApplyPoint();

        doc.no = 1;
        doc.toolbarClazz = 'layer_help type5 hide';
        ViewerActions.pushValues({type:"doc", object:doc});
        ViewerActions.defaultDocValues();
        this.handleLoadContent(target.dataset.id,target.dataset.gubun);
    }

    handleLoadContent = async(contentId,contentGubun) => {
        const { doc, contentInfo, ViewerActions } = this.props;
        const response = await api.convertedDocumentList(contentId,contentGubun);
        const response2 = await api.documentContentInfo(contentId, contentGubun);

        if(response.data.code && response.data.code === "0"){
            doc.content = response.data.content;
            doc.totalCount = doc.content.length;
            ViewerActions.pushValues({type:"doc", object:doc});
            this.setViewed();
            // this.openImageViewer();
        }
        if (response2.data.code && response2.data.code === "0") {
            contentInfo.content = response2.data.content;
            ViewerActions.pushValues({type: "contentInfo", object: contentInfo});
        }
    }

    openImageViewer = () => {
        if(this._isMounted){
            this.setState({
                loading: false
            })
        }
        const { doc,ViewerActions } = this.props;
        var setViewed = this.setViewed;
        var Viewer = window.Viewer;
        var viewer = new Viewer(document.getElementById('originImages'), {
            className: 'document',
            toolbar: false,
            button: false,
            backdrop: false,
            toggleOnDblclick: false,
            hidden: function () {
                viewer.destroy();
            },
            viewed(obj) {
                setViewed(obj);
            },
            parent:this.refs.Canvas
        });
        viewer.build();
        viewer.show();
        doc.viewer = viewer;
        ViewerActions.pushValues({type:"doc", object:doc});
    }

    setViewed = () => {
        const { doc } = this.props;

        //화살표 visible
        var prev = document.getElementById('btn_action_prev').classList;
        var next = document.getElementById('btn_action_next').classList;
        if(parseInt(doc.no) === 1){
            if(!prev.contains('hide')) prev.add('hide');
        }else{
            if(prev.contains('hide')) prev.remove('hide');
        }
        if(parseInt(doc.no) === parseInt(doc.totalCount)){
            if(!next.contains('hide')) next.add('hide');
        }else{
            if(next.contains('hide')) next.remove('hide');
        }
    }

    handleClick = (pageNo) => {
        const { doc,ViewerActions } = this.props;
        if(doc.viewer){
            doc.viewer.view(pageNo);
            doc.no = parseInt(pageNo)+1;
            ViewerActions.pushValues({type:"doc", object:doc});
        }
    }

    // Vbook 이전 페이지
    handleVbookPrev = (e) => {
        const {doc, ViewerActions} = this.props;
        e.preventDefault();

        if (parseInt(doc.no) === 1) {
            return;
        }

        // Redux 상태 업데이트
        doc.no = parseInt(doc.no) - 1;
        doc.direction = 'prev';

        this.setViewed();

        // v-skin에 메시지 전송
        this.sendMessageToVSkin('pageMove', 'prev');

        ViewerActions.pushValues({type: "doc", object: doc});
    }

    // Vbook 다음 페이지
    handleVbookNext = (e) => {
        const {doc, ViewerActions} = this.props;
        e.preventDefault();

        if (doc.no === doc.totalCount) {
            return;
        }

        // Redux 상태 업데이트
        doc.no = parseInt(doc.no) + 1;
        doc.direction = 'next';

        this.setViewed();

        // v-skin에 메시지 전송
        this.sendMessageToVSkin('pageMove', 'next');

        ViewerActions.pushValues({type: "doc", object: doc});
    }

    handleChange = (e) => {
        const { doc,ViewerActions } = this.props;
        if(doc.viewer){
            let no = e.target.value;
            doc.viewer.view(no-1)
            doc.no = no;
            doc.direction = 'self';
            ViewerActions.pushValues({type:"doc", object:doc});
        }
    }

    handlePrev = (e) => {
        const { doc,ViewerActions } = this.props;
        e.preventDefault();
        if(doc.viewer){
            if(parseInt(doc.no) === 1){
                return;
            }
            doc.viewer.prev(true);
            doc.no = parseInt(doc.no) - 1;
            doc.direction = 'prev';
            ViewerActions.pushValues({type:"doc", object:doc});
        }
    }
    handleNext = (e) => {
        const { doc,ViewerActions } = this.props;
        e.preventDefault();
        if(doc.viewer){
            if(doc.no === doc.totalCount){
                return;
            }
            doc.viewer.next(true);
            doc.no = parseInt(doc.no) + 1;
            doc.direction = 'next';
            ViewerActions.pushValues({type:"doc", object:doc});
        }
    }

    handleToolbar = (e) => {
        e.preventDefault();
        const { doc,ViewerActions } = this.props;
        if(doc.toolbarClazz.includes('hide')){
            doc.toolbarClazz = 'layer_help type5';
        }else{
            doc.toolbarClazz = 'layer_help type5 hide';
        }
        ViewerActions.pushValues({type:"doc", object:doc});
    }

    handleNav = (e) => {
        e.preventDefault();
        if(e.target.id === "viewerNav" || e.target.id === "loadingImg"){
            var nav = document.getElementById('viewerNav').classList;
            var toolbar = document.getElementById('viewerToolbar').classList;
            if(!nav.contains('off')){
                nav.toggle('on');
            }
            toolbar.toggle('on');
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(nextState.loading){
            return false;
        }else{
            return true;
        }
    }

    render () {
        const { target,handleDownload,handleAddFolder,doc } = this.props;
        if(!target) return null;
        let src = target.dataset.src;
        let contentId = target.dataset.id;
        let minHeight = Math.floor(window.innerHeight / 1.5);
        let totalArray;
        if(doc.totalCount){
            totalArray = Array.apply(null, Array(parseInt(doc.totalCount))).map((val, idx) => idx+1);
        }
        const vSkinHTML = `
			<v-skin id="v-skin-container" 
				.$url="https://vbook.vivasam.com/${contentId}/contents" 
				.$skin="basic01" 
				.$page="1"
				.$userdiv="T"
				>
			</v-skin>
		`; // VBOOK으로 컨텐츠 열도록 수정
        return (
            <Fragment>
                {/* 이전/다음 버튼 - onClick 핸들러 연결 */}
                <div className="btn_action action_prev hide" id="btn_action_prev" onClick={this.handleVbookPrev}>
                    <span className="blind">이전</span>
                </div>
                <div className="btn_action action_next hide" id="btn_action_next" onClick={this.handleVbookNext}>
                    <span className="blind">다음</span>
                </div>

                {/* v-skin 컨테이너 */}
                <div
                    ref={this.vSkinContainerRef}
                    dangerouslySetInnerHTML={{ __html: vSkinHTML }}
                    style={{height: '100%'}}
                />
            </Fragment>
        )
    }
}

export default connect(
    (state) => ({
        doc : state.viewer.get('doc').toJS(),
        contentInfo: state.viewer.get('contentInfo').toJS()
    }),
    (dispatch) => ({
        ViewerActions: bindActionCreators(viewerActions, dispatch)
    })
)(withRouter(DocumentViewer));
