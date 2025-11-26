import React, {Component} from 'react';
import Plyr from './video/Plyr'
import './video/Plyr.css'

class VideoViewer extends Component{

    componentDidMount(){
        this.startFunction();
    }

    startFunction = async() => {
        const { handleAuth, handleApplyPoint } = this.props;
        let auth = await handleAuth();
        if(!auth) return false;

        handleApplyPoint();
    }

    render () {
        const { target,handleDownload,handleAddFolder,type } = this.props;
        if(!target) return null;
        let src = target.dataset.src;
        let nosave = (target.dataset.nosave ? target.dataset.nosave : 'false');
        return (
            <section id="viewer_content" className="viewer_content">
                <div id="viewer_image" className="viewer_image">
                    <Plyr
                        type={type}
                        poster={target.dataset.thumnail}
                        url={src}
                        />
                </div>
                <div className="viewer_info">
                    <h2 className="viewer_info_tit">
                        {target.dataset.sourcename ? '출처 : '+target.dataset.sourcename : ''}
                    </h2>
                    <div className={"viewer_info_btnbox" + ( nosave === 'true' ? ' hide' : '')}>
                        <button
                            type="button"
                            onClick={()=>{handleDownload(target)}}
                            className="viewer_info_btn">
                            다운로드
                        </button>
                        <button
                            type="button"
                            onClick={handleAddFolder}
                            className="viewer_info_btn icon_bookmark">
                            담기
                        </button>
                    </div>
                </div>
                <div className="viewer_cont">
                    <p className="viewer_sent">
                        <span dangerouslySetInnerHTML={{__html: target.dataset.summary}}></span>
                    </p>
                </div>
            </section>
        )
    }
}

export default VideoViewer;
