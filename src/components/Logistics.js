import React from 'react';
import '../css/Logistics.css';
import ApiUrl from '../api/apiUrl';
import $ from 'n-zepto';

class Logistics extends React.Component {

    //组件初始化状态
    constructor(props) {
        //继承父级方法属性
        super(props);

        //状态管理
        this.state = {
            logisticsDetail: {},
            orderNo: "",
            com: "",
            nu: ""
        };

        //数据接口
        this.apiUrl = {
            findExpressInfo: ApiUrl.findExpressInfo
        };

        //方法作用域绑定
        this.getLogisticsDetail = this.getLogisticsDetail.bind(this);
    }

    //组件方法

    /*获取运单详情*/
    getLogisticsDetail() {
        let that = this,
            com = that.state.com,
            nu = that.state.nu,
            orderNo = that.state.orderNo;
        $.ajax({
            type: "GET",
            dataType: "json",
            url: that.apiUrl.findExpressInfo,
            data: {
                com: com,
                nu: nu,
                orderNo: orderNo
            },
            success: function(data) {
                let resData = data;
                console.log(resData);
                that.setState({
                    logisticsDetail: resData
                });
            },
            error: function() {
                console.log("error");
            }
        });
    }

    //组件生命周期
    componentDidMount() {
        let that = this,
            orderNo = that.props.location.query.orderNo;
        that.setState({
            orderNo: orderNo
        },function () {
            that.getLogisticsDetail();
        });
    }

    //组件渲染
    render() {
        let logisticsDetail = this.state.logisticsDetail;

        return (
            <div className="Logistics">
                <div className="logistics-wrap">
                    <div className="logistics-status">
                        <div className="order-img">
                            <img src={logisticsDetail.coverImage} />
                        </div>
                        <div className="order-info">
                            <h4>物流商品：<span>{logisticsDetail.name}</span></h4>
                            <p>承运来源：{logisticsDetail.expressCompany}</p>
                            <p>运单编号：{logisticsDetail.expressNo}</p>
                        </div>
                    </div>
                    <iframe id="kuaidi100" className="kuaidi100" name="kuaidi100" src={logisticsDetail.expressUrl}></iframe>
                    {/*<div className="logistics-detail-wrap">*/}
                    {/*<ul className="logistics-detail">*/}
                    {/*<li className="cur">*/}
                    {/*<div>*/}
                    {/*<p>[深圳市]已签收，感谢使用快递100，期待再次为您服务</p>*/}
                    {/*<p>2017-09-13 09:17:00</p>*/}
                    {/*</div>*/}
                    {/*</li>*/}
                    {/*<li>*/}
                    {/*<div>*/}
                    {/*<p>到深圳市【深圳转运中心】，正发往【深圳宝安区】</p>*/}
                    {/*<p>2017-09-13 09:17:00</p>*/}
                    {/*</div>*/}
                    {/*</li>*/}
                    {/*<li>*/}
                    {/*<div>*/}
                    {/*<p>快递揽件</p>*/}
                    {/*<p>2017-09-13 09:17:00</p>*/}
                    {/*</div>*/}
                    {/*</li>*/}
                    {/*<li>*/}
                    {/*<div>*/}
                    {/*<p>卖家发货</p>*/}
                    {/*<p>2017-09-13 09:17:00</p>*/}
                    {/*</div>*/}
                    {/*</li>*/}
                    {/*</ul>*/}
                    {/*</div>*/}
                </div>
            </div>
        );
    }
}

export default Logistics;
