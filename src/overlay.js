
window.Cesium.Viewer.prototype.addOverlay=function(overlay){
    overlay.setViewer(this);
    this._container.appendChild(overlay.element);
};

/**
 * 3D场景气泡框,new 出来后要记得添加进去
 * @param opt {Object}
 * @param opt.id {property} id <br/>
 * @param opt.element {element|string} element元素或者元素id<br/>
 * @param opt.position {Array} 气泡框初始化的位置，可以不传<br/>
 *
 * @constructor
 */

var Overlay= function(opt) {
    opt = opt || {};
    var _self = this;
    /**
     * @type {string|number} overlay id
     */
    this.id = opt.id;
    /**
     * @type {document.element} overlay的内容元素
     */
    this.element = (typeof opt.element=='string')?document.getElementById(opt.element):opt.element;
    /**
     * @type {Array} 保存Popup框的x,y坐标
     */
    this.position = opt.position;

    this._worldPosition=null;
    /**
     * @type {*} popup框相对于原点偏移像素值
     */
    this.offset = opt.offset;
    /**
     * @type {Cesium.Cartesian2}
     */
    this.scratch = new Cesium.Cartesian2();
    /**
     *
     * @type {Cesium.Viewer}
     * @private
     */
    this._viewer = null;

    /**
     * @private
     * 初始化Popup框
     */
    var init = function () {

    };
    /**
     * 设置关联的cesium viewer
     * @param viewer
     */
    this.setViewer = function (viewer) {
        this._viewer = viewer;
        _self._viewer.scene.preRender.addEventListener(function () {
            if (_self.element.style.display!=="none") {
                _self.update()
            }
        });
    };
    /**
     * 获取关联的cesium viewer
     * @return {Cesium.Viewer}
     */
    this.getViewer = function () {
        return this._viewer;position
    };
    /**
     * 设置位置
     * @param position{Array}
     */
    this.setPosition = function (position) {
        if(!position){
            _self.close();
            return;
        }
        if (position instanceof Array) {
            //_self.position=position;
            position[0]=position[0]||0;
            position[1]=position[1]||0;
            position[2]=position[2]||0;
            position = Cesium.Cartesian3.fromDegrees(position[0], position[1],position[2]);
        }
        //var canvasPosition = _self._viewer.scene.cartesianToCanvasCoordinates(position,new Cesium.Cartesian2());
        if(!_self.getViewer()){
            return;
        }
        var canvasPosition=Cesium.SceneTransforms.wgs84ToWindowCoordinates(_self.getViewer().scene,position);
        if (Cesium.defined(canvasPosition)) {
            _self.element.style.top = canvasPosition.y + 'px';
            _self.element.style.left = canvasPosition.x + 'px';
            _self.show();
        }
        _self._worldPosition=position;
    };
    /**
     * @private
     * 更新overlay
     */
    this.update=function(){
        this.setPosition(this._worldPosition);
    };
    /**
     *
     * @return {Array}
     */
    this.getPosition = function () {
        //return _self.position;
    };

    this.close = function () {
        _self.element.style.display = "none";
    };

    this.show = function () {
        _self.element.style.display = "block";
    };

    init();
};
export default Overlay;