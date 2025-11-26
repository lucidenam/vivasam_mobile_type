import React, {Component, Fragment} from 'react';
import { LectureDataDetailList, PeriodDataList } from 'containers/educourse';
import { getUnitTypeList, getAllMenuList } from 'lib/api';
import { connect } from 'react-redux';
import {bindActionCreators} from "redux";
import * as baseActions from 'store/modules/base';
import {withRouter} from "react-router-dom";

class Category extends Component {
    state = {
        activeClass1Cd: ''
    }

    handleGoMenu = (class1Cd, class1Nm, class2Cd, class2Nm) => {
        const {handleChangeClass, handleAllMenu} = this.props;
        handleAllMenu();
        handleChangeClass(class1Cd, class1Nm, class2Cd, class2Nm);
    }

    handleClickMenu = (hasChild, class1Cd, class1Nm) => {
        if(hasChild) {
            this.setState({
                activeClass1Cd: class1Cd
            });
        }else {
            this.handleGoMenu(class1Cd, class1Nm, null, null);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState !== this.state;
    }

    render() {
        const { list, handleAllMenu } = this.props;
        const { activeClass1Cd } = this.state;
        let textbookCd = "";
        if (list.length > 0) {
            textbookCd = list[0].textbookCd;
        }
        return (
            <Fragment>
                <div className="dim on"></div>
                <div className="layer_menu">
                    <div className="layer_menu_scroll">
                        <h2 className="layer_menu_title">단원 전체보기</h2>

                        <div className="layer_menu_content">
                            {
                                list.map(menu => {
                                    const class1Nm = menu.unitNum+ ". "+menu.class1Nm;
                                    const { subMenuList } = menu;
                                    const hasChild = (subMenuList.length > 0 && textbookCd !== '106574');
                                    return (
                                        <div
                                            key={menu.class1Cd}
                                            className={"layer_menu_list"+(activeClass1Cd === menu.class1Cd ? " active" : "")}
                                        >
                                            <a
                                                style={{backgroundUrl:null}}
                                                onClick={() => {
                                                    this.handleClickMenu(hasChild, menu.class1Cd, class1Nm);
                                                }}
                                                className={"layer_menu_titlink"+(activeClass1Cd === menu.class1Cd ? " active" : "")+(textbookCd === '106574' ? " none" : "")}
                                            >{class1Nm}</a>
                                            {
                                                hasChild && (
                                                    <div className="layer_menu_tit">
                                                        <a
                                                            onClick={() => {
                                                                this.handleGoMenu(menu.class1Cd, class1Nm, null, null);
                                                            }}
                                                            className="layer_menu_link totalview"
                                                        >전체보기</a>
                                                        {
                                                            subMenuList.map(subMenu => {
                                                                const class2Nm = subMenu.orderNo+ ". "+subMenu.class2Nm;
                                                                return (
                                                                    <a
                                                                        key={subMenu.class2Cd}
                                                                        onClick={() => {
                                                                           this.handleGoMenu(menu.class1Cd, class1Nm, subMenu.class2Cd, class2Nm);
                                                                        }}
                                                                       className="layer_menu_link">{class2Nm}</a>
                                                                );
                                                            })
                                                        }
                                                    </div>
                                                )
                                            }
                                        </div>
                                    );
                                })
                            }
                        </div>
                        <a
                            onClick={handleAllMenu}
                            className="detail_search_close">
                            <span className="blind">단원 전체보기 레이어 닫기</span>
                        </a>
                    </div>
                </div>
            </Fragment>
        );
    }
}

class LectureDataDetail extends Component {
    state = {
        class1Cd: '',
        class1Nm: '',
        class2Cd: '',
        class2Nm: '',
        types: [],
        type1Cd: '',
        type2Cd: '',
        visible: false,
        allMenus: []
    }

    handleClickTab = (type1Cd) => {
        this.setState({
            type1Cd
        });
    }

    handleAllMenu = (e) => {
        const { visible } = this.state;
        this.setState({
            visible: !visible
        });
    }

    handleChangeClass = (class1Cd, class1Nm, class2Cd, class2Nm) => {
        this.setState({
            class1Cd,
            class1Nm,
            class2Cd,
            class2Nm
        });
        this.getUnitTypeList(class1Cd, class2Cd);
    }

