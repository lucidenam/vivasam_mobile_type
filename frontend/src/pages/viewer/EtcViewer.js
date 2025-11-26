import React, {Component} from 'react';


class EtcViewer extends Component{

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

        // 다운로드 허용 (2023-02-27 최가인CP 요청)
        let nosave = target.dataset.downYn === 'Y' ? 'false' : 'true';

        let icon = 'viewer_image_ment icon_folder';
        let defaultTxt = '압축(ZIP)형태의 파일';

        if(type === 'visang'){
            defaultTxt = 'visang 형태의 파일';
        } else if(type === 'swf'){
            defaultTxt = '플래시 형태의 파일';
            icon = 'viewer_image_ment icon_flash';
        }


        return (
            <section className="viewer_content">
                <div className="viewer_image_not">
                    <p className={icon}>
                        <em className="viewer_marker">{defaultTxt}</em>은 모바일에서 미리보기를<br/>지원하지 않습니다.
                    </p>
                </div>
                <div className="viewer_info">
                    <h2 className="viewer_info_tit">
                        {target.dataset.sourcename ? '출처 : '+target.dataset.sourcename : ''}
                    </h2>
                    <div className="viewer_info_btnbox">
                        <button
                            type="button"
                            onClick={()=>{handleDownload(target)}}
                            className={"viewer_info_btn" + ( nosave === 'true' ? ' hide' : '')}>
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

export default EtcViewer;
