import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {debounce} from 'lodash';
import * as common from 'lib/common';
import * as baseActions from 'store/modules/base';
import * as saemteoActions from 'store/modules/saemteo';
import RenderLoading from 'components/common/RenderLoading';
import {initializeGtag} from "../../store/modules/gtag";

class Item extends Component {

    render() {
        const {surveyType, surveyTypeCd, surveyId ,surveyItemNo, surveyItemNm, handleChange} = this.props;
        //surveyType N : no textarea , O : only textarea , M : multi
        //surveyTypeCd M : checkbox , S : radio
        let inputType = surveyTypeCd === 'M' ? 'checkbox' : 'radio';
        let htmlFor = "survey_answer" + surveyId + surveyItemNo;
        let container;
        let name = surveyItemNm;
        if(surveyItemNo === '11'){
            name = surveyType === 'O' ? surveyItemNm : '기타';
            container = (
                            <div className="textareaWrap mt10">
                                <textarea id="ipt_cont" name="surveySubjective" onChange={handleChange} placeholder="자유롭게 의견을 기재해주세요" className="ipt_textarea ipt_textarea_count"></textarea>
                                <p>(<span className="check_lenght">0</span> / 한글 100자)</p>
                            </div>
                        );
        }
        return (
            <li className="check_multi_list">
                <div className="check_multi_box">
                    <input
                        type={inputType}
                        className="checkbox_circle ipt_circle_sm"
                        id={htmlFor}
                        value={surveyItemNo}
                        onChange={handleChange}
                        name="surveyItemNo"
                        />
                    <label htmlFor={htmlFor}>
                        <strong className="check_multi_tit">
                            {name}
                        </strong>
                    </label>
                    {container}
                </div>
            </li>
        );
    }
}

class SaemteoSurveyInfo extends Component {

    constructor(props) {
        super(props);
        // Debounce
        this.applyButtonClick = debounce(this.applyButtonClick, 300);
    }

    componentDidMount(){
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/saemteo/survey',
            'page_title': '비바샘 설문조사｜비바샘'
        });
        const info = this.props;
        const {survey, SaemteoActions} = this.props;
        survey.surveyId = info.surveyId;
        survey.surveyType = info.surveyType;
        survey.surveyTypeCd = info.surveyTypeCd;
        survey.surveyDuplSelCnt = info.surveyDuplSelCnt;
        SaemteoActions.pushValues({type:"survey", object:survey});
    }

    handleChange = (e) => {
        const {survey, SaemteoActions} = this.props;
        if(e.target.name === 'surveySubjective'){
            let isOverTextLength = this.handleCheckTextLenght(e);
            survey.isOverTextLength = isOverTextLength;
            survey.surveySubjective = e.target.value;
        }
        let surveyItems = this.handleCheckBox(e);
        survey.surveyItemNo = surveyItems.join(',');
        SaemteoActions.pushValues({type:"survey", object:survey});

    }

    handleCheckTextLenght = (e) => {
        let isOverTextLength = false;
        e.target.closest('ul').lastChild.getElementsByTagName('input')[0].checked = true;
        let spanTarget = e.target.nextElementSibling.getElementsByTagName('span')[0];
        spanTarget.innerHTML = e.target.textLength
        if(e.target.textLength > 100){
            isOverTextLength = true;
            spanTarget.classList.add('find_validate_txt')
        }else{
            spanTarget.classList.remove('find_validate_txt')
        }
        return isOverTextLength;
    }

    handleCheckBox = (e) => {
        let surveyItems = [];
        e.target.closest('ul').childNodes.forEach(function(item){
            let target = item.getElementsByTagName('input')[0];
            if(target.checked){
                surveyItems.push(target.value);
            }
        });
        return surveyItems;
    }

    applyButtonClickSafe = (e) => {
        const {logged, history, BaseActions} = this.props;
        if(!logged) {
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
            return null;
        }
        this.applyButtonClick(e.target);
    }

    applyButtonClick = (target) => {
        target.disabled = true;
        const { survey,history,SaemteoActions } = this.props;
        try {
            if(!survey.surveyItemNo){
                common.error("설문 항목을 선택해 주세요.");
                target.disabled = false;
                return false;
            } else if(survey.surveyItemNo.indexOf('11') > -1){
                if(!survey.surveySubjective) {
                    common.error("기타 항목을 선택하셨습니다. \n 의견을 입력해 주세요.");
                    target.disabled = false;
                    return false;
                }
                if(survey.isOverTextLength) {
                    common.error("100자 미만으로 입력해 주세요.");
                    target.disabled = false;
                    return false;
                }
            }
            if(survey.surveyTypeCd === 'M'){
                let checkItems = survey.surveyItemNo.split(',');
                if(checkItems.length > survey.surveyDuplSelCnt){
                    common.error("설문 항목은 최대 "+survey.surveyDuplSelCnt+"개까지 선택할 수 있습니다.");
                    target.disabled = false;
                    return false;
                }
            }
            SaemteoActions.pushValues({type:"survey", object:survey});
            this.insertApplyForm();
            target.disabled = false;
        } catch (e) {
            console.log(e);
        }
    }

    //신청
    insertApplyForm = async () => {
        const { survey, history, SaemteoActions, BaseActions } = this.props;
        try {
            BaseActions.openLoading();
            let response = await SaemteoActions.insertSurveyApply({...survey});
            if(response.data.code === '1'){
                common.error("이미 참여하셨습니다.");
            } else if (response.data.code === '0'){
                common.info("설문 참여가 완료되었습니다.");
            } else if (response.data.code === '3') {
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
            } else if (response.data.code === '4') {
                common.info("교사 인증 후 참여해 주세요.");
            } else {
                common.error("신청이 정상적으로 처리되지 못하였습니다.");
            }
        } catch (e) {
            console.log(e);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    }

    render() {
        const info = this.props;
        if(!info) return <RenderLoading loadingType={"3"}/>;
        let itemList = info.surveyItemList.map((item, index) => (<Item {...item} surveyType={info.surveyType} surveyTypeCd={info.surveyTypeCd} surveyId={info.surveyId} key={index} handleChange={this.handleChange} hadleFocus={this.hadleFocus}/>));

        return (
            <div className="vivasam_wrap">
                <div className="section viva_promote viva_promote_survey">
                    <h2 className="title promote_title_big">
                        {info.surveyYear}년 {info.surveyMonth}월
                    </h2>
                    <p className="promote_desc">
                        <span dangerouslySetInnerHTML={{__html: info.subject}}></span>
                    </p>
                </div>
                <div className="viva_surveyDtl_wrap">
                    <div className="viva_surveyDtl">
                        <div className="check_multi_wrap">
                            <ul>
                                {itemList}
                            </ul>
                        </div>
                        <div className="join_notice_simple">
                            <p className="join_notice_txt">
                                설문조사 주제와 맞지 않는 답변은 통보 없이 삭제될 수 있습니다.
                            </p>
                        </div>
                        <button
                            onClick={this.applyButtonClickSafe}
                            className="btn_full_on btn_full_sm btn_txt_bold mt30">참여하기</button>
                        <button
                            onClick={() => info.handelResult(info.surveyId)}
                            className="btn_full_off btn_full_sm btn_txt_bold mt10">결과보기</button>
                    </div>
                </div>
            </div>
        );
    }
}


export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        survey : state.saemteo.get('survey').toJS()
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch)
    })
)(withRouter(SaemteoSurveyInfo));
