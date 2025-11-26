import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {debounce} from 'lodash';
import {request} from 'lib/api';
import * as common from 'lib/common';
import EventSchoolList from 'components/saemteo/EventSchoolList';
import * as baseActions from 'store/modules/base';
import ContentLoading from 'components/common/ContentLoading';
import RenderLoading from 'components/common/RenderLoading';

class SearchSchool extends Component {
    state = {
        schoolName: '',
        visible: false,
        schools: [],
        totalElements: '',
        links: {},
        loading: false,
        contentLoading: false,
    };

    constructor(props) {
      super(props);
      // Debounce
      this.handleSearchSchool = debounce(this.handleSearchSchool, 500);
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    shouldComponentUpdate(nexProps, nextState) {
        return this.state !== nextState;
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleClick = () => {
        if(this._isMounted){
            this.setState({
              loading : true,
              visible: false
            });
        }
        this.handleSearchSchool(true);
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
        this.handleSearchSchool(this.state.links.next);
    }

    handleSelect = (params) => {
        const { handleSetSchool } = this.props;
        handleSetSchool(params);
    }



    handleSearchSchool = async (reset) => {
        let page = this.state.page;
        if (reset) {
            page = 0;
        }
        if(this.state.schoolName === null || this.state.schoolName === '' || this.state.schoolName.length === 0)  {
            common.error("소속명을 입력해주세요.");
            this.setState({loading: false});
            return;
        }
        try {
            if(this._isMounted && !this.state.contentLoading){
                this.setState({ loading : true });
            }
            const response = await request({
                url: '/api/school/searchSchool',
                method: 'get',
                params: {
                    schoolName: this.state.schoolName,
                    page: page,
                    size: 20
                }
            });
            this.setState({
                page: (page + 1)
            });
            const totalElements = response.data.totalElements;
            const totalPages = response.data.totalPages;
            const number = response.data.number;
            let visible = false;

            if (totalElements > 0 && totalPages > number + 1) {
                visible = true;
            }
            this.setState({
                schools: [...this.state.schools, ...response.data.content],
                visible,
                totalElements
            });
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
        const {schools, visible, totalElements, loading, contentLoading} = this.state;
        let container;
        if(loading){
            container = <RenderLoading />;
        }else{
            container = <EventSchoolList schools={schools} totalElements={totalElements} handleSelect={this.handleSelect}/>
        }
        return (
            <Fragment>
                <div className="search_form">
                    <h2 className="info_tit">학교명</h2>
                    <div className="search_section mb10">
                        <input
                            type="search"
                            name="schoolName"
                            onChange={this.handleChange}
                            onKeyPress={this.handleKeyPress}
                            value={this.state.schoolName}
                            placeholder="학교명을 입력하세요"
                            className="input_sm" />
                        <button
                            type="button"
                            onClick={this.handleClick}
                            className="search_icon-type">
                            <span className="blind">검색하기</span>
                        </button>
                    </div>
                    <p>
                        재직학교가 검색이 안되실 경우 ‘직접입력’에서 학교주소를 입력하세요.
                    </p>
                </div>
                { container }
                { schools.length > 0 && contentLoading ?
                    <ContentLoading />
                    :
                    <button
                        type="button"
                        onClick={this.handleMoreButton}
                        style={{display: visible ? 'block' : 'none'}}
                        className="btn_square_gray positionFix">더보기
                    </button>
                }
            </Fragment>
        );
    }
}


class EventFindSchool extends Component {
    state = {
        
    }
    componentDidMount() {
        const { school } = this.props;
        if(school.directlyAgree){
            this.setState({
                tabName: 'input'
            });
        }
    }

    shouldComponentUpdate(nexProps, nextState) {
        return this.state !== nextState;
    }


    handleSetSchool = (params) => {
        const { handleSetSchool } = this.props;
        handleSetSchool(params);
    }

    render() {
        return (
            <section id="pop_content">
                <SearchSchool handleSetSchool={this.handleSetSchool}/>
            </section>
        );
    }
}

export default connect(
    (state) => ({
        school : state.join.get('school').toJS()
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(EventFindSchool);
