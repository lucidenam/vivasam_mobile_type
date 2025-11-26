import React, {Component} from 'react';
import 'css/ImageViewer.css';
import RenderLoading from 'components/common/RenderLoading';

class ImageViewer extends Component{

    state = {
        loading: true
    }

    constructor(props) {
        super(props);
        this.Canvas = React.createRef();
    }

    componentDidMount(){
        this._isMounted = true;
        this.startFunction();
    }

    componentWillUnmount() {
       this._isMounted = false;
    }

    startFunction = async() => {
        const { target, handleAuth, handleApplyPoint } = this.props;
        let auth = await handleAuth();
        if(!auth) return false;

        handleApplyPoint();

        var image = new Image();
        image.src = target.dataset.src;

        var Viewer = window.Viewer;
        var viewer = new Viewer(image, {
            className: 'image',
            toolbar: false,
            button: false,
            hidden: function () {
                viewer.destroy();
            },
            parent:this.refs.Canvas
        });
        viewer.show();
        if(this._isMounted){
            this.setState({
                loading: false
            })
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(nextState.loading){
            return false;
        }else{
            return true;
        }
    }

    render () {
        const { target,handleDownload,handleAddFolder } = this.props;
        if(!target) return null;
        let minHeight = Math.floor(window.innerHeight / 1.6);
        return (
            <section className="viewer_content">
                <div className="viewer_image" name="image" ref="Canvas" style={{minHeight:minHeight}}>
                    <div id="viewer_loading">
                        <RenderLoading loadingType={"1"}/>
                    </div>
                </div>
                <div className="viewer_info">
                    <h2 className="viewer_info_tit">
                        {target.dataset.sourcename ? '출처 : '+target.dataset.sourcename : ''}
                    </h2>
                    <div className="viewer_info_btnbox">
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

export default ImageViewer;