    getAllMenuList = async () => {
        const { textbookCd } = this.props;
        const reponse = await getAllMenuList(textbookCd);

        if(this._isMounted) {
            this.setState({
                allMenus: reponse.data
            });
        }
    }

    getUnitTypeList = async (class1Cd, class2Cd) => {
        const { BaseActions } = this.props;
        try {
            BaseActions.openLoading({loadingType:"1"});
            const response = await getUnitTypeList(class2Cd?class2Cd:class1Cd, null);
            if(this._isMounted) {
                this.setState({
                    types: response.data
                });

                if(response.data.length > 0) {
                    this.setState({
                        type1Cd: response.data[0].type1Cd
                    });
                }
            }
        }catch(e) {
            console.log(e);
        }finally {
            BaseActions.closeLoading();
        }
    }

    /*shouldComponentUpdate(nextProps, nextState) {
        if(nextProps != this.props) {
            const { class1Cd, class2Cd } = nextProps;
            this.getUnitTypeList(class1Cd, class2Cd);
            return false;
        }
        if(this.state.class1Cd !== nextState.class1Cd || this.state.class2Cd !== nextState.class2Cd) {
            const { class1Cd, class2Cd } = nextState;
            this.getUnitTypeList(class1Cd, class2Cd);
            return false;
        }

        return (nextState !== this.state);
    }*/

    componentDidMount() {
        this._isMounted = true;
        const { periodCheck, class1Cd, class1Nm, class2Cd, class2Nm } = this.props;
        let state = {
            class1Cd,
            class1Nm,
            class2Cd,
            class2Nm
        };
        if(periodCheck === 'Y') {
            state = {...state, type1Cd: 'PERIOD'};
        }
        this.setState(state);
        this.getUnitTypeList(class1Cd, class2Cd);
        this.getAllMenuList();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        const { textbookCd, gubunCd, periodCheck } = this.props;
        const { types, type1Cd, class1Cd, class1Nm, class2Cd, class2Nm, type2Cd, visible, allMenus } = this.state;

        if(!textbookCd || !class1Cd) {
            return false;
        }

        let activeType1Cd = type1Cd;
        if(!activeType1Cd && types.length > 0) {
            activeType1Cd = types[0].type1Cd
        }

        //if(!activeType1Cd) return false;

        return (
            <Fragment>
                <div className="classbytimes_top">
                    <button
                        onClick={this.handleAllMenu}
                        type="button"
                        className="all_cate"
                    >
                        <span className="blind">분류 전체 보기</span>
                    </button>
                    <h3 className="classbytimes_top_tit">{class1Nm}</h3>
                    { class2Cd && <em className="classbytimes_top_sub icon_depth">{class2Nm}</em> }
                </div>

                { visible && <Category textbookCd={textbookCd} list={allMenus} handleAllMenu={this.handleAllMenu} handleChangeClass={this.handleChangeClass}/> }

                <div className="tags_box">
                    <div className="tags_row">
                        {
                            periodCheck === 'Y' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        this.handleClickTab('PERIOD');
                                    }}
                                    className={"tags_link"+ (activeType1Cd === "PERIOD" ? " active" : "")}
                                >차시별 자료</button>
                            )
                        }
                        {
                            types.map(type => {
                                //console.log(type);
                                return (<button
                                    key={type.type1Cd}
                                    onClick={() => {
                                        this.handleClickTab(type.type1Cd);
                                    }}
                                    type="button"
                                    className={"tags_link"+ (activeType1Cd === type.type1Cd ? " active" : "")}
                                >{type.type1Nm}</button>);
                            })
                        }
                    </div>
                </div>

                {
                    activeType1Cd === 'PERIOD' ?
                        ( <PeriodDataList class1Cd={class1Cd}/> ) /*치사별 자료 목록*/
                        :
                        ( <LectureDataDetailList textbookCd={textbookCd} classCd={class2Cd ? class2Cd : class1Cd} type1Cd={activeType1Cd} type2Cd={type2Cd}/> )
                }
            </Fragment>
        );
    }
}

export default connect(
    null,
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(LectureDataDetail));