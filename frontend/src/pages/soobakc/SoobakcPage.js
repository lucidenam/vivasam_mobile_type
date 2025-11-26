import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as api from 'lib/api';
import * as baseActions from 'store/modules/base';
import PageTemplate from 'components/page/PageTemplate';
import SoobakcListContainer from 'containers/soobakc/SoobakcListContainer'
import {DOWNLOAD_IMAGE_PATH, PUBLIC_DOMAIN} from '../../constants';
import { Link } from 'react-router-dom';
import {initializeGtag} from "../../store/modules/gtag";

class SoobakcPage extends Component{
    constructor(props) {
        super(props);
        this.state = {
            type: '',
            grade : 5,
            educourse : '',
            school : '',
            offset: 0,
            soobakcAllList: [],
            soobakcList : [],
            isLoading : true,
            isMoreBtn : false,
            esActive : false,
            msActive : false,
            hsActive : false,
            sjcode : null,
            fksub : null,
            isTooltip : true,
            tooltipClassName : 'helpTab_btn icon_help active',
            isSoobakcImage : false,
            soobakcBannerPath : '',
            soobakcBannerLink : '',
            bannerSchoolGrade : '',
            bannerEducourse : ''
        }
    }

    componentDidMount() {
        const { logged, history, soobakcState, location } = this.props;
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        if(!logged) {
             history.replace({
                pathname: '/login',
                state: { prevPath: location.pathname }
            });
        } else {
            this.setStateTypeAndGrade();
            setTimeout(()=>{                
                //let schoolLvlNm = this.state.esActive ? '초등' : this.state.msActive ? '중학' : this.state.hsActive ? '고등' : '';
                let schoolLvlNm = this.state.msActive ? '중학' : this.state.hsActive ? '고등' : '';
                gtag('config', 'G-MZNXNH8PXM', {
                    'page_path': '/soobakc',
                    'page_title': '온리원 추천강의 - ' + schoolLvlNm + ' | 비바샘'
                });
            }, 500);
        }
    }

    setStateTypeAndGrade = () => {
        var vm = this;
        const { myClassInfo, soobakcState, history } = this.props;
        let { esActive, msActive, hsActive, sjcode, fksub } = this.state;

        var schoolLvlCd = '';
        var gradeString = 5;
        var fksubStr = '';
        
        if(history.action !== 'POP') {
            //홈에서 들어옴
            schoolLvlCd = myClassInfo.schoolLvlCd;
            if(myClassInfo.myGrade !== '' && (myClassInfo.myGrade * 1) >= 5 ) gradeString = myClassInfo.myGrade * 1;
            if(myClassInfo.mainSubjectName !== '') fksubStr = myClassInfo.mainSubjectName;
        } else {
            if(soobakcState != null) {
                if(soobakcState.schoolLvlCd === 'LEC_LISTE') schoolLvlCd = 'ES';
                if(soobakcState.schoolLvlCd === 'LEC_LIST')  schoolLvlCd = 'MS';
                if(soobakcState.schoolLvlCd === 'LEC_LISTH') schoolLvlCd = 'HS';
                
                gradeString = soobakcState.grade * 1;
                fksubStr = soobakcState.fksub;
            }
        }
        
        var typeString = "LEC_LIST"
        var educourse = 1;
        msActive = true;

        //2019.02.19 초등삭제요청
        if(schoolLvlCd === 'MS') {
            esActive = false;
            msActive = true;
            hsActive = false;
            typeString = "LEC_LIST";

            switch(fksubStr) {
                case '국어' : educourse = 2; fksub = '국어'; sjcode = 0; break;
                case '영어' : educourse = 3; fksub = '영어'; sjcode = 1; break;
                case '수학' : educourse = 4; fksub = '수학'; sjcode = 2; break;
                case '사회' : educourse = 5; fksub = '사회'; sjcode = 10; break;
                case '역사' : educourse = 6; fksub = '역사'; sjcode = 4; break;
                case '과학' : educourse = 7; fksub = '과학'; sjcode = 3; break;
            }

        } else if(schoolLvlCd === 'HS') {
            esActive = false;
            msActive = false;
            hsActive = true;
            typeString = "LEC_LISTH"

            switch(fksubStr) {
                case '국어' : educourse = 2; fksub = '국어'; sjcode = 0; break;
                case '영어' : educourse = 3; fksub = '영어'; sjcode = 1; break;
                case '수학' : educourse = 4; fksub = '수학'; sjcode = 2; break;
                case '사회' : educourse = 8; fksub = '사회/역사'; sjcode = 10; break;
                case '역사' : educourse = 8; fksub = '사회/역사'; sjcode = 10; break;
                case '과학' : educourse = 7; fksub = '과학'; sjcode = 3; break;
                case '사회/역사' : educourse = 8; fksub = '사회/역사'; sjcode = 10; break;
                case '한국사' : educourse = 9; fksub = '한국사'; sjcode = 4; break;
            }
        }

        this.setState({
            type : typeString,
            grade : gradeString,
            educourse : educourse,
            school : myClassInfo.schoolLvlCd,
            esActive : esActive,
            msActive : msActive,
            hsActive : hsActive,
            sjcode : sjcode,
            fksub : fksub
        })

        setTimeout(function(){
            vm.getSoobakcList();
            vm.getSoobakcImage();            
        }, 10);        
    }

