const config={
    projection:"EPSG:3857",
    mapUrl:false,//"http://192.168.30.119:86/TDTMap",//瓦片地址，目前只支持epsg:4326和epsg:3857
    sceneUrl:false,//'http://192.168.30.119:8090/iserver/services/3D-3DScene/rest/realspace',//场景白膜数据的地址
    initialPosition:[104.355, 28.705, 1e7],//初始化相机位置
    initialOrientation:[0, -90, 0],//镜头初始化方向角度
    mode:'scene',// 初始化模式 scene|map
    zone:{
        url:false,//'http://192.168.30.119:86/GeoJson/zone.json',//地图标注的信息的地址,暂时这样处理...
        condition: {
            sheng: [1e8, 1e2],
            shi: [1e6, 1e2],
            xian: [1e5, 1e2],
        },
        font: {
            sheng: 'small-caps bold 22px/1 sans-serif',
            shi: 'small-caps bold 18px/1 sans-serif',
            xian: 'small-caps bold 16px/1 sans-serif',
        },
        offset: {
            sheng: -20,
            shi: -15,
            xian: -10,
        }
    }
};
export default config;

