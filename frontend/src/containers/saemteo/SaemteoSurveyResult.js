import React, { Component,Fragment } from 'react';
import * as api from 'lib/api';
import * as common from 'lib/common';
import RenderLoading from 'components/common/RenderLoading';
import ContentLoading from 'components/common/ContentLoading';

class SaemteoItemResult extends Component {

    state = {
        surveyItemResult: '',
        contentLoading: false
    }

    static getDerivedStateFromProps(nextProps, prevState){
        if(nextProps.surveyItemResult!==prevState.surveyItemResult){
            return {
                surveyItemResult : nextProps.surveyItemResult
            };
        } else {
            return null;
        }
    }

    shouldComponentUpdate(nexProps, nextState) {
        return this.state !== nextState;
    }

    render() {
        const {surveyItemResult} = this.props;
        let container = <li className="opinion_txt">의견이 없습니다.</li>;
        if(surveyItemResult){
            container = surveyItemResult.map(
                (data, index) => {
                    return (
                        <li key={index} className="opinion_txt">{data.surveySubjective}</li>
                    )
                }
            );
        }
        return (
            <Fragment>
                {container}
            </Fragment>
        );
    }
}

class SaemteoSurveyResult extends Component {
    state = {
        surveyList: '',
        surveyItemResult: '',
        pagesize : 5,
        visible: false,
        links: {},
        totalElements: '',
        more:''
    }

    constructor(props) {
        super(props);
        this.More = React.createRef();
    }

    static getDerivedStateFromProps(nextProps, prevState){
        if(nextProps.surveyList!==prevState.surveyList){
            return {
                surveyList : nextProps.surveyList
            };
        } else {
            return null;
        }
    }

    shouldComponentUpdate(nexProps, nextState) {
        return this.state !== nextState;
    }

    componentDidMount(){
        window.scrollTo(0, 0);
        this._isMounted = true;
        this.startFunction();
    }

    componentWillUnmount() {
       this._isMounted = false;
    }

    startFunction = () => {
        this.getSurveyResultItem(1);
        if(this._isMounted){
            this.setState({
                more:this.refs.More
            });
        }
    }

    colorResult = (index) => {
        switch (index) {
          case 0:
            return "bar_contain_blue";
          case 1:
            return "bar_contain_sky";
          case 2:
            return "bar_contain_red";
          case 3:
            return "bar_contain_purple";
          case 4:
            return "bar_contain_yellowgreen";
          case 5:
            return "bar_contain_red";
          case 6:
            return "bar_contain_yellow";
          default:
            return "bar_contain_brown";;
        }
    }

    getSurveyResultItem = async (pageno) => {
        const {surveyId} = this.props;
        const {pagesize} = this.state;
        const paramObject = {
            surveyId: surveyId,
            pageno: pageno,
            pagesize: pagesize
        }
        try {
            const response = await api.surveyResultItem(paramObject);
            if(response.data.surveyItemResult){
                const {totalElements, totalPages, number} = response.data.surveyItemResult.page;
                const links = common.getLinkInfo(response.data.surveyItemResult.links);
                let visible = false;
                if(totalElements > 0 && totalPages > number+1) {
                    visible = true;
                }
                const surveyItemResult = response.data.surveyItemResult.content ? response.data.surveyItemResult.content : [];
                if(surveyItemResult.length === 0) {
                    return;
                }
                this.setState({
                    surveyItemResult : [...this.state.surveyItemResult, ...surveyItemResult.map(s => s)],
                    visible,
                    links,
                    totalElements
                });
            }
        } catch (e) {
            console.log(e);
        }finally{
            if(this._isMounted){
                setTimeout(()=>{
                    this.setState({
                        contentLoading : false
                    });
                }, 300);              
            }
        }
    }

    handleMoreVisible = (e) =>{
        e.preventDefault();
        const {more} = this.state;
        if(more.classList.contains('hide')){
            more.classList.remove('hide');
            document.getElementById("opinion_view").classList.remove('active')
        }else{
            more.classList.add('hide');
            document.getElementById("opinion_view").classList.add('active')
        }
    }

