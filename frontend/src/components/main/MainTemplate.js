import React from 'react';
import Footer from "../page/Footer";
import MainHeaderContainer from '../../containers/main/MainHeaderContainer';

const MainTemplate = ({children,visible}) => {
    return (
        <div id="wrap" >
            <MainHeaderContainer initHidden={true}/>
                {children}
            <Footer/>
        </div>
    );
};

export default MainTemplate;