    activeAnchor = (type, educourse, grade, e) => {
        let { fksub, sjcode, esActive, msActive, hsActive } = this.state;
        function gtag(){
            window.dataLayer.push(arguments);
        }
        if(type === 'LEC_LISTE') {
            esActive = true;
            msActive = false;
            hsActive = false;
            fksub = null;
            sjcode = null;

            let schoolLvlNm = esActive ? '초등' : msActive ? '중학' : hsActive ? '고등' : '';
            gtag('config', 'G-MZNXNH8PXM', {
                'page_path': '/soobakc',
                'page_title': '온리원 추천강의 - ' + schoolLvlNm + ' | 비바샘'
            });
        } else {
            if(type === 'LEC_LIST') {
                esActive = false;
                msActive = true;
                hsActive = false;
                let schoolLvlNm = esActive ? '초등' : msActive ? '중학' : hsActive ? '고등' : '';
                gtag('config', 'G-MZNXNH8PXM', {
                    'page_path': '/soobakc',
                    'page_title': '온리원 추천강의 - ' + schoolLvlNm + ' | 비바샘'
                });
                switch(educourse) {
                    case 1 : fksub = null; sjcode = null; break;
                    case 2 : fksub = '국어'; sjcode = 0; break;
                    case 3 : fksub = '영어'; sjcode = 1; break;
                    case 4 : fksub = '수학'; sjcode = 2; break;
                    case 5 : fksub = '사회'; sjcode = 10; break;
                    case 6 : fksub = '역사'; sjcode = 4; break;
                    case 7 : fksub = '과학'; sjcode = 3; break;
                }

            } else if(type === 'LEC_LISTH') {
                esActive = false;
                msActive = false;
                hsActive = true;
                let schoolLvlNm = esActive ? '초등' : msActive ? '중학' : hsActive ? '고등' : '';
                gtag('config', 'G-MZNXNH8PXM', {
                    'page_path': '/soobakc',
                    'page_title': '온리원 추천강의 - ' + schoolLvlNm + ' | 비바샘'
                });
                switch(educourse) {
                    case 1 : fksub = null; sjcode = null; break;
                    case 2 : fksub = '국어'; sjcode = 0; break;
                    case 3 : fksub = '영어'; sjcode = 1; break;
                    case 4 : fksub = '수학'; sjcode = 2; break;
                    case 7 : fksub = '과학'; sjcode = 3; break;
                    case 8 : fksub = '사회/역사'; sjcode = 10; break;
                    case 9 : fksub = '한국사'; sjcode = 4; break;
                }
            }
        }

        var vm = this;
        this.setState({
            type : type,
            educourse : educourse,
            grade : grade,
            fksub : fksub,
            sjcode : sjcode,
            esActive : esActive, 
            msActive : msActive,
            hsActive : hsActive,
            isMoreBtn : false,
            isLoading : true,
            soobakcAllList: [],
            soobakcList : []
        })

        setTimeout(function(){
            vm.getSoobakcList();
            vm.getSoobakcImage();
        }, 100);
    }

    getSoobakcList = async() => {
        const { BaseActions } = this.props;
        let { type, grade, sjcode, fksub, isMoreBtn } = this.state;
        var leccnt = null;
        isMoreBtn = false;

        if(type !== "LEC_LISTE") grade = null;
        const response = await api.getSoobakcList(type, fksub, sjcode, leccnt, grade);
        let soobakc = [];
        let offset = 0;

        if(response.data.length > 0) {
            for(var i = 0; i < 20; i++) {
                if(response.data[i] !== undefined) soobakc.push(response.data[i]);
                offset = i;
            }
            if(soobakc.length < response.data.length) isMoreBtn = true;
        } 

        this.setState({
            isMoreBtn : isMoreBtn,
            soobakcList : soobakc,
            soobakcAllList : response.data,
            offset : offset,
            sjcode : sjcode,
            isLoading : false
        })

        var soobakcData = {
            schoolLvlCd : type,
            grade : grade,
            fksub : fksub
        }
        BaseActions.pushValues({type:"soobakcState", object: soobakcData});
    }

