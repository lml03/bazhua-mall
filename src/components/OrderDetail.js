import React from 'react';
import '../css/OrderDetail.css';
import ApiUrl from '../api/apiUrl';
import {
    HashRouter as Router,
    Route,
    Switch,
    Link
} from 'react-router-dom';
import $ from 'n-zepto';
import { Toast, Dialog } from 'react-weui';

class OrderDetail extends React.Component {

    //组件初始化状态
    constructor(props) {
        //继承父级方法属性
        super(props);

        //状态管理
        this.state = {
            orderDetail: {},
            orderList: [],
            showToast: false,
            showToastMsg: "成功",
            toastTimer: null,
            showDialog: false,
            orderNo: "",
            dialogStyle: {
                title: '取消订单，不能恢复，确定要取消吗？',
                buttons: [
                    {
                        type: 'default',
                        label: '取消',
                        onClick: this.hideDialog.bind(this)
                    },
                    {
                        type: 'primary',
                        label: '确定',
                        onClick: this.cancelOrder.bind(this)
                    }
                ]
            }
        };

        //数据接口
        this.apiUrl = {
            findFrontOrderDetail: ApiUrl.findFrontOrderDetail,
            updateMallOrderStatus: ApiUrl.updateMallOrderStatus,
            settleAccounts: ApiUrl.settleAccounts
        };

        //方法作用域绑定
        this.getOrderDetail = this.getOrderDetail.bind(this);
        this.confirmReceive = this.confirmReceive.bind(this);
        this.goToPay = this.goToPay.bind(this);
        this.cancelOrder = this.cancelOrder.bind(this);
        this.hideDialog = this.hideDialog.bind(this);
        this.showDialog = this.showDialog.bind(this);
    }

    //组件方法

    hideDialog() {
        this.setState({
            showDialog: false
        });
    }

    showDialog(e) {
        e.preventDefault();
        e.stopPropagation();
        let that = this;
        that.setState({
            showDialog: true
        });
    }

    /*取消订单*/
    cancelOrder(e) {
        let that = this,
            orderNo = that.state.orderNo;
        console.log(orderNo);
        $.ajax({
            type: "GET",
            dataType: "json",
            url: that.apiUrl.updateMallOrderStatus,
            data: {
                orderNo: orderNo,
                orderStatus: 16
            },
            success: function(data) {
                if(data){
                    that.setState({
                        showToast: true,
                        showToastMsg: "取消成功",
                        showDialog: false
                    });
                    that.state.toastTimer = setTimeout(()=> {
                        that.setState({
                            showToast: false
                        });
                        window.location.reload();
                    }, 2000);
                }else{
                    console.log("error");
                }
            },
            error: function() {
                console.log("error");
            }
        });
    }



    /*去付款*/
    goToPay(e) {
        e.preventDefault();
        e.stopPropagation();
        let that = this,
            mallMemberId = localStorage.getItem("mallMemberId"),
            orderNo = that.state.orderNo;
        $.ajax({
            type: "GET",
            dataType: "json",
            url: that.apiUrl.settleAccounts,
            data: {
                mallMemberId: mallMemberId,
                orderNo: orderNo
            },
            success: function(data) {
                let resData = data;
                if(resData){
                    sessionStorage.setItem("payDetail", JSON.stringify(resData));
                    window.location.hash = "Pay";
                }else{
                    console.log("error");
                }
            },
            error: function() {
                console.log("error");
            }
        });
    }

    /*确认收货*/
    confirmReceive() {
        let that = this,
            orderNo = that.state.orderNo;
        $.ajax({
            type: "GET",
            dataType: "json",
            url: that.apiUrl.updateMallOrderStatus,
            data: {
                orderNo: orderNo,
                orderStatus: 14
            },
            success: function(data) {
                if(data){
                    that.setState({
                        showToast: true,
                        showToastMsg: "确认成功"
                    });
                    that.state.toastTimer = setTimeout(()=> {
                        that.setState({showToast: false});
                        window.location.reload();
                    }, 2000);
                }else{
                    console.log("error");
                }
            },
            error: function() {
                console.log("error");
            }
        });
    }

