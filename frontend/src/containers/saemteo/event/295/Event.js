import React, {Component,Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import {debounce} from "lodash";
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
import * as baseActions from 'store/modules/base';
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import {bindActionCreators} from "redux";

class Event extends Component{

    validate = () => {
        return true;
    };

    constructor(props) {
        super(props);
        this.state = {
           eventApplyCheck : 0 // 0 : 신청 불가능 / 1 : 신청 가능
        };
    }

    // 이벤트 신청 검사
    eventApply = async (e) => {
        const { logged, history, BaseActions , event, eventId, handleClick } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");

        }else{ // 로그인시
            try {
                event.eventId = e.currentTarget.value; // 이벤트 ID
                const response = await api.eventInfo(event.eventId);
                if(response.data.code === '3'){
                    common.error("이미 참여하셨습니다.");
                }else if(response.data.code === '0'){
                    handleClick(event.eventId);
                }else{
                    common.error("신청이 정상적으로 처리되지 못하였습니다.");
                }
            } catch (e) {
                console.log(e);
            }finally {
                setTimeout(()=>{
                }, 1000);//의도적 지연.
            }
        }
    };

    render () {
        return (
			<section className="event200521">
				<h1><img src="images/events/2020/event200518/img.jpg" alt="역사, 말을 걸다" /></h1>
				<div className="blind">
					<p>교과서 속 주인공과 대화를 해보세요.각 주인공의 질문에 의미 있는 의견을 남겨주신 분께 풍성한 선물을 드립니다.</p>
					<dl>
						<dt>신청기간</dt>
						<dd>2020. 5. 22 ~ 2020. 6. 30 </dd>
						<dt>당첨자 발표일</dt>
						<dd>2020.7.6</dd>
					</dl>
				</div>

				<div className="cont">
					<img src="images/events/2020/event200518/img2.jpg" alt="" />
					<p className="blind">선생님! 제가 정답이 없는 넌센스 퀴즈 하나 내볼게요.
                        재미있게 답을 써주실 선생님을 기다릴게요~

                        역사 속 위인 중에 가장 요리를 잘 할 것 같은 사람은 누구일까요?
                        - 던킨도너츠 도넛팩(50명)
                    </p>
					<div className="btn_wrap left">
						<button type="button" id="eApply" className="btn_apply" value="296" onClick={this.eventApply}>참여하기</button>
					</div>
					<p className="blind">저는 가끔 역사를 바꾸는 상상을 하곤해요.
                        선생님이 역사를 바꿀 수 있다면, 어느 순간에 어떤 선택을 하고 싶으신가요?그 선택이 어떤 미래를 가져왔을까요?
                        - 핸디 선풍기(50명)</p>
					<div className="btn_wrap right">
						<button type="button" className="btn_apply" value="297" onClick={this.eventApply}>참여하기</button>
					</div>
				</div>

				<div className="cont">
					<img src="images/events/2020/event200518/img3.jpg" alt="" />
					<p className="blind">저희는 위인의 삶을 통해 많은 것들을 배워요.
                        선생님은 친구 혹은 멘토로 삼고 싶은 위인이 있나요?
                        - 문화상품권 5천원권 (100명)</p>
					<div className="btn_wrap left">
						<button type="button" className="btn_apply" value="298" onClick={this.eventApply}>참여하기</button>
					</div>
					<p className="blind">50~70년대에 태어나신 선생님!어린 시절을 떠올렸을 때 가장 기억에 남는 문화가 있나요?
                        지금은 볼 수 없는 향수 가득한 물건이나 생활 풍습을 이야기해주세요.
                        - 배스킨라빈스 아이스크림 (50명)</p>
					<div className="btn_wrap right">
						<button type="button" className="btn_apply" value="299" onClick={this.eventApply}>참여하기</button>
					</div>
				</div>

				<div className="cont">
					<img src="images/events/2020/event200518/img4.jpg" alt="" />
					<p className="blind">제가 살고 있는 지금도 역사가 되겠지요?나중에 제 아이들이 배울 역사 교과서에는 2000년대가 어떻게 기록될까요?
                        2000년대에 역사적으로 가장 의미 있는 사건을 뽑아주세요!
                        - 스타벅스 아메리카노(100명)</p>
					<div className="btn_wrap center">
						<button type="button" className="btn_apply" value="300" onClick={this.eventApply}>참여하기</button>
					</div>
				</div>
				
				<p className="blind">지금, PC로 비바샘에 방문하시면, ‘역사, 말을 걸다‘ 이벤트 참여 뿐 아니라 5명의 교과서 속 주인공을 만나보실 수 있습니다.</p>
				<a href="https://www.vivasam.com/mtextbook2015/main.do?schLvl=MS&deviceMode=pc" target="_blank"><img src="images/events/2020/event200518/bn.jpg" alt="2015 개정 교육과정 비상교육 역사, 한국사 교과서 자세히보기" /></a>

			</section>
        )
    }
}



export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        event : state.saemteo.get('event').toJS()
    }),
    (dispatch) => ({
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));
//export default MiddleClassAppraisalListContainer;