    getSoobakcImage = async() => {
        const {loginInfo} = this.props;
        const { type, grade, sjcode } = this.state;
        let schoolGrade, educourse;

        switch(type) {
            case 'LEC_LISTE' : 
                schoolGrade = 'ES';
                educourse = grade * 1;
                break;
            case 'LEC_LIST' : 
                schoolGrade = 'MS';
                educourse = 'ALL';
                if(sjcode != null) educourse = sjcode;
                break;
            case 'LEC_LISTH' : 
                schoolGrade = 'HS';
                educourse = 'ALL';
                if(sjcode != null) educourse = sjcode;
                break;
        }

        this.setState({
            isSoobakcImage : false,
            bannerSchoolGrade : schoolGrade,
            bannerEducourse : educourse
        });

        const cookieName = 'vivasam_mobile_soobakc_banner_nouse_' + loginInfo.memberId + '_' + schoolGrade;
        var cookie = this.getCookie(cookieName);

        if(cookie !== 'Y') {
            const response = await api.getSoobakcImageBanner(schoolGrade, educourse);

            //https://dn.vivasam.com/vivasamfiledir/bottombanner/banner-vivasam-mobile-main-bottom.jpg
            //https://www.vivasam.com/vivasamfiledir/bottombanner/banner-vivasam-mobile-main-bottom.jpg

            //this.setState({
            //    isSoobakcImage : true,
            //    soobakcBannerPath : 'https://www.vivasam.com/vivasamfiledir/bottombanner/banner-vivasam-mobile-main-bottom.jpg',
            //    soobakcBannerLink : 'http://www.google.com'
            //})

            if(response.data != null) {
                let linkUrl;
                let imagePath;
                var soobakcImg = false;

                if(response.data.linkUrl != null) {
                    linkUrl = response.data.linkUrl;
                }

                if(response.data.imagePath != null) {
                    soobakcImg = true;
                    imagePath = PUBLIC_DOMAIN + response.data.imagePath;
                }

                this.setState({
                    isSoobakcImage : soobakcImg,
                    soobakcBannerPath : imagePath,
                    soobakcBannerLink : linkUrl
                })
            }
        }
    }

    addMoreList = () => {
        let { soobakcList, soobakcAllList, offset, isMoreBtn } = this.state;
        var vm = this;
        var addCount = 0;

        this.setState({
            isLoading : true,
            isMoreBtn : false
        })

        setTimeout(function(){
            if((offset+20) < soobakcAllList.length) {
                addCount = 20;
            } else {
                addCount = soobakcAllList.length - offset;
            }
    
            for(var i = (offset + 1); i < (offset+addCount); i++) {
                soobakcList.push(soobakcAllList[i]);
            }
    
            if(soobakcList.length == soobakcAllList.length) isMoreBtn = false;

            vm.setState({
                isLoading : false,
                isMoreBtn : isMoreBtn,
                offset : (offset+addCount) - 1,
                soobakcList : soobakcList
            })
        }, 1500);
    }

    changeSelectBox = (e) => {
        var vm = this;
        var sjcode = null;
        var fksub = e.target.value;
        
        if(fksub === '국어') sjcode = 0;
        if(fksub === '영어') sjcode = 1;
        if(fksub === '수학') sjcode = 2;
        if(fksub === '사회') sjcode = 10;
        if(fksub === '과학') sjcode = 3;
        if(fksub === '전체') {
            fksub = null;
            sjcode = null;
        }

        this.setState({
            fksub : fksub,
            sjcode : sjcode
        })

        setTimeout(function(){
            vm.getSoobakcList();
        }, 10);
    }

    tooltipActive = () => {
        let { isTooltip, tooltipClassName } = this.state;
        if(!isTooltip) {
            isTooltip = true;
            tooltipClassName = 'helpTab_btn icon_help active';
        } else {
            isTooltip = false;
            tooltipClassName = 'helpTab_btn icon_help';
        }

        this.setState({
            isTooltip : isTooltip,
            tooltipClassName : tooltipClassName
        })
    }

    bannerOff = () => {
        this.setState({
            isSoobakcImage : false
        })
    }

