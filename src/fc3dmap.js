import cesiumConfig from './config/config'

/**
 * 3维地图服务
 * @param elm {element|string}容器
 * @param opt{Object} new Viewer传进去的参数,参考Cesium.Viewer
 * @param config {Object} 一些配置信息可参考源码config/config.js文件
 *
 * @constructor
 */
function Fc3dmap(elm,opt,config){
    opt = opt || {};
    let _self=this;
    /**
     * @type 配置信息
     */
    this.config=_self.extend(cesiumConfig,config);
    /**
     *
     * @type {Cesium.Viewer} cesium的viewer实例
     */
    this.viewer=null;

    Fc3dmap.prototype.init=function(){
        _self.createViewer(elm,opt);

        _self.viewer.scene.open(_self.config.sceneUrl).then(function(layers){
            _self.viewer.scene.layers.find('bulids').style3D.fillForeColor = new Cesium.Color(0.70, 0.70, 0.70);
        });
        _self.setCameraView(new Cesium.Cartesian3.fromDegrees(104.355, 28.705, 1e7), new Cesium.HeadingPitchRoll.fromDegrees(0, -90, 0));
        let position=_self.config.initialPosition&&new Cesium.Cartesian3(_self.config.initialPosition[0],_self.config.initialPosition[1],_self.config.initialPosition[2]);
        let orientation=_self.config.initialOrientation&&new Cesium.HeadingPitchRoll(_self.config.initialOrientation[0],_self.config.initialOrientation[1],_self.config.initialOrientation[2]);
        _self.flyTo(position,orientation);
        if(_self.config.zoneUrl){
            createZoneLabel(_self.viewer,_self.config.zoneUrl,_self.config.zone);
        }
    };
    /**
     * @private
     * 构建一个三维地图
     * @param elm{string} document元素容器
     * @param opt{Object<string,*>}  相关配置，可参考超图的Sesium.Viewer
     * @returns {null|Cesium.Viewer}
     */
    Fc3dmap.prototype.createViewer=function(elm, opt){
        opt=opt||{};
        _self.viewer = new Cesium.Viewer(elm,{
            fullscreenButton:opt.fullscreenButton||false,
            homeButton:opt.homeButton||false,
            animation:opt.animation||false,
            baseLayerPicker:opt.baseLayerPicker||false,
            geocoder:opt.geocoder||false,
            timeline:opt.timeline||false,
            sceneModePicker:opt.sceneModePicker||false,
            navigationHelpButton:opt.navigationHelpButton||false,
            selectionIndicator:false,
            infoBox:false,
            imageryProvider:opt.imageryProvider?opt.imageryProvider:(_self.config.mapUrl&&_self.config.mapUrl!==''&& new TDTMapImageryProvider({url: _self.config.mapUrl}))
        });
        _self.viewer._cesiumWidget._creditContainer.style.display = "none";
        return _self.viewer;
    };
    /**
     * 飞入效果
     * @param position {Cesium.Cartesian3|Array} 位置
     * @param orientation {Cesium.HeadingPitchRoll|Array} 角度
     * @param complete {function} 完成效果后的回调
     */
    Fc3dmap.prototype.flyTo=function(position, orientation, complete){
        if(position instanceof Array){
            position=new Cesium.Cartesian3(position[0],position[1],position[2]);
        }
        if(orientation instanceof Array){
            orientation=new Cesium.HeadingPitchRoll(orientation[0],orientation[1],orientation[2]);
        }
        _self.viewer.camera.flyTo({
            destination: position,
            orientation: orientation,
            complete: complete
        });
    };
    /**
     * 地图全屏
     */
    Fc3dmap.prototype.fullscreen=function(){
        Cesium.Fullscreen.requestFullscreen(_self.viewer.scene.canvas);
    };
    /**
     * 地图截屏
     */
    Fc3dmap.prototype.screenshots=function(){
        _self.viewer.scene.outputSceneToFile();
    };
    /**
     *模式转换,目前是三维和二维的转换
     * @param mode {string} 'scene'|'map' 默认是scene
     */
    Fc3dmap.prototype.changeMode=function(mode){
        mode=mode||'scene';
        let position = _self.getPosition();
        let orientation = null;
        //console.log(mode)
        switch(mode){
            case 'scene':
                orientation = new Cesium.HeadingPitchRoll(0, Cesium.Math.toRadians(-90.0), 0);
                _self.flyTo(position, orientation, (function () {
                    _self.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
                }));
                break;
            case 'map':
                _self.viewer.scene.mode = Cesium.SceneMode.SCENE3D;
                orientation = new Cesium.HeadingPitchRoll(0, Cesium.Math.toRadians(-45.0), 0);
                _self.flyTo(position, orientation);
                break;
        }

    };
    /**
     * 跳转到指定的相机位置和镜头旋转角
     * @param position {Cesium.Cartesian3|[x,y,z]}
     * @param orientation {Cesium.HeadingPitchRoll|[heading, pitch, roll]}
     */
    Fc3dmap.prototype.setCameraView=function(position, orientation) {
        if(position instanceof Array){
            position=new Cesium.Cartesian3(position[0],position[1],position[2]);
        }
        if(orientation instanceof Array){
            orientation=new Cesium.HeadingPitchRoll(orientation[0],orientation[1],orientation[2]);
        }
        _self.viewer.camera.setView({
            destination: position,
            orientation: orientation
        });
    };
    /**
     * 获取相机旋转角
     * @returns {Cesium.HeadingPitchRoll}
     */
    Fc3dmap.prototype.getCameraOrientation=function(){
        let heading, pitch, roll;
        heading = _self.viewer.camera.heading;
        pitch = _self.viewer.camera.pitch;
        roll = _self.viewer.camera.roll;
        return new Cesium.HeadingPitchRoll(heading, pitch, roll);
    };
    /**
     * 获取当前相机的位置
     * @returns {Cesium.Cartesian3}
     */
    Fc3dmap.prototype.getPosition=function(){
        return _self.viewer.camera.position;
    };
    /**
     * @private
     * 创建entity集合
     * @param opt{Object}
     * @returns {Cesium.EntityCollection}
     */
    Fc3dmap.prototype.createEntityCollection=function(opt){
        var eclt=new Cesium.EntityCollection(opt);
       // var ds=new Cesium.Datas;
        return eclt;
    };
    /**
     * 添加数据源
     * @param name 名称
     * @returns {Cesium.CustomDataSource}
     */
    Fc3dmap.prototype.addDataSource=function(name){
        var dataSource=new Cesium.CustomDataSource(name);
        _self.viewer.dataSources.add(dataSource);
        return dataSource;
    };
    /**
     * @private
     * 添加一个实体
     * @param opt {Object} 参考 Cesium.Entity配置
     * @param entityCollection {Cesium.EntityCollection} 实体添加到集合
     */
    Fc3dmap.prototype.addEntity=function(opt,entityCollection){
        if(opt instanceof Cesium.Entity==false){
            opt=new Cesium.Entity(opt);
        }
        entityCollection.add(opt);
    };
    /**
    * 添加一个要素
     * @param opt {Object} 业务逻辑信息
     * @param config {Object} 配置信息
     * @param config.xField {string} x字段名
     * @param config.yField {string} y字段名
     * @param config.xField {string} z字段名
     * @param config.style {Object} 样式配置
     * @param config.style.image {string} 资源图片或者模型文件gltf加载路径
     * @param config.style.size {number} 大小设置
     * @param config.style.graph {string} 图形方式point|square|model 点|方|3d模型 不传就是加载图片的方式
     * @param config.style.color {string} 颜色
     * @param config.style.scale {number} 大小缩放
     */
    Fc3dmap.prototype.createFeature=function(opt,config){
        config=_self.extend({
            style:{
                image:'Build/images/index/drawmark.png',
                size:null,
                graph:null,//point|square
                color:null
            },
            xField:'x',
            yField:'y',
            zField:'z'
        },config||{});
        var entity=null;
        if(!config.style.graph){
            entity=new Cesium.Entity({
                id: opt.id,
                position:new Cesium.Cartesian3.fromDegrees(opt[config.xField],opt[config.yField],opt[config.zField]||0),
                billboard:new Cesium.BillboardGraphics({
                    position:new Cesium.Cartesian3.fromDegrees(opt[config.xField],opt[config.yField],opt[config.zField]||0),
                    image: config.style.image||'Build/images/index/drawmark.png',
                    color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
                    horizontalOrigin:Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin:Cesium.VerticalOrigin.BOTTOM
                })
            })
        }else if(config.style.graph=='point'){
            entity=new Cesium.Entity({
                id: opt.id,
                position:new Cesium.Cartesian3.fromDegrees(opt[config.xField],opt[config.yField],opt[config.zField]||0),
                size:config.style.size,
                color:config.style.color?Cesium.Color.fromCssColorString(config.style.color):Cesium.Color.BLUE,
                point:{
                    color:config.style.color?Cesium.Color.fromCssColorString(config.style.color):Cesium.Color.BLUE,
                    size:opt.size||10
                }
            })
        }else if(config.style.graph=='model'){
            entity=new Cesium.Entity({
                id: opt.id,
                position:new Cesium.Cartesian3.fromDegrees(opt[config.xField],opt[config.yField],opt[config.zField]||0),
                model:new Cesium.ModelGraphics({
                    uri:config.style.image,
                    color:config.style.color&&Cesium.Color.fromCssColorString(config.style.color),
                    scale:config.style.scale,
                })
            })
        }
        //entity.setProperty('clients',opt);
        return entity;
    };
    /**
    *   批量创建要素
     *   @param arr {Array<Object>} Object参考createFeature
     *   @param config {Object} 参考createFeature
     */
    Fc3dmap.prototype.createFeatures=function(arr,config){
        var clt=new Cesium.EntityCollection();
        for(var i=0;i<arr.length;i++){
            clt.add(_self.createFeature(arr[i],config))
        }
        return clt;
    };

    _self.init();
}

