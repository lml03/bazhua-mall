import React from 'react';
import '../css/Order.css';
import ApiUrl from '../api/apiUrl';
import {
    HashRouter as Router,
    Route,
    Switch,
    Link
} from 'react-router-dom';
import $ from 'n-zepto';
import { Toast, Dialog } from 'react-weui';

class Order extends React.Component {

    //组件初始化状态
    constructor(props) {
        //继承父级方法属性
        super(props);

        //状态管理
        this.state = {
            orderList: [],
            showToast: false,
            showToastMsg: "成功",
            toastTimer: null,
            currentStatus: 0,
            showDialog: false,
            cancelOrderNo: 0,
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
            findFrontOrderInfos: ApiUrl.findFrontOrderInfos,
            updateMallOrderStatus: ApiUrl.updateMallOrderStatus,
            settleAccounts: ApiUrl.settleAccounts
        };

        //方法作用域绑定
        this.getOrderList = this.getOrderList.bind(this);
        this.getCurrentStatus = this.getCurrentStatus.bind(this);
        this.goToPay = this.goToPay.bind(this);
        this.cancelOrder = this.cancelOrder.bind(this);
        this.judgeFromWeb = this.judgeFromWeb.bind(this);
        this.confirmReceive = this.confirmReceive.bind(this);
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
        let that = this,
            orderNo = $(e.target).parents(".order-list").attr("orderno");
        that.setState({
            cancelOrderNo: orderNo,
            showDialog: true
        });
    }

