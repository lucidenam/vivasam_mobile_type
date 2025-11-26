import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as myclassActions from 'store/modules/myclass';
import * as viewerActions from 'store/modules/viewer';
import { MyClassInfo, MyTextBook, RecommendSubjectList, MyMaterialViewList } from 'components/educourse';
import Slider from "react-slick";
import { getContentInfo } from 'lib/api';
import {DOWNLOAD_IMAGE_PATH} from "../../constants";
import {initializeGtag} from "../../store/modules/gtag";
import {onClickCallLinkingOpenUrl} from "../../lib/OpenLinkUtils";

class MyClassContainer extends Component {

    getMyTextBookInfoList = async () => {
        const { MyclassActions } = this.props;

        try {
            const response = await MyclassActions.myTextBooks();
        } catch (e) {
            console.log(e);
        }
    }

    getRecommendSubjectList  = async () => {
        const { MyclassActions } = this.props;
        try {
            await MyclassActions.myRecommendSubjects();
        } catch (e) {
            console.log(e);
        }
    }

    getMyMaterialViewList  = async () => {
        const { MyclassActions } = this.props;
        try {
            await MyclassActions.myMaterialViews();
        } catch (e) {
            console.log(e);
        }
    }

    handleViewer = async (id,gubun,title) => {
        const { ViewerActions } = this.props;
        try {
            const response = await getContentInfo(id);
            let { contentId, contentGubun, filePath, saveFileName, fileType, subject, summary, copyrightName, siteUrl } = response.data;
            let type;
            if(fileType === 'FT201' || fileType === 'FT204'){
                type = 'video';
            }else if(fileType === 'FT202'){
                type = 'audio';
            }else if(fileType === 'FT203'){
                type = 'image';
            }else if(saveFileName && (saveFileName.includes('.zip') || saveFileName.includes('.ZIP'))){
                type = 'etc';
            }else if(fileType === 'FT205' ){
                type = 'document';
            }else if(gubun === 'CN070' || contentGubun === 'CN070'){
                type = 'smart';
                contentId = id;
                contentGubun = gubun;
                subject = title;
            }else{
                type = 'etc';
            }
            //vbook 1이면 외부 URL로 튕김
            let vbook = siteUrl && siteUrl.includes('vbook') ? 1 : 0;

            const target = {
                dataset: {
                    type: type,
                    src: DOWNLOAD_IMAGE_PATH + filePath + saveFileName,
                    name: subject,
                    id: contentId,
                    gubun: contentGubun,
                    summary: summary,
                    sourcename: copyrightName,
                    vbook: vbook,
                    siteurl: siteUrl
                }
            };

            // vbook 콘텐츠라면 외부 브라우저로 열기
            // if (target.dataset.vbook === 1) {
            //     onClickCallLinkingOpenUrl(target.dataset.siteurl);
            //     return;
            // }

            ViewerActions.openViewer({title:target.dataset.name, target:target});
        }catch(e) {
            console.log(e);
        }
    }

    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/educourse/myclass',
            'page_title': '내 교과서 홈｜비바샘'
        });
        const {logged, history, location} = this.props;

        if(logged) {
            this.getMyTextBookInfoList();
            this.getRecommendSubjectList();
            this.getMyMaterialViewList();
        }else {
            history.replace({
                pathname: '/login',
                state: { prevPath: location.pathname }
            });
        }
    }

    render() {
        const { logged, myTextBooks, myClassInfo, recommentSubjectInfo } = this.props;
        if(!logged || !myClassInfo || !myClassInfo.memberId) {
            return false;
        }
        const { subjectInfo, recommendSubjects } = recommentSubjectInfo;
        const { schoolLvlCd, subjectCd } = subjectInfo;
        let schoolLvlNm = "";
        let subjectNm = "";
        let marker2Clazz = "";
        switch (schoolLvlCd) {
            case "ES" :
                schoolLvlNm = "초등";
                marker2Clazz = "myclass_marker_type2_2";
                break;
            case "MS" :
                schoolLvlNm = "중학";
                marker2Clazz = "myclass_marker_type2";
                switch (subjectCd) {
                    case "SC301" : subjectNm += "국어"; break;
                    case "SC302" : subjectNm += "영어"; break;
                    case "SC303" : subjectNm += "수학"; break;
                    case "SC304" : subjectNm += "사회"; break;
                    case "SC307" : subjectNm += "역사"; break;
                    case "SC305" : subjectNm += "과학"; break;
                    case "SC324" : subjectNm += "도덕"; break;
                    case "SC306" : subjectNm += "한문"; break;
                    case "SC310" : subjectNm += "기술·가정"; break;
                    case "SC345" : subjectNm += "정보"; break;
                    case "SC333" : subjectNm += "음악"; break;
                    case "SC334" : subjectNm += "미술"; break;
                    case "SC335" : subjectNm += "체육"; break;
                    case "SC332" : subjectNm += "진로와 직업"; break;
                    default : ;
                }
                break;
            case "HS" :
                schoolLvlNm = "고등";
                marker2Clazz = "myclass_marker_type2_3";
                switch (subjectCd) {
                    case "SC311": subjectNm += "국어"; break;
                    case "SC314": subjectNm += "영어"; break;
                    case "SC321": subjectNm += "수학"; break;
                    case "SC315": subjectNm += "사회"; break;
                    case "SC323": subjectNm += "역사"; break;
                    case "SC322": subjectNm += "과학"; break;
                    case "SC318": subjectNm += "도덕"; break;
                    case "SC346": subjectNm += "한문"; break;
                    case "SC347": subjectNm += "기술·가정"; break;
                    case "SC348": subjectNm += "정보"; break;
                    case "SC349": subjectNm += "음악"; break;
                    case "SC350": subjectNm += "미술"; break;
                    case "SC351": subjectNm += "체육"; break;
                    case "SC352": subjectNm += "진로와 직업"; break;
                    default : ;
                }
                break;
            default : ;
        }

        const settings = {
            dots: true,
            infinite: false,
            speed: 500,
            slidesToShow: 3,
            slidesToScroll: 3,
            arrows: false,
            className: 'myBook_list'
        };

        const myTextBookList = myTextBooks.map(book => {
            return <MyTextBook {...book} key={book.textbookCd}/>
        });

        return (
            <section className="class myclass">
                <h2 className="blind">내 교과서</h2>

                <div className="myclass_top">
                    <div className="myclass_top_box">
                        <MyClassInfo {...myClassInfo}/>
                        <div className="myclass_slide">
                            <h2 className="myclass_title_type1">
                                내 교과서<span className="myclass_marker">({myTextBooks.length})</span>
                            </h2>
                            {/*<MyTextBookInfoSlide myBooks={myTextBooks}/>*/}
                            <div className="myBook_wrap myclass_mybook">
                                <Slider {...settings} >
                                    {myTextBookList}
                                </Slider>
                            </div>
                        </div>
                    </div>
                </div>
                {/*<div className="myclass_readme">
                    <h2 className="myclass_title_type3">최근 열람자료</h2>
                    <MyMaterialViewList myMaterialViews={myMaterialViews} handleViewer={this.handleViewer}/>
                </div>*/}
            </section>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        myClassInfo: state.myclass.get('myClassInfo'),
        myTextBooks: state.myclass.get('myTextBooks'),
        recommentSubjectInfo: state.myclass.get('recommentSubjectInfo').toJS(),
        myMaterialViews: state.myclass.get('myMaterialViews'),
    }),
    (dispatch) => ({
        MyclassActions: bindActionCreators(myclassActions, dispatch),
        ViewerActions: bindActionCreators(viewerActions, dispatch)
    })
)(withRouter(MyClassContainer));
