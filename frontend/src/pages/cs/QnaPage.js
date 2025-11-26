import React, {Component, Fragment} from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as baseActions from 'store/modules/base';
import { QnaListContainer, QnaViewContainer, QnaNewContainer } from 'containers/cs';
import { QnaTabMenu } from 'components/cs';
import PageTemplate from 'components/page/PageTemplate';
import Sticky from 'react-sticky-el';
import { Link } from 'react-router-dom';

class QnaPage extends Component{
    constructor(props) {
        super(props);
        this.state = {
            header : null,
            sticky : null,
        }
    }

    componentDidMount() {
        const {logged, history, location} = this.props;
        if(!logged) {
            history.replace({
                pathname: '/login',
                state: { prevPath: location.pathname }
            });
        }

        var headerMount = document.getElementById("sticky"),
            stickyMount = headerMount ? headerMount.offsetTop : ''; 

        this.setState({
            header : headerMount,
            sticky : stickyMount
        })

        window.addEventListener('scroll', this.handleScroll);
    }

    handleScroll = () => {
        if(!this.state.header){
          return false;
        }
      
        if (window.pageYOffset > this.state.sticky) {
          this.state.header.classList.add("sticky");
        } else {
          this.state.header.classList.remove("sticky");
        }
      }

    render () {
        const id = this.props.match.params.id;
        let title;
        let containerTp;
        let visibleTabMenu = false;
        let currentTabName;
        if(id && id === 'new') {
            title = '문의하기';
            containerTp = <QnaNewContainer />;
            visibleTabMenu = true;
            currentTabName = 'NEW';
        } else if (id) { {/* 내 문의내역 상세 */}
            title = '내 문의내역';
            containerTp = <QnaViewContainer id={id} type={this.props.location.search}/>;
            visibleTabMenu = false;
        } else if (typeof id === 'undefined') { {/* 내 문의내역 목록 */}
            title = '내 문의내역';
            containerTp = <QnaListContainer />;
            visibleTabMenu = true;
            currentTabName = 'LIST';
        }
        return (
            <PageTemplate title={title}>
                {visibleTabMenu &&
                    <Fragment>
                        <div className="guideline new251"></div>
                        <div className="tab_wrap tabType02" id="sticky">
                            <ul className="tab tabMulti">
                                <li className={"tab_item" + (currentTabName === 'NEW' ? ' active' : '')}>
                                    <Link to="/cs/qna/new" className="tab_link"><span>문의하기</span></Link>
                                </li>
                                <li className={"tab_item" + (currentTabName === 'LIST' ? ' active' : '')}>
                                    <Link to="/cs/qna" className="tab_link"><span>내 문의내역</span><span className="blind">현재페이지</span></Link>
                                </li>
                            </ul>
                        </div>
                    </Fragment>
                }
                <section className="clinet_inquire">
                    <h2 className="blind">{title}</h2>
                    {containerTp}
                </section>
            </PageTemplate>
        )
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged')
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(QnaPage));