/**
 * @private
 * 创建地名label
 * @param viewer
 * @param url
 * @param zoneConfig
 */
function createZoneLabel(viewer,zoneUrl,zoneConfig){
    let disPlayConfig = zoneConfig;
    let marklayer = new Cesium.BillboardCollection();
    viewer.scene.primitives.add(marklayer);
    Cesium.GeoJsonDataSource.load(zoneUrl).then(function(dataSource){
        let entities = dataSource.entities.values;
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            let level = entities[i].properties.Level.getValue();
            let txt = entities[i].properties.NAME.getValue();
            let dis = null, font = null, offset = null;
            switch (level) {
                case 1:
                    dis = disPlayConfig.condition.sheng;
                    font = disPlayConfig.font.sheng;
                    offset = disPlayConfig.offset.sheng;
                    break;
                case 2:
                    dis = disPlayConfig.condition.shi;
                    font = disPlayConfig.font.shi;
                    offset = disPlayConfig.offset.shi;
                    break;
                case 3:
                    dis = disPlayConfig.condition.xian;
                    font = disPlayConfig.font.xian;
                    offset = disPlayConfig.offset.xian;
                    break;
            }
            entity.name = "zone";
            entity.billboard = null;
            entity.label = new Cesium.LabelGraphics({
                text: txt,
                font: font,
                outlineWidth: (6 - level),
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                pixelOffset: new Cesium.Cartesian2(0.0, offset),
                fillColor: Cesium.Color.BLACK,
                outlineColor: Cesium.Color.WHITE,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(dis[1], dis[0]),
            });
        }
        viewer.dataSources.add(dataSource);
    })
}


