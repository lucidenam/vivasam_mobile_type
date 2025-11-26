import React, {Component, Fragment} from 'react';
import { getCourseBaseClassInfoList, getEduCourseSpecialDataSubCopy } from 'lib/api';
import { SpecialDataDetailList } from 'containers/educourse';

class Category extends Component {

    state = {
        activeClass2Cd: ''
    }

    handleGoMenu = (class2Cd, class2Nm) => {
        const {handleChangeClass, handleAllMenu} = this.props;
        handleAllMenu();
        handleChangeClass(class2Cd, class2Nm);
    }

    render() {
        const { handleAllMenu, list } = this.props;
        const { activeClass2Cd } = this.state;

        return (
            <Fragment>
                <div className="dim on"></div>
                <div className="layer_menu">
                    <div className="layer_menu_scroll">
                        <h2 className="layer_menu_title">전체보기</h2>

                        <div className="layer_menu_content">
                            {
                                list.map(menu => {
                                    return (
                                        <div
                                            key={menu.class2Cd}
                                            className={"layer_menu_list"+(activeClass2Cd === menu.class2Cd ? " active" : "")}
                                        >
                                            <a
                                                onClick={() => {
                                                    this.handleGoMenu(menu.class2Cd, menu.class2Nm);
                                                }}
                                                className={"layer_menu_titlink"+(activeClass2Cd === menu.class2Cd ? " active" : "")}
                                                style={{background:"none"}}
                                            >{menu.class2Nm}({menu.dataCnt})</a>
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

class SpecialDataDetail extends Component {
    state = {
        class2Cd: '',
        class2Nm: '',
        categoryList: [],
        visible: false,
        tooltipVisible: false,
        copy: ''
    }

    constructor(props) {
        super(props);
        this.toolTipRef = React.createRef();
    }

    handleAllMenu = (e) => {
        const { visible } = this.state;
        this.setState({
            visible: !visible
        });
    }

    handleTooltip = (e) => {
        const { tooltipVisible } = this.state;
        this.setState({
            tooltipVisible: !tooltipVisible
        });
    }

    handleChangeClass = (class2Cd, class2Nm) => {
        if(this.state.class2Cd !== class2Cd) {
            this.setState({
                class2Cd,
                class2Nm
            });
            this.getEduCourseSpecialDataSubCopy(class2Cd);
        }
    }

    handleOutSideClick = e => {
        if (this.toolTipRef.current === e.target) {
            return;
        }
        this.setState({
            tooltipVisible: false
        });
    };

    getEduCourseSpecialDataSubCopy = async (class2Cd) => {
        try {
            const response = await getEduCourseSpecialDataSubCopy(class2Cd);

            this.setState({
                copy: response.data.copy,
            });
        } catch (e) {
            console.log(e);
        }
    }

    getCourseBaseClassInfoList = async () => {
        const { textbookCd } = this.props;
        try {
            const response = await getCourseBaseClassInfoList(textbookCd, 'S');

            this.setState({
                categoryList: response.data,
            });
        } catch (e) {
            console.log(e);
        }
    }

    componentDidMount() {
        const { class2Cd, class2Nm } = this.props;
        this.setState({
            class2Cd,
            class2Nm
        });
        this.getCourseBaseClassInfoList();
        this.getEduCourseSpecialDataSubCopy(class2Cd);
        document.addEventListener("mousedown", this.handleOutSideClick, false);
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.handleOutSideClick, false);
    }

    render() {
        const { textbookCd } = this.props;
        const { class2Cd, class2Nm, categoryList, visible, tooltipVisible, copy } = this.state;
        if(!textbookCd || !class2Cd) return false;

        return (
            <Fragment>
                <div className="classbytimes_top">
                    <button
                        onClick={this.handleAllMenu}
                        type="button"
                        className="all_cate"
                    >
                        <span className="blind">전체 보기</span>
                    </button>
                    <h2 className="classbytimes_top_tit">
                        {class2Nm}
                        <div className="help_box">
                            <button
                                type="button"
                                className={"icon_help"+(tooltipVisible ? " active" : "")}
                                ref={this.toolTipRef}
                                onClick={this.handleTooltip}
                            ><span className="blind">도움말</span></button>
                            {/*도움말풍선 : 이 위치에 위치*/}
                            <div
                                className="layer_help type4"
                                hidden={!tooltipVisible}
                            >
                                <div className="layer_help_box">
                                    <p className="layer_help_ment" dangerouslySetInnerHTML={{__html: copy}}></p>
                                </div>
                            </div>
                            {/*도움말풍선*/}
                        </div>
                    </h2>
                </div>

                {
                    visible && <Category textbookCd={textbookCd} list={categoryList} handleAllMenu={this.handleAllMenu} handleChangeClass={this.handleChangeClass}/>
                }

                <SpecialDataDetailList textbookCd={textbookCd} class2Cd={class2Cd}/>
            </Fragment>
        );
    }
}

export default SpecialDataDetail;