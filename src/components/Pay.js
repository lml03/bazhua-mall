import React from 'react';
import '../css/Pay.css';
import 'react-jweixin';
import ApiUrl from '../api/apiUrl';
import $ from 'n-zepto';
import {
    HashRouter as Router,
    Route,
    Switch,
    Link
} from 'react-router-dom';
import {Toptips} from 'react-weui';

class Pay extends React.Component {

    //组件初始化状态
    constructor(props) {
        //继承父级方法属性
        super(props);

        //状态管理
        this.state = {
            shippingAddrInfo: {},
            commodityShopCartList: [],
            totalFee: 0,
            freight: 0,
            price: 0,
            orderNo: "",
            warnTimer: null,
            toptip: ""
        };

        //数据接口
        this.apiUrl = {
            unifiedOrder: ApiUrl.unifiedOrder
        };

        //方法作用域绑定
        this.getPayDetail = this.getPayDetail.bind(this);
        this.addOrder = this.addOrder.bind(this);
        this.showWarn = this.showWarn.bind(this);
    }

    //组件方法


    /*获取运单详情*/
    getPayDetail() {
        let payDetail = JSON.parse(sessionStorage.getItem("payDetail")),
            shippingAddrInfo = payDetail.shippingAddrInfo,
            commodityShopCartList = payDetail.commodityShopCartList,
            orderNo = payDetail.orderNo,
            freight = payDetail.freight,
            price = payDetail.price,
            totalFee = payDetail.total;
        console.log("--现在地址--");
        console.log(shippingAddrInfo);
        if(freight){
            this.setState({
                freight: freight
            });
        }
        if(price){
            this.setState({
                price: price
            });
        }
        this.setState({
            shippingAddrInfo: shippingAddrInfo,
            commodityShopCartList: commodityShopCartList,
            orderNo: orderNo,
            totalFee: totalFee
        });

    }

    /*提交订单*/
    addOrder() {
        let that = this,
            totalFee = that.state.totalFee,
            orderNo = that.state.orderNo,
            consignee = that.state.shippingAddrInfo.consignee,
            consigneeMobile = that.state.shippingAddrInfo.mobile,
            openid = localStorage.getItem('openid'),
            // openid = "owNlZwbiIkspQ4k908vuJw-4b8EY",
            address = that.state.shippingAddrInfo.addr;

        /*判断收件人信息是否完整*/
        if(!consignee|| !address || !consigneeMobile){
            this.setState({
                toptip: "收件人信息不完整"
            });
            this.showWarn();
            return false;
        }

        $.ajax({
            type: "GET",
            dataType: "json",
            url: that.apiUrl.unifiedOrder,
            data: {
                consignee: consignee,
                consigneeMobile: consigneeMobile,
                address: address,
                orderNo: orderNo,
                openid: openid,
                totalFee: totalFee
            },
            success: function(data) {
                let res = data;
                if(res.result_code == "SUCCESS") {
                    let appId = res.appId,
                        nonceStr = res.nonceStr,
                        packages = res.packages,
                        paySign = res.paySign,
                        signType = res.signType,
                        timeStamp = res.timeStamp;

                    function onBridgeReady(appId, nonceStr, packages, timeStamp, signType, paySign) {
                        WeixinJSBridge.invoke('getBrandWCPayRequest', {
                            "appId": appId, //公众号名称，由商户传入
                            "timeStamp": timeStamp, //时间戳，自1970年以来的秒数
                            "nonceStr": nonceStr, //随机串
                            "package": packages,
                            "signType": signType, //微信签名方式：
                            "paySign": paySign //微信签名
                        }, function (res) {
                            if (res.err_msg == "get_brand_wcpay_request:ok") {
                                console.log("--支付成功--");
                                window.location.hash = "Order?currentStatus=2";
                            } else {
                                console.log("---error---");
                            }// 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                        });
                    }

                    if (typeof WeixinJSBridge == "undefined") {
                        if (document.addEventListener) {
                            document.addEventListener('WeixinJSBridgeReady', function () {
                                onBridgeReady(appId, nonceStr, packages, timeStamp, signType, paySign);
                            }, false);
                        } else if (document.attachEvent) {
                            document.attachEvent('WeixinJSBridgeReady', function () {
                                onBridgeReady(appId, nonceStr, packages, timeStamp, signType, paySign);
                            });
                            document.attachEvent('onWeixinJSBridgeReady', function () {
                                onBridgeReady(appId, nonceStr, packages, timeStamp, signType, paySign);
                            });
                        }
                    } else {
                        onBridgeReady(appId, nonceStr, packages, timeStamp, signType, paySign);
                    }
                }
            },
            error: function() {
                console.log("error");
            }
        });

    }

    /*提示*/
    showWarn() {
        this.setState({showWarn: true});
        this.state.warnTimer = setTimeout(()=> {
            this.setState({showWarn: false});
        }, 2000);
    }


    //组件生命周期
    componentDidMount() {
        let that = this;
        setTimeout(function () {
            that.getPayDetail();
        },100);
    }

    componentWillUnmount() {
        this.state.warnTimer && clearTimeout(this.state.warnTimer);
    }

    //组件渲染
    render() {
        //收件人信息
        let shippingAddrInfo = this.state.shippingAddrInfo;
        //收件商品列表
        let commodityShopCartList = this.state.commodityShopCartList;
        return (
            <div className="Pay">
                <div className="pay-wrap">
                    <Toptips type="warn" show={this.state.showWarn}>{this.state.toptip}</Toptips>
                    <Link to={{ pathname: '/Address', query: { orderNo: this.state.orderNo} }} className="pay-person-wrap">
                        {
                            (!shippingAddrInfo.consignee || !shippingAddrInfo.mobile || !shippingAddrInfo.addr)
                            ?
                            (
                                <div className="pay-address-wrap complete-info">
                                    <div className="pay-address-detail">请完善收件信息</div>
                                    <div className="pay-address-arrow"></div>
                                </div>
                            )
                            :
                            (
                            <div>
                                <h3>
                                    <span>{shippingAddrInfo.consignee}</span>
                                    <span>{shippingAddrInfo.mobile}</span>
                                </h3>
                                <div className="pay-address-wrap">
                                    <div className="pay-address-icon"></div>
                                    <div className="pay-address-detail">{shippingAddrInfo.addr}</div>
                                    <div className="pay-address-arrow"></div>
                                </div>
                            </div>
                            )
                        }
                    </Link>
                    <div className="pay-product-wrap">
                        {
                            commodityShopCartList.map((item, index) =>
                                <div className="pay-product-list" key={index}>
                                    <div className="pay-product-img">
                                        <img alt="" src={item.commodityInfo.coverImage} />
                                    </div>
                                    <div className="pay-product-detail">
                                        <h3>{item.commodityInfo.name}</h3>
                                        <p>{item.commodityInfo.specification}</p>
                                        <div>
                                            <span>￥{item.commodityInfo.salesPrice}</span>
                                            <span>x{item.shopCartCommoditynumber}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                    <div className="pay-btn-wrap">
                        <div className="pay-money">
                            <p>实付款:￥{this.state.totalFee}</p>
                            <p>
                                <span>商品总额:￥{this.state.price}</span>
                                <span>运费:￥{this.state.freight}</span>
                            </p>
                        </div>
                        <div className="pay-btn" onClick={this.addOrder}>提交订单</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Pay;