Fc3dmap.prototype.extend=function(dst) {
    for (var i = 1, ii = arguments.length; i < ii; i++) {
        var obj = arguments[i];
        if (obj) {
            var keys = Object.keys(obj);
            for (var j = 0, jj = keys.length; j < jj; j++) {
                var key = keys[j];
                dst[key] = obj[key];
            }
        }
    }
    return dst;
};

function TDTMapImageryProvider(options) {
    this._url = options.url;
    this._tileWidth = 256;
    this._tileHeight = 256;
    this._maximumLevel = 15;
    var rectangleSouthwestInMeters = new Cesium.Cartesian2(-20037508.3427892, -20037508.3427892);
    var rectangleNortheastInMeters = new Cesium.Cartesian2(20037508.3427892, 20037508.3427892);
    this._tilingScheme = new Cesium.WebMercatorTilingScheme({
        rectangleSouthwestInMeters: rectangleSouthwestInMeters,
        rectangleNortheastInMeters: rectangleNortheastInMeters
    });
    this._credit = undefined;
    this._rectangle = this._tilingScheme.rectangle;
    this._ready = true;

    function buildImageUrl(imageryProvider, x, y, level) {
        var url = imageryProvider._url + "/{z}/{x}/{y}.png";
        url = url
            .replace('{x}', x)
            .replace('{y}', y)
            .replace('{z}', level);

        return url;
    }

    Cesium.defineProperties(TDTMapImageryProvider.prototype, {
        url: {
            get: function () {
                return this._url;
            }
        },

        token: {
            get: function () {
                return this._token;
            }
        },

        proxy: {
            get: function () {
                return this._proxy;
            }
        },

        tileWidth: {
            get: function () {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('tileWidth must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return this._tileWidth;
            }
        },

        tileHeight: {
            get: function () {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('tileHeight must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return this._tileHeight;
            }
        },

        maximumLevel: {
            get: function () {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('maximumLevel must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return this._maximumLevel;
            }
        },

        minimumLevel: {
            get: function () {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('minimumLevel must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return 0;
            }
        },

        tilingScheme: {
            get: function () {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('tilingScheme must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return this._tilingScheme;
            }
        },

        rectangle: {
            get: function () {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('rectangle must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return this._rectangle;
            }
        },

        tileDiscardPolicy: {
            get: function () {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('tileDiscardPolicy must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return this._tileDiscardPolicy;
            }
        },

        errorEvent: {
            get: function () {
                return this._errorEvent;
            }
        },

        ready: {
            get: function () {
                return this._ready;
            }
        },

        readyPromise: {
            get: function () {
                return this._readyPromise.promise;
            }
        },

        credit: {
            get: function () {
                return this._credit;
            }
        },

        usingPrecachedTiles: {
            get: function () {
                return this._useTiles;
            }
        },

        hasAlphaChannel: {
            get: function () {
                return true;
            }
        },

        layers: {
            get: function () {
                return this._layers;
            }
        }
    });
    TDTMapImageryProvider.prototype.getTileCredits = function (x, y, level) {
        return undefined;
    };
    TDTMapImageryProvider.prototype.requestImage = function (x, y, level) {
        if (!this._ready) {
            throw new DeveloperError('requestImage must not be called before the imagery provider is ready.');
        }

        var url = buildImageUrl(this, x, y, level);
        return Cesium.ImageryProvider.loadImage(this, url);
    };
}

export default Fc3dmap;

