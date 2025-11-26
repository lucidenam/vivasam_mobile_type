import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as libraryActions from 'store/modules/library';
import * as api from 'lib/api';
import ContentLoading from 'components/common/ContentLoading';

class SubCategory extends Component {
    render() {
        const {subMetaCode, handleCategory, handleCategorySearchBefore} = this.props;
        return (
            subMetaCode.codeSub.map((obj,index) => (
                <a
                    key={index}
                    href=""
                    data-code={obj.code}
                    data-scode={obj.scode}
                    data-name={subMetaCode.name}
                    data-sname={obj.sname}
                    data-count={obj.stotalCnt}
                    onClick={handleCategorySearchBefore}
                    className="layer_menu_link"
                    >
                    {obj.sname}
                </a>
            ))
        )
    }
}

class Category extends Component {

    handleActiveClick = (e) => {
        e.preventDefault();
        var arr = document.getElementsByClassName("layer_menu_list");
        arr = Array.from(arr)
        arr.map((obj) => obj.className='layer_menu_list')
        var arr2 = document.getElementsByClassName("layer_menu_titlink");
        arr2 = Array.from(arr2)
        arr2.map((obj) => obj.className='layer_menu_titlink')
        e.target.className = 'layer_menu_titlink active'
        e.target.parentElement.className = 'layer_menu_list active'
    }

    render() {
        const {metaCode, categoryVisible, handleSearchBefore, handleCategory, handleCategorySearchBefore} = this.props;
        if(Object.keys(metaCode).length === 0) return null;

        const category = metaCode.metaCode ? metaCode.metaCode.map((obj,index) => (
            obj.name !== '전체 카테고리' ?
                <div key={index} className="layer_menu_list">
                    <a
                        href=""
                        onClick={this.handleActiveClick}
                        className="layer_menu_titlink">
                        {obj.name}
                    </a>
                    <div className="layer_menu_tit">
                        <SubCategory subMetaCode={obj} handleCategory={handleCategory} handleCategorySearchBefore={handleCategorySearchBefore}/>
                    </div>
                </div> :
                <div key={index} className="layer_menu_list">
                    <a
                        data-code=""
                        data-scode=""
                        data-name="전체 카테고리"
                        data-sname=""
                        data-count=""
                        onClick={handleCategorySearchBefore}
                        className="layer_menu_titlink"
                    >{obj.name}
                    </a>
                </div>
        )) : '';

        return (
            <Fragment>
            <div className={categoryVisible ? 'dim on' : ''}></div>
            <div className="layer_menu" style={{display: categoryVisible ? 'block' : 'none'}}>
                <div className="layer_menu_scroll">
                    <h2 className="layer_menu_title">
                        <a
                            href=""
                            onClick={handleSearchBefore}
                            >카테고리</a>
                    </h2>
                    <div className="layer_menu_content">
                        {category}
                    </div>
                    <a
                        href=""
                        onClick={handleCategory}
                        className="detail_search_close">
                        <span className="blind">
                            단원 전체보기 레이어 닫기
                        </span>
                    </a>
                </div>
            </div>
            </Fragment>
        )
    }
}

class LibraryCategoryContainer extends Component {

    handleCategory = (e) => {
        e.preventDefault();
        const {categoryVisible, LibraryActions} = this.props;
        LibraryActions.pushValues({type:"word", object:''});
        LibraryActions.pushValues({type:"visible", object:false});
        LibraryActions.pushValues({type:"categoryVisible", object:!categoryVisible});
    }

    handleSearchBefore = (e) => {
        e.preventDefault();
        const {LibraryActions} = this.props;
        LibraryActions.pushValues({type:"metaData", object:{}});
        LibraryActions.pushValues({type:"name", object:'전체'});
        LibraryActions.pushValues({type:"word", object:''});
        LibraryActions.pushValues({type:"all", object:true});
        LibraryActions.pushValues({type:"categoryVisible", object:false});
        const { handleDefaultSearch } = this.props;
        handleDefaultSearch(e);
    }

    handleCategorySearchBefore = (e) => {
        e.preventDefault();
        const {LibraryActions} = this.props;
        LibraryActions.pushValues({type:"metaData", object:{}});
        LibraryActions.pushValues({type:"code", object:e.target.dataset.code});
        LibraryActions.pushValues({type:"scode", object:e.target.dataset.scode});
        LibraryActions.pushValues({type:"name", object:e.target.dataset.name});
        LibraryActions.pushValues({type:"sname", object:e.target.dataset.sname});
        LibraryActions.pushValues({type:"count", object:e.target.dataset.count});
        LibraryActions.pushValues({type:"word", object:''});
        LibraryActions.pushValues({type:"searchWord", object:''});
        LibraryActions.pushValues({type:"all", object:false});
        LibraryActions.pushValues({type:"visible", object:false});
        LibraryActions.pushValues({type:"categoryVisible", object:false});
        const { handleCategorySearch } = this.props;

        if (e.target.dataset.name === '전체 카테고리' && e.target.dataset.code === '') {
            let arr = document.getElementsByClassName("layer_menu_list");
            arr = Array.from(arr)
            arr.map((obj) => obj.className='layer_menu_list')
            let arr2 = document.getElementsByClassName("layer_menu_titlink");
            arr2 = Array.from(arr2)
            arr2.map((obj) => obj.className='layer_menu_titlink')
            e.target.className = 'layer_menu_titlink active'
            e.target.parentElement.className = 'layer_menu_list active'
        }

        handleCategorySearch(e);
    }

    render() {
        const { all, name, sname, count, metaCode, categoryVisible } = this.props;
        let container;
        let names = name;
        if (name === '전체') names = '전체 카테고리';

        if (name === '전체 카테고리') {
            <span>&nbsp;</span>
        } else if(!all){
            container = <span><span className="cate_dept" /> <span className="cate_here">{sname}</span></span>;
        } else{
            <span>&nbsp;</span>
        }
        return (
            <Fragment>
                <Category metaCode={metaCode} categoryVisible={categoryVisible} handleSearchBefore={this.handleSearchBefore} handleCategory={this.handleCategory} handleCategorySearchBefore={this.handleCategorySearchBefore}/>
                <div className="categori">
                    <a
                        href=""
                        onClick={this.handleCategory}
                        className="all_cate">
                        <span className="blind">
                            분류 전체 보기
                        </span>
                    </a>
                    <div className="cate_view">
                        {names ? names : <span>&nbsp;</span>} {container}
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default connect(
    (state) => ({
        all : state.library.get('all'),
        code : state.library.get('code'),
        scode : state.library.get('scode'),
        name : state.library.get('name'),
        sname : state.library.get('sname'),
        metaCode : state.library.get('metaCode').toJS(),
        categoryVisible : state.library.get('categoryVisible'),
        count : state.library.get('count')
    }),
    (dispatch) => ({
        LibraryActions: bindActionCreators(libraryActions, dispatch)
    })
)(withRouter(LibraryCategoryContainer));
