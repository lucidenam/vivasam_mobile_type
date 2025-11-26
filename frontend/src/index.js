import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router} from 'react-router-dom';
import {Provider} from 'react-redux';
import App from 'App';
import 'css/common.css';
import 'css/slick.css';
import 'css/slick-theme.css';
import configure from 'store/configure';
import transit from 'transit-immutable-js';
import {BlockDebug} from "./lib/PreventUtil";


const preloadedState = window.__PRELOADED_STATE__ && transit.fromJSON(window.__PRELOADED_STATE__);
const store = configure(preloadedState);
const getUserConfirmation = (message, callback) => {
    //뷰어,팝업이 열려있는 상태에서 뒤로가기 막음
    if(message && message.includes("true") && message.split("|")[0]){
        //return url값이 있는경우 (login page)
        if(message.includes("returnUrl=true")){
            window.viewerClose();
            callback(true);
            return;

        //뷰어 팝업 모두 열려있는경우  우선순위는 팝업 > 뷰어
        }else if(message.includes("popup=true") && message.includes("viewer=true") && window.popupClose){
            window.popupClose();

        //팝업 뷰어 각각 한개씩 종료시킴
        }else{
            if(message.includes("popup=true") && window.popupClose) window.popupClose();
            if(message.includes("viewer=true") && window.viewerClose) window.viewerClose();
        }
        window.location.hash = message.split("|")[0];
        window.scrollTo(0, message.split("|scrollY=").pop())
        callback(false);
    }else{
        callback(true);
    }
}

if(process.env.NODE_ENV === 'production'){
    try {
        let ho = window.location.hostname !== undefined ? window.location.hostname : "";
        // console.log('ho :: ' + ho);
        if (ho.toLowerCase().trim() === 'mv.vivasam.com') {
            BlockDebug(false);
        }
    }catch (e) {

    }
}

// Block Page (Just In Case)
class UC extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let body = document.getElementById("loading");
        body.remove();
    }

    render() {
        // styleComponent 임시
        const btnStyle = {
            color: "white",
            background: "teal",
            padding: ".375rem .75rem",
            border: "1px solid teal",
            borderRadius: ".25rem",
            fontSize: "1rem",
            textAlign: "center",
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)'
        };
        const letters = `비바샘 모바일 초등 점검중입니다.\n감사합니다.`
        return <div style={btnStyle}>{letters}</div>;
    }
}

ReactDOM.render(
    <Provider store={store}>
    <Router getUserConfirmation={getUserConfirmation} >
        <App />
    </Router>
    </Provider>,
    // <Provider store={store}>
    // 	<Router getUserConfirmation={getUserConfirmation}>
    // 		{!IS_UC_LOCK ? <App/> : <UC/>}
    // 	</Router>
    // </Provider>,
    document.getElementById('root')
);