    /*确认收货*/
    confirmReceive(e) {
        let that = this,
            orderNo = $(e.target).parents(".order-list").attr("orderno");
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

    /*取消订单*/
    cancelOrder(e) {
        let that = this,
            orderNo = that.state.cancelOrderNo;
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
            orderNo = $(e.target).parents(".order-list").attr("orderno");
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

    /*获取订单列表*/
    getOrderList() {
        let that = this,
            mallMemberId = localStorage.getItem("mallMemberId");
        $.ajax({
            type: "GET",
            dataType: "json",
            url: that.apiUrl.findFrontOrderInfos,
            data: {
                mallMemberId: mallMemberId,
                orderStatus: that.state.currentStatus
            },
            success: function(data) {
                let resData = data;
                console.log(resData);
                that.setState({
                    orderList: resData
                });
            },
            error: function() {
                console.log("error");
            }
        });
    }
    /*选择订单状态*/
    getCurrentStatus(e) {
        e.stopPropagation();
        e.preventDefault();
        let that = this;
        let status = $(e.currentTarget).attr("status");
        that.setState({
            currentStatus: status
        },function(){
            that.getOrderList();
        });
    }

    /*判断来自技师端还是客户端，以便控制底部导航类型*/
    judgeFromWeb() {
        let fromWebUrl = sessionStorage.getItem("fromWebUrl"),
            cusWebUrlPattern = /weiXinChannel.htm/;
        if(cusWebUrlPattern.test(fromWebUrl)){
            this.setState({
                isFromTech: false
            });
        }
    }

    //组件生命周期
    componentDidMount() {
        /*判断跳转过来的是否有状态并确定状态*/
        let that = this,
            currentStatus = that.props.location.search;
        if(currentStatus){
            currentStatus = currentStatus.split("?")[1].split("=")[1];
            that.setState({
                currentStatus: currentStatus
            });
        }
        that.judgeFromWeb();
        that.getOrderList();

    }

    componentWillUnmount() {
        this.state.toastTimer && clearTimeout(this.state.toastTimer);
    }


    //组件渲染
    render() {

        //顶部状态目录
        this.menu = [
            {
                "name": "全部",
                "status": 0
            },
            {
                "name": "待付款",
                "status": 1
            },
            {
                "name": "待发货",
                "status": 2
            },
            {
                "name": "待收货",
                "status": 3
            }
        ];
        this.menuHtml = (
            <div className="order-menu">
                {
                    this.menu.map((item, index) =>
                        item.status == this.state.currentStatus ? <span onClick={this.getCurrentStatus} key={index} status={item.status} className="current">{item.name}</span> : <span onClick={this.getCurrentStatus} key={index} status={item.status}>{item.name}</span>
                    )
                }
            </div>
        );

        //订单列表
        this.orderList = this.state.orderList;
        this.orderListHtml = (
            <div className="order-list-wrap">
                {
                    this.orderList.map((item, index) =>
                        <div className="order-list" key={index} orderno={item.orderNo}>
                            <div className="order-head">
                                <div className="order-date">订单日期：{item.createDate}</div>
                                <div className="mall-order-status">{item.statusNameCustomer}</div>
                            </div>
                            <Link className="order-main" to={"/OrderDetail/" + item.orderNo}>
                                <div className="order-img">
                                    <img src={item.commodityInfo.coverImage} />
                                </div>
                                <div className="order-info">
                                    <h4>{item.commodityInfo.name}</h4>
                                    <p>产品规格：{item.commodityInfo.specification}</p>
                                    <div>
                                        <span>￥{item.commodityInfo.salesPrice}</span>
                                        <span>X{item.number}</span>
                                    </div>
                                </div>
                            </Link>
                            <div className="order-bottom">
                                <p>
                                    <span>总计{item.commodityCount}件</span>
                                    <i>￥{item.price + item.freight}</i>
                                </p>
                                {
                                    item.statusCode == 1 ? <div className="order-bottom-btn"><span className="cancel-order" onClick={this.showDialog}>取消订单</span><span className="pay-order" onClick={this.goToPay}>去付款</span></div> : ""
                                }
                                {
                                    item.statusCode == 3 ? <span className="pay-order" onClick={this.confirmReceive}>确认收货</span> : ""
                                }
                                {
                                    item.statusCode == 3 || item.statusCode == 4 || item.statusCode == 14 ? <Link className="view-transport" to={{ pathname: '/Logistics', query: { orderNo: item.orderNo} }}>查看物流</Link> : ""
                                }
                            </div>
                        </div>
                    )
                }
            </div>
        );

        //底部导航
        this.navHtml = (
            this.state.isFromTech ? <ul className="nav-wrap">
                <li className="home">
                    <a href="/technician/front/showFrontEntry.htm#/">
                        <i></i>
                        <p>首页</p>
                    </a>
                </li>
                <li className="mall">
                    <a href="/commodity/front/shopMallHomepage.htm">
                        <i></i>
                        <p>商城</p>
                    </a>
                </li>
                <li className="order current">
                    <a href="#/Order">
                        <i></i>
                        <p>订单</p>
                    </a>
                </li>
                <li className="my">
                    <a href="/technician/front/showFrontEntry.htm#/MyCenter">
                        <i></i>
                        <p>我的</p>
                    </a>
                </li>
            </ul> : <ul className="nav-wrap">
                <li className="home">
                    <a href="/repairs/front/weiXinChannel.htm">
                        <i></i>
                        <p>首页</p>
                    </a>
                </li>
                <li className="mall">
                    <a href="/commodity/front/shopMallHomepage.htm">
                        <i></i>
                        <p>商城</p>
                    </a>
                </li>
                <li className="order current">
                    <a href="#/Order">
                        <i></i>
                        <p>订单</p>
                    </a>
                </li>
                <li className="my">
                    <a href="/customer/front/myCenter.htm">
                        <i></i>
                        <p>我的</p>
                    </a>
                </li>
            </ul>

        );


        return (
            <div>
                <div className="Order">
                    <div className="order-wrap">
                        <Dialog type="ios" title={this.state.dialogStyle.title} buttons={this.state.dialogStyle.buttons} show={this.state.showDialog}></Dialog>
                        <Toast icon="success-no-circle" show={this.state.showToast}>{this.state.showToastMsg}</Toast>
                        {this.menuHtml}
                        {this.orderListHtml}
                    </div>
                </div>
                <div className="Nav">
                    {this.navHtml}
                </div>
            </div>
        );
    }
}

export default Order;
