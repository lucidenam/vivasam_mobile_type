import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as api from 'lib/api';
import * as common from 'lib/common';
import RenderLoading from 'components/common/RenderLoading';
import {onClickCallLinkingOpenUrl} from "../../lib/OpenLinkUtils";

class SaemteoProgramView extends Component {

    state = {
        programInfo:'',
        isApply:false
    }

    componentDidMount(){
        const {programId} = this.props;
        this.getProgramInfo(programId);
    }
    
    // 이벤트 페이지로 이동
    redirectEvent = () => {
        const { history } = this.props;
        history.replace('/saemteo/event/view/579');
    }

    getProgramInfo = async(programId) => {
        const response = await api.programInfo(programId);
        if(response.data.code && (response.data.code === "0" || response.data.code === "2" || response.data.code === "3")){
            const { BaseActions } = this.props;
            let title = response.data.programList[0].mobileTitle;
            if(title.indexOf("#") > -1) title = title.replace(/#/gi, "");
            if(title.indexOf("<br>") > -1 || (title.indexOf("<br/>") > -1) || title.indexOf("<br />") > -1 )
                title = title.replace(/(<br>|<br\/>|<br \/>)/gi, " ");
            // <br> 외에도 <br/> Or <br /> 제목또한 안뜨도록 설정 - 20190625

            // 개발/운영 코드가 달라서 제목으로 필터 - 20240124
            if(title.match(/\[(.*?)\]/)[0] == '[49차]'
                || title.match(/\[(.*?)\]/)[0] == '[55차]'
                || title.match(/\[(.*?)\]/)[0] == '[61차]') {
                this.redirectEvent();
                return;
            }
            
            BaseActions.pushValues({type:"title", object:title});
            this.setState({
                programInfo: response.data.programList[0]
            });
            if(response.data.code === "3"){
               //이미 신청완료
               this.setState({
                   isApply: true
               });
            }
        } else {
            const { history } = this.props;
            history.push('/saemteo/index');
        }
    }

    handleClick = (e) => {
        e.preventDefault();
        const { logged, loginInfo, history, BaseActions} = this.props;
        const { isApply } = this.state;

        /*const loc = e.currentTarget.getAttribute('value')

        this.setState({
            loc : loc
        });*/

        if(!logged){ // 미로그인시
            common.info("로그인이 필요한 서비스입니다.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else {
            // 교사 인증
            if (loginInfo.certifyCheck === 'N') {
                BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                common.info("교사 인증 후 이벤트 참여를 해주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            // 준회원일 경우 신청 안됨.
            if (loginInfo.mLevel != 'AU300') {
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
                return false;
            }

            if (isApply) {
                common.info("이미 신청하셨습니다.");
            } else {
                history.push('/saemteo/program/apply/' + e.target.name);
                //history.push(`/saemteo/program/apply/${e.target.name}?loc=${loc}`);
            }
        }
    }

    render() {
        let {programInfo} = this.state;
        if (programInfo === '') return <RenderLoading/>;
        return (
            <section className="vivasamter program63">
                {/* 이벤트 이미지 영역 */}
                <div className="event_img program_wrap program_v2">
                    <a onClick={onClickCallLinkingOpenUrl.bind(this, 'https://naver.me/xX75tMuH')}
                       className="program_map" target="_blank">약도보기</a>
                    {/* <a onClick={onClickCallLinkingOpenUrl.bind(this, 'https://naver.me/FjbVFznK')}
                       className="program_map program_map2" target="_blank">지도보기</a>*/}
                    {/*<a onClick={onClickCallLinkingOpenUrl.bind(this, 'https://www.vivasam.com/samter/teacher/program/detail?idx=106&page=1&contType=P')}
                       target="_blank" className="program_btn">강의 미리 엿보기</a>
                    <a onClick={onClickCallLinkingOpenUrl.bind(this, 'https://www.vivasam.com/samter/teacher/program/detail?idx=104&page=1&contType=P')}
                       target="_blank" className="program_btn program_btn2">강의 미리 엿보기</a>*/}
                    <span dangerouslySetInnerHTML={{__html: programInfo.mobileContents}}></span>
                    <div className="vivasamter_applyDtl btnProgram">
                        <button
                            name={programInfo.cultureActId}
                            onClick={this.handleClick}
                            className="btn_full_on btn_full_on3 ">신청하기
                        </button>
                    </div>
                    <div className="program_ytb">
                        <iframe allowFullScreen="" frameBorder="0"
                                src="https://www.youtube.com/embed/2tzp83JzBy0?playsinline=1"></iframe>
                    </div>
                    {/*<div className="program_btns_wrap">
                        <a href=""
                           name={programInfo.cultureActId}
                           className="apply_btn"
                           value={"글라스 아트 벽시계 만들기"}
                           onClick={this.handleClick}>신청하기</a>
                        <a href=""
                           name={programInfo.cultureActId}
                           className="apply_btn btn2"
                           value={"감정관리 미러 페인팅"} onClick={this.handleClick}>신청하기</a>
                    </div>*/}
                </div>
                {/* //이벤트 이미지 영역 */}

            </section>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
      loginInfo: state.base.get('loginInfo').toJS()
  }),
  (dispatch) => ({
      BaseActions: bindActionCreators(baseActions, dispatch)
  })
)(withRouter(SaemteoProgramView));
