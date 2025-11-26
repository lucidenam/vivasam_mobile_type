import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import Slider from "react-slick";
import { getAppPermission, setAppPermission } from 'lib/api';

class Onboarding extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        checkPmsPush: false,
        sliderIdx: 0
    }

    handleNext = () => {
        this.slider.slickNext();
    }

    handleFinishAppGuideAndStartApp = (e) => {
        if (this.props.isApp) {
            setAppPermission('checkPmsPush', true).then(()=>{
                localStorage.setItem("acceptAllPushs", "Y");
            }).then(()=>{
                this.handleFinish(e);
            }).catch(err=>{
                this.handleFinish(e);
            });
        } else {
            new Promise((resolve, reject) => {
                localStorage.setItem("acceptAllPushs", "Y");
                resolve();
            }).then(() => {
                this.handleFinish(e);
            }).catch(err => {
                this.handleFinish(e);
            });
        }
    }

    handleSkip = e => {
        e.preventDefault();

        localStorage.setItem("acceptAllPushs", "N");
        this.handleFinish(e);
    }

    handleFinish = e => {
        e.preventDefault();
        const { handleOnboarding } = this.props;

        handleOnboarding();
    }

    handleCheckPushPermission = async() => {
        const response = await getAppPermission('checkPmsPush');
        this.setState({
            checkPmsPush: (response.value === true)
        });
    }

    componentDidMount() {
        setTimeout(()=>{//Window Bridge 초기화를 위해 조금 기다려야 합니다.
            this.handleCheckPushPermission();
        }, 1100);
    }

    render() {
        const { checkPmsPush } = this.state;
        //slick option 설정
        const settings = {
            dots: true,
            infinite: false,
            speed: 300,
            initialSlide: 0, /* 퍼블리싱용 초기 페이지설정 */
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            className: 'tutorial_slide',
            afterChange: (idx) => {
                this.setState({
                    sliderIdx: idx
                });
            }
        };

        return (
            <div className="tutorial">
                <div className="tutorial_box">
                    <Slider
                        {...settings}
                        ref={c => (this.slider = c)}
                    >
                        <div className="tutorial_card tuto1">
                            <img className="tutorial_card_ani" src="/images/tutorial/tutorial1_251.png" alt="어떤 수업도 유연하게 OK! ‘내 수업’으로 수업 만들고 비바클래스로 우리반 관리까지"/>
                        </div>
                        <div className="tutorial_card tuto2">
                            <img className="tutorial_card_ani" src="/images/tutorial/tutorial2_251.png" alt="AI 에듀테크 수업을 위한 다양한 기능을 미리 체험. 영어 어휘 학습, AI 영어 서비스 수학 조작형 교구, 게임 학습 등"/>
                        </div>
                        <div className="tutorial_card tuto3">
                            <img className="tutorial_card_ani" src="/images/tutorial/tutorial3_251.png" alt="선생님이 상상하셨던 수업, 이제 현실이 됩니다."/>
                        </div>
                        <div className="tutorial_card accessInfo">
                            <div className="txtBox">
                                <p>비바샘 앱 이용을 위해<br/>접근 권한 허용이 필요합니다.</p>
                            </div>
                            <ul className="infoList">
                                <li>
                                    <strong>[선택] 알림</strong>
                                    <p>푸시 메시지를 수신하기 위해<br/>사용합니다.</p>
                                </li>
                                <li>
                                    <strong>[선택] 사진/미디어/파일</strong>
                                    <p>고객 문의 작성 시, 사진/미디어/파일 첨부를<br/>위해 사용합니다.</p>
                                </li>
                            </ul>
                        </div>
                    </Slider>

                    {
                        !checkPmsPush && this.state.sliderIdx === 3 && (
                            <button
                                type="button"
                                onClick={this.handleSkip}
                                style={{zIndex:3}}
                                className="btn_tutorial_check">나중에 확인할게요.</button>
                        )
                    }

                    {/* { this.state.sliderIdx <= 4 &&
                        <button
                            type="button"
                            onClick={this.handleNext}
                            className="btn_tutorial">NEXT</button>
                    } */}
                    { this.state.sliderIdx === 3 &&
                        <button
                            type="button"
                            onClick={this.handleFinishAppGuideAndStartApp}
                            className="btn_tutorial btn_tutorial_start">확인</button>
                    }
                </div>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        isApp: state.base.get('isApp')
    })
)(withRouter(Onboarding));