    /*获取订单详情*/
    getOrderDetail() {
        let that = this,
            //获取订单号
            orderNo = that.state.orderNo;
        $.ajax({
            type: "GET",
            dataType: "json",
            url: that.apiUrl.findFrontOrderDetail,
            data: {
                orderNo: orderNo
            },
            success: function(data) {
                let resData = data.mallOrderInfo,
                    resList = data.commodityList;
                resData.statusNameCustomer = resData.orderStatusBasics.statusNameCustomer;
                resData.statusCode = resData.orderStatusBasics.statusCode;
                that.setState({
                    orderDetail: resData,
                    orderList: resList
                });
            },
            error: function() {
                console.log("error");
            }
        });
    }

    //组件生命周期
    componentDidMount() {
        //获取订单号
        let that = this,
            orderNo = that.props.location.pathname.split("/OrderDetail/")[1];
        that.setState({
            orderNo: orderNo
        }, function () {
            that.getOrderDetail();
        });

    }

    componentWillUnmount() {
        this.state.toastTimer && clearTimeout(this.state.toastTimer);
    }

    //组件渲染
    render() {

        let orderDetail = this.state.orderDetail,
            orderList = this.state.orderList;
        return (
            <div className="OrderDetail">
                <div className="order-detail-wrap">
                    <Dialog type="ios" title={this.state.dialogStyle.title} buttons={this.state.dialogStyle.buttons} show={this.state.showDialog}></Dialog>
                    <Toast icon="success-no-circle" show={this.state.showToast}>{this.state.showToastMsg}</Toast>
                    <div className="order-detail-head">
                        <div>
                            <i className="order-status-icon"></i>
                            <span className="order-status">{orderDetail.statusNameCustomer}</span>
                        </div>
                        <div className="contact-service">
                            <a href="tel:4008621623">
                                <i className="contact-icon"></i>
                                <span className="contact-service-txt">联系客服</span>
                            </a>
                        </div>
                    </div>
                    <div className="logistics-info">
                        <h4>订单号：{orderDetail.orderNo}</h4>
                        {
                            orderDetail.statusCode == 3 || orderDetail.statusCode == 4 || orderDetail.statusCode == 14 ?
                            <Link className="transport-address" to={{ pathname: '/Logistics', query: { orderNo: orderDetail.orderNo} }}><i className="address-icon"></i>
                                <span>已经发货，跟踪订单物流</span>
                                <i className="right-arrow"></i>
                            </Link> : ""
                        }
                        <div>
                            <p>
                                <span>收货人：{orderDetail.consignee}</span>
                                <span>{orderDetail.consigneeMobile}</span>
                            </p>
                            <p>收货地址：{orderDetail.address}</p>
                        </div>
                    </div>
                    <div className="product-info-wrap">
                        {
                            orderList.map((item, index) =>
                                <div className="product-info" key={index}>
                                    <div className="product-img">
                                        <img alt="" src={item.commodityInfo.coverImage} />
                                    </div>
                                    <div className="product-detail">
                                        <h4>
                                            <span>{item.commodityInfo.name}</span>
                                            <i>X{item.number}</i>
                                        </h4>
                                        <p>产品规格：{item.commodityInfo.specification}</p>
                                        <div>￥{item.commodityInfo.salesPrice}</div>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                    <div className="pay-info-wrap">
                        <p>
                            <span>支付方式：</span>
                            <span>微信支付</span>
                        </p>
                        <div className="pay-introduce">
                            <p>
                                <span>商品合计：</span>
                                <span>￥{orderDetail.price}</span>
                            </p>
                            <p>
                                <span>运费：</span>
                                <span>{orderDetail.freight}</span>
                            </p>
                        </div>
                        <div className="remark-wrap">
                            <p>实付款：￥{orderDetail.price + orderDetail.freight}</p>
                            <p>下单时间：{orderDetail.createDate}</p>
                            <p>订单23小时后将关闭</p>
                        </div>
                    </div>
                    {
                        orderDetail.statusCode == 1 ? <div className="order-bottom-btn"><span className="cancel-order" onClick={this.showDialog}>取消订单</span><span className="pay-order" onClick={this.goToPay}>去付款</span></div> : ""
                    }
                    {
                        orderDetail.statusCode == 3 ? <div className="order-bottom-btn"><span className="pay-order" onClick={this.confirmReceive}>确认收货</span></div> : ""
                    }
                </div>
            </div>
        );
    }
}

export default OrderDetail;

