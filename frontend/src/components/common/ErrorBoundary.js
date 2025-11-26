import React, {Component} from 'react';
import { FooterCopyright } from 'components/page'

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    componentDidCatch(error, info) {
        // Display fallback UI
        this.setState({ hasError: true });
        // You can also log the error to an error reporting service
        // logErrorToMyService(error, info);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div>
                    <div className="teacher_certify" style={{position: 'absolute', top: '50%', marginTop: '-186px'}}>
                        <h2 className="info_tit mt20" style={{textAlign: 'center'}}><span>비바샘 이용</span>에 불편을 드려 죄송합니다.</h2>
                        <p className="certify_txt c_gray_soft" style={{textAlign: 'center'}}>
                            연결하려는 페이지에 오류가 발생하여, 해당 페이지를 표시할 수 없습니다.
                        </p>
                        {window.__isApp && 
                            <p style={{textAlign: 'center'}}>
                            입력하신 주소를 확인해 주시기 바랍니다. 감사합니다.
                            </p>
                        }                        
                        <div>
                            <a href="/" className="btn_round_on mb50 mt50">비바샘 메인페이지로</a>
                        </div>
                        <p className="certify_txt c_gray_soft footer">
                            선생님 전용 고객센터: <span>1544-7714</span>
                        </p>                        
                    </div>
                </div>
            )
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
