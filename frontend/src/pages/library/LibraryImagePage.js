import React, {Component, Fragment} from 'react';
import { withRouter } from 'react-router-dom';
import MainHeaderPageTemplate from 'components/page/MainHeaderPageTemplate';
import TabMenuContainer from 'containers/menu/TabMenuContainer';
import SubTabMenuContainer from 'containers/menu/SubTabMenuContainer';
import LibraryListContainer from 'containers/library/LibraryListContainer';
import Sticky from 'react-sticky-el';
import PhotoZoneContainer from 'components/common/PhotoZoneContainer'


class LibraryImagePage extends Component{
    state = {
        subTabName : 'image',
    };
    render () {
        const { subTabName } = this.state;
        return (
            <MainHeaderPageTemplate>
                <TabMenuContainer tabName='library'/>
                <Sticky >
                    <SubTabMenuContainer tabName='library' subTabName={subTabName}/>
                </Sticky>
                <section className="library">
                    <h2 className="blind">
                        이미지 자료
                    </h2>
                    <div className="guideline"></div>
                    <div className="photozone_wrap">
                        <Fragment>
                              <PhotoZoneContainer/>
                        </Fragment>
                    </div>
                    <div className="guideline"></div>
                    <div className="library_wrap">
                        <LibraryListContainer subTabName={subTabName}/>
                    </div>
                </section>
            </MainHeaderPageTemplate>
        )
    }
}

export default withRouter(LibraryImagePage);
