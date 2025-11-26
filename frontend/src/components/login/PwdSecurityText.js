import React, {Component, Fragment} from 'react';

class PwdSecurityText extends Component {
    render() {
        const {type} = this.props;
        let claz = '';
        let txt = '';

        if(type === '안전'){
            claz = 'safe';
            txt = '';
        }else if(type === '보통'){
            claz = 'mid';
            txt = '';
        }else if(type === '낮음'){
            claz = 'low';
            txt = '';
        }else{
            txt = '비밀번호는 10자 이상 입력';
        }

        return (
            <Fragment>
                {type !== '' ?
                    <div className="pwdSecuTxt">
                        <p>비밀번호 보안수준 <span className={claz}>{type}</span></p>
                        <p className="sub">{txt}</p>
                    </div>
                    :
                    <div className="pwdSecuTxt">
                        <p>{txt}</p>
                    </div>
                }
                {/*
					사용 불가할 경우
					<p className="ty2">사용불가한 비밀번호입니다.</p>
					<ul>
						<li>· 비밀번호를 재작성 해주세요.</li>
						<li>· 영문,숫자,특수문자 조합 8자 이상 또는</li>
						<li>· 영문, 숫자 조합 10자 이상으로 사용 가능</li>
					</ul>
				*/}

            </Fragment>
        );
    }
}

export default PwdSecurityText;