    bannerNoUse = () => {
        const {loginInfo} = this.props;
        const {bannerSchoolGrade} = this.state;

        const cookieName = 'vivasam_mobile_soobakc_banner_nouse_' + loginInfo.memberId + '_' + bannerSchoolGrade;
        var cookies = this.getCookie(cookieName);

        var expire = new Date();
        expire.setDate(expire.getDate() + 3650);

        cookies = cookieName + '=' + escape('Y') + '; path=/ '; // 한글 깨짐을 막기위해 escape(cValue)를 합니다.
        cookies += ';expires=' + expire.toGMTString() + ';';
        document.cookie = cookies;

        this.setState({
            isSoobakcImage : false
        })
    }

    getCookie = (cName) => {
        cName = cName + '=';
        var cookieData = document.cookie;
        var start = cookieData.indexOf(cName);
        var cValue = '';
        if(start != -1){
            start += cName.length;
            var end = cookieData.indexOf(';', start);
            if(end == -1)end = cookieData.length;
            cValue = cookieData.substring(start, end);
        }
        return unescape(cValue);
    }

    render () {
        const { type, grade, count, educourse, esActive, msActive, hsActive, soobakcList, sjcode, fksub, isMoreBtn, 
            isLoading, isTooltip, tooltipClassName, isSoobakcImage, soobakcBannerPath, soobakcBannerLink } = this.state;

        let tooltipDivClassName;
        if(isSoobakcImage) {
            tooltipDivClassName = 'layer_help type7 on';
        }
        else {
            tooltipDivClassName = 'layer_help type7 on';
        }


        return (
            <PageTemplate title='온리원 추천 강의'>
                <div className="tab_wrap">
                    <ul className="tab tabMulti">
                        {/* 
                        <li onClick={this.activeAnchor.bind(this, 'LEC_LISTE', null, 5)} className={esActive ? 'tab_item active' : 'tab_item'}><a className="tab_link"><span>초등</span></a></li>
                        */}
                        <li onClick={this.activeAnchor.bind(this, 'LEC_LIST', 1, null)}  className={msActive ? 'tab_item active' : 'tab_item'}><a className="tab_link" ><span>중학</span></a></li>
                        <li onClick={this.activeAnchor.bind(this, 'LEC_LISTH', 1, null)} className={hsActive ? 'tab_item active' : 'tab_item'}><a className="tab_link" ><span>고등</span></a></li>
                    </ul>
                    <button className={tooltipClassName} id="searchInputBox" onfocusin="layerOn()" onfocusout="layerOff()" onClick={this.tooltipActive}>
                        <span className="blind">온리원 도움말</span>
                    </button>
                </div>
                {/* type == 'LEC_LISTE' &&
                <div>
                    <div className="subTab">
                        <span className="blind">초등</span>
                        {isSoobakcImage &&
                            <div>
                                <img src={soobakcBannerPath}></img>
                                <button className='helpTab_btn_soobakc icon_help active' onClick={this.bannerOff}></button>
                            </div>
                        }
                        <div className="subTab helpTab">
                            <ul className="subTab_list">
                                <li onClick={this.activeAnchor.bind(this, 'LEC_LISTE', null, 5)} className={grade === 5 ? 'subTab_litem active' : 'subTab_litem'}><a className="subTab_link">5학년</a></li>
                                <li onClick={this.activeAnchor.bind(this, 'LEC_LISTE', null, 6)} className={grade === 6 ? 'subTab_litem active' : 'subTab_litem'}><a className="subTab_link">6학년</a></li>
                            </ul>
                            <button className={tooltipClassName} id="searchInputBox" onfocusin="layerOn()" onfocusout="layerOff()" onClick={this.tooltipActive}>
                                <span className="blind">온리원 도움말</span>
                            </button>
                        </div>
                    </div>
                </div>
                */}
                {type == 'LEC_LIST' &&
                <div>
                    <span className="blind">중학</span>
                    <div className="subTab helpTab">
                        <ul className="subTab_list">
                            <li onClick={this.activeAnchor.bind(this, 'LEC_LIST', 1, null)} className={educourse === 1 ? 'subTab_litem active' : 'subTab_litem'}><a className="subTab_link">전체</a></li>
                            <li onClick={this.activeAnchor.bind(this, 'LEC_LIST', 2, null)} className={educourse === 2 ? 'subTab_litem active' : 'subTab_litem'}><a className="subTab_link">국어</a></li>
                            <li onClick={this.activeAnchor.bind(this, 'LEC_LIST', 3, null)} className={educourse === 3 ? 'subTab_litem active' : 'subTab_litem'}><a className="subTab_link">영어</a></li>
                            <li onClick={this.activeAnchor.bind(this, 'LEC_LIST', 4, null)} className={educourse === 4 ? 'subTab_litem active' : 'subTab_litem'}><a className="subTab_link">수학</a></li>
                            <li onClick={this.activeAnchor.bind(this, 'LEC_LIST', 5, null)} className={educourse === 5 ? 'subTab_litem active' : 'subTab_litem'}><a className="subTab_link">사회</a></li>
                            <li onClick={this.activeAnchor.bind(this, 'LEC_LIST', 6, null)} className={educourse === 6 ? 'subTab_litem active' : 'subTab_litem'}><a className="subTab_link">역사</a></li>
                            <li onClick={this.activeAnchor.bind(this, 'LEC_LIST', 7, null)} className={educourse === 7 ? 'subTab_litem active' : 'subTab_litem'}><a className="subTab_link">과학</a></li>
                        </ul>
                    </div>
                    {/* image */}
                    {isSoobakcImage &&
                        <div>
                            <Link to={soobakcBannerLink}><img src={soobakcBannerPath}></img></Link>
                            <button className='helpTab_btn_soobakc btn_close' onClick={this.bannerNoUse}></button>
                            {/*
                            <div className='helpTab_btn_soobakc_nouse' onClick={this.bannerNoUse}>
                                <span><input type="checkbox" id="bannerNoUseCheck"/>&nbsp;더&nbsp;이상&nbsp;보지않기</span>
                            </div>
                            */}
                        </div>
                    }
                </div>
                }
                {type == 'LEC_LISTH' &&
                <div>
                    <span className="blind">고등</span>
                    <div className="subTab helpTab">
                        <ul className="subTab_list">
                            <li onClick={this.activeAnchor.bind(this, 'LEC_LISTH', 1, null)} className={educourse === 1 ? 'subTab_litem active' : 'subTab_litem'}><a className="subTab_link">전체</a></li>
                            <li onClick={this.activeAnchor.bind(this, 'LEC_LISTH', 2, null)} className={educourse === 2 ? 'subTab_litem active' : 'subTab_litem'}><a className="subTab_link">국어</a></li>
                            <li onClick={this.activeAnchor.bind(this, 'LEC_LISTH', 3, null)} className={educourse === 3 ? 'subTab_litem active' : 'subTab_litem'}><a className="subTab_link">영어</a></li>
                            <li onClick={this.activeAnchor.bind(this, 'LEC_LISTH', 4, null)} className={educourse === 4 ? 'subTab_litem active' : 'subTab_litem'}><a className="subTab_link">수학</a></li>
                            <li onClick={this.activeAnchor.bind(this, 'LEC_LISTH', 8, null)} className={educourse === 8 ? 'subTab_litem active' : 'subTab_litem'}><a className="subTab_link">사회/역사</a></li>
                            {/* 한국사 히든 처리
                            <li onClick={this.activeAnchor.bind(this, 'LEC_LISTH', 9, null)} className={educourse === 9 ? 'subTab_litem active' : 'subTab_litem'}><a className="subTab_link">한국사</a></li>
                            */}
                            <li onClick={this.activeAnchor.bind(this, 'LEC_LISTH', 7, null)} className={educourse === 7 ? 'subTab_litem active' : 'subTab_litem'}><a className="subTab_link">과학</a></li>
                        </ul>
                    </div>
                    {/* image */}
                    {isSoobakcImage &&
                        <div>
                            <Link to={soobakcBannerLink}><img src={soobakcBannerPath}></img></Link>
                            <button className='helpTab_btn_soobakc btn_close' onClick={this.bannerNoUse}></button>
                            {/*
                            <div className='helpTab_btn_soobakc_nouse' onClick={this.bannerNoUse}>
                                <span><input type="checkbox" id="bannerNoUseCheck"/>&nbsp;더&nbsp;이상&nbsp;보지않기</span>
                            </div>
                            */}
                        </div>
                    }
                </div>
                }
                {isTooltip &&
                    <div className={tooltipDivClassName} id="layerHelpPop">
                        <div className="layer_help_box">
                            <p className="layer_help_ment">온리원 추천강의는 '스타플레이어 앱'을 설치해야만 이용할 수 있습니다.</p>
                        </div>
                    </div>
                }
                <SoobakcListContainer soobakcList={soobakcList}
                                      type={type}
                                      grade={grade}
                                      sjcode={sjcode}
                                      isMoreBtn={isMoreBtn}
                                      addMoreList={this.addMoreList}
                                      changeSelectBox={this.changeSelectBox}
                                      isLoading={isLoading}></SoobakcListContainer>
            </PageTemplate>
        )
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        soobakcState : state.base.get('soobakcState'),
        myClassInfo: state.myclass.get('myClassInfo')
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(SoobakcPage));