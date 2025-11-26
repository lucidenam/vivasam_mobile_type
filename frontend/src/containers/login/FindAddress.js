import React, { Component } from 'react';
import { debounce } from 'lodash';
import { getAddress } from 'lib/api';
import * as common from 'lib/common';
import AddressList from 'components/login/AddressList';
import ContentLoading from 'components/common/ContentLoading';
import RenderLoading from 'components/common/RenderLoading';

class FindAddress extends Component {
  state = {
    keyword: '',
    currentPage: 1,
    totalCount: '',
    juso: '',
    visible: false,
    loading: false,
    contentLoading: false
  };

  constructor(props) {
    super(props);
    // Debounce
    this.handleSearchAddress = debounce(this.handleSearchAddress, 500);
  }

  componentDidMount() {
      this._isMounted = true;
  }

  componentWillUnmount() {
      this._isMounted = false;
  }

  handleChange = (e) => {
    if(this._isMounted){
        this.setState({
            [e.target.name]: e.target.value
        })
    }
  }

  handleClick = () => {
    if(this._isMounted){
        this.setState({
            loading : true,
            visible : false
        });
    }
    this.handleSearchAddress();
  }

  handleKeyPress = (e) => {
      if (e.key === 'Enter') {
          e.target.blur();
          this.handleClick();
      }
  }

  handleMoreButton = () => {
      if(this._isMounted){
          this.setState({
            contentLoading : true
          });
      }
      this.handleSearchAddress(Number(this.state.currentPage) + 1);
  }

  handleSelect = (zipNo, roadAddr) => {
    const { handleSetAddress } = this.props;
    handleSetAddress(zipNo, roadAddr);
  }

  shouldComponentUpdate(nexProps, nextState) {
    return this.state !== nextState;
  }

  handleSearchAddress = async (page = 1) => {
    try {
        if(this._isMounted && !this.state.contentLoading){
            this.setState({
                loading : true
            });
        }
        const response = await getAddress(this.state.keyword, page);
        const results = response.data.results;
        const juso = results.juso ? results.juso : [];

        const { errorCode, errorMessage, totalCount, countPerPage, currentPage } = response.data.results.common;
        let visible = false;

        if(Number(totalCount) > 0 && Math.ceil(Number(totalCount)/Number(countPerPage)) > Number(currentPage)) {
            visible = true;
        }

        if(this._isMounted){
          this.setState({
            totalCount: Number(totalCount),
            currentPage: Number(currentPage),
            juso : [...this.state.juso, ...juso],
            visible
          });
        }
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
  };

  render() {
    const {totalCount, juso, visible, loading, contentLoading} = this.state;
    let container;
    if(loading){
        container = <RenderLoading />;
    }else if(juso && juso.length === 0){
        container = (
            <div className="empty_result_wrap">
                <span className="integration_icon integration_icon_empty"></span>
                <p className="empty_info_text1"><span className="highlight">주소를 상세히 입력해 주시기 바랍니다.</span></p>
            </div>
        );
    }else{
        container = <AddressList jusos={juso} totalCount={totalCount} handleSelect={this.handleSelect}/>;
    }

    return (
      <section id="pop_content">
        <div className="search_form">
          <h2 className="blind">
          우편번호 검색
          </h2>
          <div className="search_section mb10">
            <input
              type="search"
              name="keyword"
              onChange={this.handleChange}
              onKeyPress={this.handleKeyPress}
              value={this.state.keyword}
              placeholder="도로명+건물번호, 건물명, 지번"
              className="input_sm" />
            <button
              type="button"
              onClick={this.handleClick}
              className="search_icon-type">
            <span className="blind">검색하기</span>
            </button>
          </div>
          <p>
          도로명, 건물명 또는 지번 중 편한 방법으로 검색하세요.
          </p>
          <p className="comment_ex">
          <span className="txt_ex">예)</span> 건물명 : 방배동 우성아파트<br />도로명 : 테헤란로 152<br />지역번 : 역삼동 737
          </p>
        </div>
        { container }
        { juso.length > 0 && contentLoading ?
            <ContentLoading />
            :
            <button
                type="button"
                onClick={this.handleMoreButton}
                style={{display: visible ? 'block' : 'none'}}
                className="btn_square_gray">더보기
            </button>
        }
      </section>
    );
  }
}

export default FindAddress;
