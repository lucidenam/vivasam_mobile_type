import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import * as fastMusicLibraryActions from 'store/modules/fastMusicLibrary';
import * as viewerActions from 'store/modules/viewer';
import {getContentTarget} from "components/common/utils";
import {getContentInfo} from "lib/api";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as libraryActions from 'store/modules/library';
import * as api from "lib/api";
import ThumbnailList from "components/common/ThumbnailList2";
import {debounce} from "lodash";
import {initializeGtag} from "store/modules/gtag";
import FastMusicLibraryCategoryContainer from "containers/livelesson/FastMusicLibraryCategoryContainer";
import ContentLoading from "components/common/ContentLoading";
import ContentSearch from "../common/ContentSearch";
import {metaData} from "store/modules/fastMusicLibrary";

const live_download = (param, e) => {
    var width   = 647;
    var height  = 450;

    var left    = (width)/2;
    var top    = (height)/2;
    var url = "https://www.vivasam.com/down/vivasamdown.do";

    var newWindow = window.open("/fountain_html/autoReload.html", "downloadwin", "left="+left+",top="+top+",width="+width+", height="+height+",scrollbars=no,toolbar=no,resizable=no,location=no");

    if (!newWindow) return false;

    var html = "";
    html += "<html><head></head><body><form id='formid' method='post' action='" + url +"'>";
    html += "<input type='hidden' name='files' value='ID,"+param + "'/>";
    html += "<input type='hidden' name='ufiles' value=''/>";

    html += "</form><script type='text/javascript'>document.getElementById(\"formid\").submit()</sc"+"ript></body></html>";

    newWindow.document.write(html);
    return newWindow;
}

class FastMusicLibraryListContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            subTabName : 'video',
            loading : false,
            contentLoading: false,
            visible : false,
            pageNo : 1,
            number : 0,
            category : "",
        }
        this.getMetaData = debounce(this.getMetaData, 200);
    }

    componentDidMount() {
        var title = this.props.subTabName == 'video' ? '동영상' : '이미지';
        const{libraryActions} = this.state;

        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/library/' + this.props.subTabName,
            'page_title': title + ' 자료｜비바샘'
        });
        this._isMounted = true;
        const {FastMusicLibraryActions , LibraryActions} = this.props;
        // FastMusicLibraryActions.defaultValues();
        LibraryActions.defaultValues();
        this.startFunction();
    }
    componentWillUnmount() {
        this._isMounted = false;
    }

    startFunction = async () => {
        this.getMetaCode(this.searchObject());
        this.getMetaData(this.searchObject(),1);
    }

    searchObject = (code,scode,name,sname,searchWord) => {
        const {word} = this.props;
        const {subTabName} = this.state
        const paramObject = {
            type: subTabName,
            code: code ? code : '',
            scode: scode ? scode : '',
            name: name ? name : '',
            sname: sname ? sname : '',
            word: (searchWord || searchWord === '') ? searchWord : word,
        }
        return paramObject;
    }


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
    }

    getMetaCode = async (paramObject) => {
        const {FastMusicLibraryActions, LibraryActions} = this.props;
        try {
            const response = await api.fastMusicLibraryCode(paramObject);

            LibraryActions.pushValues({type:"metaCode", object:response});
        } catch (e) {
            console.log(e);
        }
    }

    getMetaData = async (metaCode, pageno) => {
        const {pagesize, FastMusicLibraryActions, LibraryActions} = this.props;
        const {subTabName, loading,visible} = this.state;
        const {code} = metaCode;

        if(metaCode != null) {
            this.setState({
                category : code
            })
        }

        const paramObject = {
            code : 663,
            type: subTabName,
            type1: code,
            pageNo: pageno,
            pageSize: pagesize
        }

        this.setState({
            pageNo : pageno+1
        });

        try {
            if(this._isMounted && !this.state.contentLoading){
                this.setState({
                    loading : true
                });
            }
            const response = await api.fastMusicLibraryData(paramObject);

            let totalElements;
            let totalPages;
            let links;
            let metaData;
            let number = 0;
            this.setState({
                visible : false
            })

            if(!response.data.list){
                totalElements = 0;
                metaData = {};
                links = {};
            }else{
                metaData = response.data.list ? response.data.list : [];
                totalPages = Math.ceil(metaData[0].totalCnt / 20) + 1;
                number = Number(response.data.pageNo);
                links = {};

                if(number===1){
                    metaData = [...metaData.map(s => s)];
                }else{
                    metaData = [...this.props.metaData, ...metaData.map(s => s)];
                }

                if(metaData[0].totalCnt > 0 && totalPages > number+1) {
                    this.setState({
                        visible: true
                    });
                }
            }

            LibraryActions.pushValues({type:"metaData", object:metaData});
            LibraryActions.pushValues({type:"visible", object:visible});
            LibraryActions.pushValues({type:"links", object:links});
            LibraryActions.pushValues({type:"totalElements", object:totalElements});
        } catch (e) {
            console.log(e);
        }finally{
            if(this._isMounted){
                this.setState({
                    loading : false,
                    contentLoading : false
                });
            }
        }
    }

    handleDefaultSearch = (e) => {
        e.preventDefault();
        // const {FastMusicLibraryActions} = this.props;
        try{
            //검색은 전체검색만 허용
            this.getMetaCode(this.searchObject());
            this.getMetaData(this.searchObject(),1);
        } catch (e) {
            console.log(e);
        }
    }

    handleCategorySearch = (e) => {
        const{libraryActions} = this.state;
        e.preventDefault();

        this.getMetaCode(this.searchObject(e.target.dataset.code, e.target.dataset.scode,e.target.dataset.name,e.target.dataset.sname));
        this.getMetaData(this.searchObject(e.target.dataset.code, e.target.dataset.scode,e.target.dataset.name,e.target.dataset.sname,''),1);
    }

    handleMoreButtonSafe = (e) => {
        if(this._isMounted){
            this.setState({
                contentLoading : true
            });
        }
        this.handleMoreButton(e.target);
    }

    handleMoreButton = async(target) => {
        target.disabled = true;
        const {links,metaCode,word, metaData} = this.props;
        const {pageNo,category} = this.state;

        metaCode.code = category
        await this.getMetaData(metaCode, pageNo);
        target.disabled = false;
    }

    handleChange = (e) => {
        const {FastMusicLibraryActions, LibraryActions } = this.props;
        // FastMusicLibraryActions.pushValues({type:"word", object:e.target.value});
        LibraryActions.pushValues({type:"word", object:e.target.value});
    }

    handleSearchSafe = (e) => {
        this.handleSearch(e.target);
    }

    handleSearch = async(target) => {
        const {FastMusicLibraryActions} = this.props;
        try{
            target.disabled = true;
            //검색은 전체검색만 허용
            FastMusicLibraryActions.pushValues({type:"metaData", object:{}});
            FastMusicLibraryActions.pushValues({type:"visible", object:false});
            FastMusicLibraryActions.pushValues({type:"all", object:true});
            FastMusicLibraryActions.pushValues({type:"name", object:'전체'});

            this.getMetaCode(this.searchObject());
            await this.getMetaData(this.searchObject(),1);
            target.disabled = false;
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        const {doDownload, doEbook, tabCtrl, onIdx, onClickTab, metaCode, metaData, word, totalElements } = this.props;
        const { loading, contentLoading, subTabName, visible } = this.state;
        const metaCodeData = metaCode && metaCode.data && Array.isArray(metaCode.data.metaCode)
          ? metaCode.data.metaCode
          : [];

        return (
          <section className="live_teaching live_fml">
              <div className="live_teaching_top">
                  <p className="live_teaching_intro">
                      중고등 음악 수업에 탄탄한 기초가 될 수업자료를 <br/>자료집과 영상으로 만나보세요.
                  </p>
              </div>
              <div className="guideline"/>
              <div className="live_teaching_wrap">
                  <div className="btnTabWrap">
                      {
                          tabCtrl.map((item, idx) => {
                              return (
                                <button
                                  type="button"
                                  className={`btnTab${onIdx === idx ? ' on' : ''}`}
                                  key={`btnTab${idx}`}
                                  onClick={() => onClickTab(idx)}
                                >{item}</button>
                              )
                          })
                      }
                  </div>
                  <div className={`tabCont${onIdx === 0 ? ' on' : ''}`}>
                      <div className="live_download">
                          <div className="txt">
                              <div className="thumb">
                                  <img src="/images/tr/fml/book.png" alt="음악 활동 + 악보집"/>
                              </div>
                              <div className="btn_wrap">
                                  <button onClick={doEbook.bind(this, 'https://dn.vivasam.com/vs/ebook/통합_바로바로 뽑아쓰는 중고등음악 활동+악보집_ebook.book (1)/통합_바로바로 뽑아쓰는 중고등음악 활동+악보집_ebook.book/index.html')}
                                          className="live_download_link btn_ebook">
                                      E-book<span/>
                                  </button>
                                  <button onClick={doDownload.bind(this, 'CN030-456863')} className="live_download_link btn_down">
                                      자료집 다운로드<span/>
                                  </button>
                              </div>
                              <div className="info_txt">
                                  <h4>01. 개념·활동 영상</h4>
                                  <p>
                                      중고등 음악 교과서에 등장하는 기본 개념, 시대별 음악의 역사, 악기<br/>
                                      연주법을 소개하는 영상을 확인할 수 있어요!
                                  </p>
                                  <h4>02. 재미+실력 음악 활동지</h4>
                                  <p>
                                      뻔하고 딱딱한 음악 자료는 이제 그만!<br/>
                                      창의력을 키울 수 있는 38종의 활동지를 만나 보세요.
                                  </p>
                                  <h4>03. 다채로운 연주·합창곡</h4>
                                  <p>
                                      좋아하는 가수의 노래를 리코더, 칼림바 등<br/>
                                      다양한 악기로 연주해 볼까요?<br/>
                                      합창을 위한 악보도 함께 만나 보세요.
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className={`tabCont${onIdx === 1 ? ' on' : ''}`}>
                      <div className="live_fml_list">
                          <FastMusicLibraryCategoryContainer handleDefaultSearch={this.handleDefaultSearch} handleCategorySearch={this.handleCategorySearch} />
                          {/*<ContentSearch word={word} handleChange={this.handleChange} handleClick={this.handleSearchSafe} handleKeyPress={this.handleKeyPress}/>*/}
                          <ThumbnailList metaData={metaData} type={subTabName} totalElements={totalElements} handleViewer={this.handleViewer} loading={loading}/>

                          {metaData.length > 0 && contentLoading ?
                            <ContentLoading/>
                            :
                            <button
                              onClick={this.handleMoreButtonSafe}
                              className="btn_full_off"
                              style={{display: visible ? 'block' : 'none'}}
                            >
                                더보기
                            </button>
                          }
                      </div>
                  </div>
              </div>
          </section>
        );
    }
};

export default connect(
  (state) => ({
      data: state.library.get('data'),
      code: state.library.get('code'),
      scode: state.library.get('scode'),
      name: state.library.get('name'),
      sname: state.library.get('sname'),
      word: state.library.get('word'),
      metaCode: state.library.get('metaCode').toJS(),
      metaData: state.library.get('metaData').toJS(),
  }),
  (dispatch) => ({
      // BaseActions: bindActionCreators(baseActions, dispatch),
      FastMusicLibraryActions: bindActionCreators(fastMusicLibraryActions, dispatch),
      LibraryActions: bindActionCreators(libraryActions, dispatch),
      ViewerActions: bindActionCreators(viewerActions, dispatch),
  })
)(withRouter(FastMusicLibraryListContainer));