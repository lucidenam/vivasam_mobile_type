import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';

// import * as fastMusicLibraryActions from 'store/modules/fastMusicLibrary';
import * as libraryActions from 'store/modules/library';


class Category extends Component {

  render() {
    const {metaCode, categoryVisible, handleSearchBefore, handleCategory, handleCategorySearchBefore} = this.props;
    // console.log("metaCode!!!!" , metaCode)
    const metaCodeData = metaCode && metaCode.data && Array.isArray(metaCode.data.metaCode)
      ? metaCode.data.metaCode
      : [];

    if (Object.keys(metaCode).length === 0) return null;

    const category = metaCodeData.map((obj, index) => (
      // <div key={index} className="layer_menu_list" data-code={obj.code} onClick={handleCategorySearchBefore}>
      <div key={index} className="layer_menu_list">
        <a href="" onClick={handleCategorySearchBefore} className="layer_menu_titlink" data-code={obj.code}>{obj.name}</a>
      </div>
    ));

    return (
      <Fragment>
        <div className={categoryVisible ? 'dim on' : ''}></div>
        <div className="layer_menu" style={{display: categoryVisible ? 'block' : 'none'}}>
          <div className="layer_menu_scroll">
            <h2 className="layer_menu_title">
              <a href="" onClick={handleSearchBefore}>전체보기</a>
            </h2>
            <div className="layer_menu_content">
              {category}
            </div>
            <a href="" onClick={handleCategory} className="detail_search_close">
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

class FastMusicLibraryCategoryContainer extends Component {

  handleCategory = (e) => {
    e.preventDefault();
    const {categoryVisible, LibraryActions} = this.props;
    LibraryActions.pushValues({type: "word", object: ''});
    LibraryActions.pushValues({type: "visible", object: false});
    LibraryActions.pushValues({type: "categoryVisible", object: !categoryVisible});

  }

  handleSearchBefore = (e) => {
    e.preventDefault();
    const {LibraryActions} = this.props;
    LibraryActions.pushValues({type: "metaData", object: {}});
    LibraryActions.pushValues({type: "name", object: '전체'});
    LibraryActions.pushValues({type: "word", object: ''});
    LibraryActions.pushValues({type: "all", object: true});
    LibraryActions.pushValues({type: "categoryVisible", object: false});
    const {handleDefaultSearch} = this.props;
    handleDefaultSearch(e);
  }

  handleCategorySearchBefore = (e) => {

    e.preventDefault();
    const {LibraryActions} = this.props;
    LibraryActions.pushValues({type: "metaData", object: {}});
    LibraryActions.pushValues({type: "code", object: e.target.dataset.code});
    LibraryActions.pushValues({type: "scode", object: e.target.dataset.scode});
    LibraryActions.pushValues({type: "name", object: e.target.dataset.name});
    LibraryActions.pushValues({type: "sname", object: e.target.dataset.sname});
    LibraryActions.pushValues({type: "count", object: e.target.dataset.count});
    LibraryActions.pushValues({type: "word", object: ''});
    LibraryActions.pushValues({type: "searchWord", object: ''});
    LibraryActions.pushValues({type: "all", object: false});
    LibraryActions.pushValues({type: "visible", object: false});
    LibraryActions.pushValues({type: "categoryVisible", object: false});
    const {handleCategorySearch} = this.props;
    handleCategorySearch(e);
  }

  render() {
    const {code, all, name, sname, metaCode, categoryVisible} = this.props;
    let container;

    let codeName = {
      '663001': '시대별 음악의 역사',
      '663002': '개념 바로 알기',
      '663003': '악기 연주법',
      '663004': '국악'
    };

    // code가 있으면 sname 변경
    codeName = codeName[code] || sname;
    if (!all) {
      // container = <span><span className="cate_dept {codeName}" /> <span className="cate_here">{codeName}</span> <span className="cate_num">({count})</span></span>;
      container = <span> <span className="cate_here">{codeName}</span> </span>;
    } else {
      <span>&nbsp;</span>
    }
    return (
      <Fragment>
        <Category metaCode={metaCode} categoryVisible={categoryVisible} handleSearchBefore={this.handleSearchBefore}
                  handleCategory={this.handleCategory} handleCategorySearchBefore={this.handleCategorySearchBefore}/>
        <div className="categori">
          <a href="" onClick={this.handleCategory} className="all_cate">
            <span className="blind">
                분류 전체 보기
            </span>
          </a>
          <div className="cate_view">
            {name ? name : <span>&nbsp;</span>} {container}
          </div>
        </div>
      </Fragment>
    );
  }
}

export default connect(
  (state) => ({
    all: state.library.get('all'),
    code: state.library.get('code'),
    scode: state.library.get('scode'),
    name: state.library.get('name'),
    sname: state.library.get('sname'),
    metaCode: state.library.get('metaCode').toJS(),
    categoryVisible: state.library.get('categoryVisible'),
    count: state.library.get('count')
  }),
  (dispatch) => ({
    LibraryActions: bindActionCreators(libraryActions, dispatch)

  })
)(withRouter(FastMusicLibraryCategoryContainer));
