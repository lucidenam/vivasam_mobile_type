import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { debounce } from 'lodash';
import * as libraryActions from 'store/modules/library';
import * as viewerActions from 'store/modules/viewer';
import * as baseActions from 'store/modules/base';
import * as api from 'lib/api';
import * as common from 'lib/common';
import LibraryCategoryContainer from 'containers/library/LibraryCategoryContainer';
import ContentSearch from 'components/common/ContentSearch';
import ThumbnailList from 'components/common/ThumbnailList';
import ContentLoading from 'components/common/ContentLoading';
import {getContentTarget} from "../../components/common/utils";
import {getContentInfo} from "lib/api";
import {initializeGtag} from "../../store/modules/gtag";

class LibraryListContainer extends Component {

    state = {
        isChange : '',
        loading : false,
        contentLoading: false,
        searchType: 'image',
        word : '',
        searchCode : '',
        searchSCode : '',
        searchName : '',
        searchSName : ''
    }

    constructor(props) {
      super(props);
      // Debounce
      this.handleMoreButton = debounce(this.handleMoreButton, 200);
      this.handleSearch = debounce(this.handleSearch, 200);
      this.getMetaData = debounce(this.getMetaData, 200);
    }

    componentDidMount() {
        var title = this.props.subTabName == 'video' ? '동영상' : '이미지';
        const maxScrollLeft = document.body.scrollWidth;
        document.querySelector('.subTab_list').scrollLeft = maxScrollLeft*2;
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/library/' + this.props.subTabName,
            'page_title': title + ' 자료｜비바샘'
        });
       this._isMounted = true;
       const {LibraryActions} = this.props;
       LibraryActions.defaultValues();
       this.startFunction();
    }
    componentWillUnmount() {
       this._isMounted = false;
    }

    shouldComponentUpdate(nexProps, nextState) {
        return (this.state !== nextState || this.props.word !== nexProps.word);
    }

    searchObject = (code,scode,name,sname,searchWord) => {
        const {subTabName, word} = this.props;
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

    searchTypeObject = (code,scode,name,sname,searchWord, type) => {
        const {subTabName, word} = this.props;
        const paramObject = {
            type: type,
            code: code ? code : '',
            scode: scode ? scode : '',
            name: name ? name : '',
            sname: sname ? sname : '',
            word: (searchWord || searchWord === '') ? searchWord : word,
        }
        return paramObject;
    }

    tabChange = () => {
        const {isChange} = this.props;
        if(this._isMounted){
            this.setState({
                isChange: !isChange
            })
        }
    }

    startFunction = async () => {
        await this.tabChange();
        await this.getMetaCode(this.searchObject());
        await this.getMetaData(this.searchObject(),1);
    }

    getMetaCode = async (paramObject) => {
        const {LibraryActions} = this.props;
        try {
            const response = await api.metaCode(paramObject);
            LibraryActions.pushValues({type:"metaCode", object:response.data});
        } catch (e) {
            console.log(e);
        }
    }

    getMetaData = async (metaCode, pageno) => {
        const { pagesize, LibraryActions} = this.props;
        const {code,scode,name,sname,word,type} = metaCode;
        const {searchType} = this.state;

        const paramObject = {
            type: searchType,
            type1: code,
            type2: scode,
            word: word,
            pageno: pageno,
            pagesize: pagesize
        }
        try {
            if(this._isMounted && !this.state.contentLoading){
              this.setState({
                loading : true
              });
            }
            const response = await api.metaData(paramObject);
            let totalElements;
            let totalPages;
            let number;
            let visible = false;
            let links;
            let metaData;
            if(!response.data){
                totalElements = 0;
                metaData = {};
                links = {};
            }else{
                totalElements = response.data.page.totalElements;
                totalPages = response.data.page.totalPages;
                number = response.data.page.number;
                links = common.getLinkInfo(response.data.links);
                metaData = response.data.content ? response.data.content : [];
                if(number===0){
                    metaData = [...metaData.map(s => s)];
                }else{
                    metaData = [...this.props.metaData, ...metaData.map(s => s)];
                }
                if(totalElements > 0 && totalPages > number+1) {
                    visible = true;
                }
            }
            LibraryActions.pushValues({type:"metaData", object:metaData});
            LibraryActions.pushValues({type:"visible", object:visible});
            LibraryActions.pushValues({type:"links", object:links});
            LibraryActions.pushValues({type:"totalElements", object:totalElements});
            this.tabChange();
        } catch (e) {
            console.log(e);
        } finally {
            if (this._isMounted) {
                this.setState({
                    loading: false,
                    contentLoading: false,
                    searchCode: code,
                    searchSCode: scode,
                    searchName : name,
                    searchSName : sname
                });
            }
        }
    }

    getMetaTypeData = async (metaCode, pageno) => {
        const {pagesize, LibraryActions, code, name,scode,sname} = this.props;
        const {type} = metaCode;
        const {word} = this.state;
        const paramObject = {
            type: type,
            type1: code,
            type2: scode,
            word: word,
            pageno: pageno,
            pagesize: pagesize
        }
        try {
            if(this._isMounted && !this.state.contentLoading){
                this.setState({
                    loading : true
                });
            }
            const response = await api.metaData(paramObject);
            let totalElements;
            let totalPages;
            let number;
            let visible = false;
            let links;
            let metaData;
            if(!response.data){
                totalElements = 0;
                metaData = {};
                links = {};
            }else{
                totalElements = response.data.page.totalElements;
                totalPages = response.data.page.totalPages;
                number = response.data.page.number;
                links = common.getLinkInfo(response.data.links);
                metaData = response.data.content ? response.data.content : [];
                if(number===0){
                    metaData = [...metaData.map(s => s)];
                }else{
                    metaData = [...this.props.metaData, ...metaData.map(s => s)];
                }
                if(totalElements > 0 && totalPages > number+1) {
                    visible = true;
                }
            }
            this.setState({
                searchType:type
            })
            LibraryActions.pushValues({type:"metaData", object:metaData});
            LibraryActions.pushValues({type:"visible", object:visible});
            LibraryActions.pushValues({type:"links", object:links});
            LibraryActions.pushValues({type:"totalElements", object:totalElements});
            this.tabChange();
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

    handleChange = (e) => {
        const {LibraryActions} = this.props;
        LibraryActions.pushValues({type:"word", object:e.target.value});
        LibraryActions.pushValues({type:"searchType", object:e.target.id});
        this.setState({
            searchType: e.target.id,
            word: e.target.value
        })
    }

    handleSearchSafe = (e) => {
        this.handleSearch(e.target);
    }

    handleSearch = async(target) => {
        const {LibraryActions} = this.props;
        const {searchCode, searchSCode, searchName, searchSName, searchWord} = this.state;
        try{
            target.disabled = true;
            //검색은 전체검색만 허용
//            LibraryActions.pushValues({type:"metaData", object:{}});
//            LibraryActions.pushValues({type:"visible", object:false});
//            LibraryActions.pushValues({type:"all", object:true});
//            LibraryActions.pushValues({type:"name", object:'전체'});

//            this.getMetaCode(this.searchObject());
//            await this.getMetaData(this.searchObject(),1);
            this.getMetaCode(this.searchObject(searchCode, searchSCode,searchName,searchSName));
            this.getMetaData(this.searchObject(searchCode, searchSCode,searchName,searchSName,searchWord),1);
            target.disabled = false;
        } catch (e) {
            console.log(e);
        }
    }

    handleDefaultSearch = (e) => {
        e.preventDefault();
        const {LibraryActions} = this.props;
        try{
            //검색은 전체검색만 허용
            this.getMetaCode(this.searchObject());
            this.getMetaData(this.searchObject(),1);
        } catch (e) {
            console.log(e);
        }
    }

    handleTypeSearch = (e) => {
        e.preventDefault();
        this.getMetaCode(this.searchTypeObject(e.target.dataset.code, e.target.dataset.scode,e.target.dataset.name,e.target.dataset.sname, e.target.value));
        this.getMetaTypeData(this.searchTypeObject(e.target.dataset.code, e.target.dataset.scode,e.target.dataset.name,e.target.dataset.sname,'',e.target.value),1);
    }

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
            this.handleSearchSafe(e);
        }
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
        const {links,metaCode,word} = this.props;
        let reg = /&page=()\w+/g;
        let pageno = reg.exec(links.next);
        pageno = pageno[0].split('=');
        if(pageno[1]){
            pageno =  parseInt(pageno[1])+1
            let metaObj = metaCode;
            metaObj.word = word;
            await this.getMetaData(metaObj, pageno);
            target.disabled = false;
        }
    }

    handleCategorySearch = (e) => {
        e.preventDefault();
        this.setState({
            searchType:'image'
        })
        this.getMetaCode(this.searchObject(e.target.dataset.code, e.target.dataset.scode,e.target.dataset.name,e.target.dataset.sname));
        this.getMetaData(this.searchObject(e.target.dataset.code, e.target.dataset.scode,e.target.dataset.name,e.target.dataset.sname,''),1);
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

    render() {
        const { subTabName, metaCode, metaData, word, visible, totalElements } = this.props;
        const { loading, contentLoading,searchType } = this.state;
       
        return (
            <Fragment>
                <LibraryCategoryContainer handleDefaultSearch={this.handleDefaultSearch} handleCategorySearch={this.handleCategorySearch}/>
                <ContentSearch word={word} handleChange={this.handleChange} handleClick={this.handleSearchSafe} handleKeyPress={this.handleKeyPress} handleTypeSearch={this.handleTypeSearch} searchType={searchType}/>
                <ThumbnailList metaData={metaData} type={subTabName} totalElements={totalElements} handleViewer={this.handleViewer} loading={loading}/>
                { metaData.length > 0 && contentLoading ?
                    <ContentLoading />
                    :
                    <button
                        onClick={this.handleMoreButtonSafe}
                        className="btn_full_off"
                        style={{display: visible ? 'block' : 'none'}}
                        >
                        더보기
                    </button>
                }
            </Fragment>
        );
    }
}

export default connect(
    (state) => ({
        pagesize : state.library.get('pagesize'),
        code : state.library.get('code'),
        scode : state.library.get('scode'),
        name : state.library.get('name'),
        sname : state.library.get('sname'),
        word : state.library.get('word'),
        metaCode : state.library.get('metaCode').toJS(),
        metaData : state.library.get('metaData').toJS(),
        visible : state.library.get('visible'),
        links : state.library.get('links').toJS(),
        totalElements : state.library.get('totalElements')
    }),
    (dispatch) => ({
        LibraryActions: bindActionCreators(libraryActions, dispatch),
        ViewerActions: bindActionCreators(viewerActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(LibraryListContainer));