    handleMoreButton = (e) => {
        if(this._isMounted){
            this.setState({
              contentLoading : true
            });
        }
        e.preventDefault();
        const {links} = this.state;
        let reg = /&page=()\w+/g;
        let pageno = reg.exec(links.next);
        pageno = pageno[0].split('=');
        if(pageno[1]){
            pageno =  parseInt(pageno[1])+1
            this.getSurveyResultItem(pageno);
        }
    }

    render() {
        const {surveyList, surveyItemResult, visible, totalElements, contentLoading} = this.state;
        let container;
        let ectContainer;
        let ectCount = 0;
        let ectPercent = 0;
        if (surveyList) {
            let total = 0;
            surveyList.surveyResult.forEach( function(data) {
                total += parseInt(data.surveySelItemCnt);
            });
            if(total > 0){
                container = surveyList.surveyResult.map(
                    (data, index) => {
                        let clazz = 'stick_graph_wrap mt25'
                        if(index == 0){
                            clazz = 'stick_graph_wrap'
                        }
                        let percent = Math.floor(parseInt(data.surveySelItemCnt) / parseInt(total) * 100);
                        let barClazz = this.colorResult(index);
                        let name = data.surveyItemNm
                        if(data.surveyItemNo === '11'){
                            name = '기타';
                            ectPercent = percent;
                            ectCount =  data.surveySelItemCnt;
                        }
                        return (
                            <div className={clazz} key={index}>
                                <div className="stick_graph">
                                    <strong className="viva_surveyDtl_tit">{name}</strong>
                                    <span className="stick_graph_bar mt5 mb10">
                                        <em className={barClazz} style={{'width' : percent+'%'}}></em>
                                    </span>
                                </div>
                                <span className="graph_info">({data.surveySelItemCnt}명 / {percent}%)</span>
                            </div>
                        )
                    }
                );
                //page setting
                if(surveyList.surveyInfo.surveyType != 'N'){
                    ectContainer = (
                        <Fragment>
                            <div className="surveyTopH mt25">
                                <strong className="viva_surveyDtl_tit">기타</strong>
                                <span className="graph_info"> ({ectCount}명 / {ectPercent}%)</span>
                                <div className="opinion_view" id="opinion_view" onClick={this.handleMoreVisible} style={{marginTop:'10px'}}>
                                    <span style={{marginRight:'15px'}}>의견보기</span>
                                </div>
                            </div>
                            <div ref="More" className="opinion_list mt15">
                                <ul>
                                    <SaemteoItemResult surveyItemResult={surveyItemResult} totalElements={totalElements}/>
                                </ul>
                                { totalElements > 0 && contentLoading ?
                                    <ContentLoading />
                                    :
                                    <button
                                        type="button"
                                        onClick={this.handleMoreButton}
                                        style={{display: visible ? 'block' : 'none'}}
                                        className="btn_full_off btn_full_sm btn_txt_bold mt10">
                                        더보기
                                    </button>
                                }

                            </div>
                        </Fragment>
                    )
                }
            } else {
                container = <div><p>설문결과가 아직 없습니다.</p><p>설문에 참여해 주세요.</p></div>;
            }
        }else{
            return <RenderLoading loadingType={"3"}/>;
        }
        return (
            <section id="pop_content">
				<div className="section viva_promote viva_promote_survey">
					<a className="block">
						<h2 className="title promote_title_big">{surveyList.surveyInfo.surveyYear}년 {surveyList.surveyInfo.surveyMonth}월</h2>
						<p className="promote_desc">
                            <span dangerouslySetInnerHTML={{__html: surveyList.surveyInfo.subject}}></span>
                        </p>
					</a>
				</div>
				<div className="viva_surveyDtl_wrap">
					<div className="viva_surveyDtl">
                        {container}
                        {ectContainer}
                    </div>
				</div>
			</section>
        );
    }
}

export default SaemteoSurveyResult;
