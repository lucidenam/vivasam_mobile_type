import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Cookies} from "react-cookie";

const cookies = new Cookies();

class JoinComplete extends Component {

    //	이벤트 페이지를 통해서 회원가입 버튼을 누른 경우
    clickLink = (e) => {
        const cookiesEvent387Chk = cookies.get("returnEvent387");
        const {history} = this.props;

        if (cookiesEvent387Chk) {
            history.push('/saemteo/event/view/387');
        } else {
            history.push('/');
        }
    }

    render() {
        return (
            <section className="join">
                <div className="join_complete">
                    <div className="join_info">
                        <div className="join_complete_txt">
                            <strong className="join_complete_tit">
                                보내주신 <span className="join_complete_marker">서류 검토 후 인증</span>이 완료되면 <br />알림을 통해 공유 드리니 <br /> <span className="join_complete_marker">‘전체 메뉴&gt;설정’ 에서 PUSH 알림을 설정</span>해주세요.
                            </strong>
                            <p className="mt20">
                                PC에서 EPKI/GPKI 인증을 하시면 <br />기간 제한 없이 비바샘을 편리하게 이용하실 수 있습니다.
                            </p>
                        </div>
                        <div className="join_complete_btn">
                            <button
                                onClick={this.clickLink.bind(this)}
                                className="btn_round_on">완료</button>
                        </div>
                    </div>
                    <div className="guideline" />
                    <div className="guide_box">
                        <p className="guide_box_tel">
                            회원가입으로 문의사항이 있을 경우,<br />
                            비상교과서 고객센터  <em className="guide_box_marker">1544-7714</em>로 <br /> 연락 주세요.
                        </p>
                        <a href="tel:1544-7714" className="ico_tel">
                            <span className="blind">전화걸기</span>
                        </a>
                    </div>
                </div>
            </section>
        );
    }
}

export default withRouter(JoinComplete);
