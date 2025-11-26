import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import moment from 'moment';
import {Cookies} from 'react-cookie';

class MemberInfoUpdateGuide extends Component {

    cancelUpdate = () => {
        const { history} = this.props;

        new Cookies().set("cookieCancelUpdate", true, {
            expires: moment().add(3, 'M').toDate()
        });

        history.push("/");
    };

    render() {
        return (
            <section className="login">
                <h2 className="blind">회원정보 업데이트 안내</h2>
                <div className="login_auto">
                    <strong className="login_auto_tit ico_symbol1">비바샘의 원활한 이용 및 정보 보호를 위해<br/>
                        <em className="marker2">비밀번호를 포함한 개인정보</em>를<br/>업데이트해 주세요
                    </strong>

                    <p className="mb30">비바샘은 개인정보의 관리에 더욱 최선을 다하겠습니다.<br/>감사합니다.</p>
                    {/* TODO : 개인정보 변경하기 링크 달기 */}
                    <Link 
                        to="/myInfo"
                        className="btn_round_on mb10"
                    >개인정보 변경하기</Link>
                    {/* TODO : 교과정보 변경하기 링크 달기 */}
                    <Link
                        to="/educourse/myclassSetup"
                        className="btn_round_on"
                    >교과정보 변경하기</Link>

                    <div className="login_viewer">
                        <a 
                            onClick={this.cancelUpdate} 
                            className="btn_viewer_setting"
                        >3개월간 보지 않기</a>
                    </div>
                </div>
            </section>
        );
    }
}

export default withRouter(MemberInfoUpdateGuide);