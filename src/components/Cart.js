import React from 'react';
import '../css/Cart.css';
import coverImage from "../images/placeholder.png";
import ApiUrl from '../api/apiUrl';
import {
    HashRouter as Router,
    Route,
    Switch,
    Link
} from 'react-router-dom';
import $ from 'n-zepto';
import { Toast, Dialog } from 'react-weui';

class Cart extends React.Component {

    //组件初始化状态
    constructor(props) {

        //继承父级方法属性
        super(props);

        //数据状态管理
        this.state = {
            shopCartList: [],
            selectedAll: true,
            payAccounts: 0,
            showToast: false,
            showToastMsg: "成功",
            toastTimer: null,
            showDialog: false,
            deleteOrderId: 0,
            dialogStyle: {
                title: '确定删除此商品吗？',
                buttons: [
                    {
                        type: 'default',
                        label: '取消',
                        onClick: this.hideDialog.bind(this)
                    },
                    {
                        type: 'primary',
                        label: '确定',
                        onClick: this.deleteShopCart.bind(this)
                    }
                ]
            }
        };

        //数据接口
        this.apiUrl = {
            findShopCartList: ApiUrl.findShopCartList,
            updateShopCart: ApiUrl.updateShopCart,
            deleteShopCart: ApiUrl.deleteShopCart,
            settleAccounts: ApiUrl.settleAccounts
        };

        //方法作用域绑定
        this.getShopCartList = this.getShopCartList.bind(this);
        this.plusNum = this.plusNum.bind(this);
        this.minusNum = this.minusNum.bind(this);
        this.selectItem = this.selectItem.bind(this);
        this.selectAll = this.selectAll.bind(this);
        this.settleAccounts = this.settleAccounts.bind(this);
        this.computePay = this.computePay.bind(this);
        this.deleteShopCart = this.deleteShopCart.bind(this);
        this.startEdit = this.startEdit.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
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
            id = $(e.target).parents(".cart-list-inner").attr("id");
            that.setState({
                deleteOrderId: id,
                showDialog: true
            });
    }

    /*编辑删除*/
    startEdit(e) {
        e.preventDefault();
        e.stopPropagation();
        let that = this,
            id = $(e.target).parents(".cart-list-inner").attr("id"),
            cartList = $(e.target).parents(".cart-list");
        that.state.shopCartList.map(function (item, index) {
            if(item.id == id){
                item.isEdit = true;
            }
            return item;
        });
        that.setState({
            shopCartList: that.state.shopCartList
        },function () {
            cartList.css({"transform": "translateX(-60px)"});
        });
    }

    /*取消编辑*/
    cancelEdit(e) {
        e.preventDefault();
        e.stopPropagation();
        let that = this,
            id = $(e.target).parents(".cart-list-inner").attr("id"),
            cartList = $(e.target).parents(".cart-list");
        that.state.shopCartList.map(function (item, index) {
            if(item.id == id){
                item.isEdit = false;
            }
            return item;
        });
        that.setState({
            shopCartList: that.state.shopCartList
        }, function () {
            cartList.css({"transform": "translateX(0)"});
        });
    }

    /*删除购物车商品*/
    deleteShopCart() {
        let that = this,
            id = that.state.deleteOrderId;
        $.ajax({
            type: "GET",
            dataType: "json",
            url: that.apiUrl.deleteShopCart,
            data: {
                shoppingCartId: id
            },
            success: function(data) {
                let resData = data;
                if(resData){
                    console.log("---that.state.shopCartList---");
                    console.log(that.state.shopCartList);
                    that.state.shopCartList = that.state.shopCartList.filter(function (item, index) {
                        if (item.id != id) {
                            return true;
                        }
                    });
                    that.setState({
                        shopCartList: that.state.shopCartList,
                        showDialog: false,
                        showToast: true,
                        showToastMsg: "删除成功"
                    });

                    that.computePay();
                    that.state.toastTimer = setTimeout(()=> {
                        that.setState({showToast: false});
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

    /*从接口初始化数据列表*/
    getShopCartList() {
        let that = this,
            mallMemberId = localStorage.getItem("mallMemberId");
        $.ajax({
            type: "GET",
            dataType: "json",
            url: that.apiUrl.findShopCartList,
            data: {
                mallMemberId: mallMemberId
            },
            success: function(data) {
                let resData = data,
                    retData = [];
                resData.forEach(function (item, index) {
                    let retObj = {};
                    retObj.isEdit = false;
                    retObj.selected = true;
                    retObj.number = item.number;
                    retObj.id = item.id;
                    retObj.name = item.commodityInfo.name;
                    retObj.specification = item.commodityInfo.specification;
                    retObj.salesPrice = item.commodityInfo.salesPrice;
                    retObj.coverImage = coverImage;
                    retData.push(retObj);
                });
                that.setState({
                    shopCartList: retData
                });
                console.log(that.state.shopCartList);
            },
            error: function() {
                console.log("error");
            }
        });
    }

    /*增加商品数量*/
    plusNum(e) {
        e.preventDefault();
        e.stopPropagation();
        let that = this,
            id = $(e.target).parents(".cart-list-inner").attr("id");
        that.state.shopCartList.map(function (item, index) {
            if (item.id == id) {
                item.number ++;
                //同步更新数据库数据
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    url: that.apiUrl.updateShopCart,
                    data: {
                        id: id,
                        number: item.number
                    },
                    success: function(data) {
                        let resData = data;
                        if(resData){
                            console.log("success");
                        }else{
                            console.log("error");
                        }
                    },
                    error: function() {
                        console.log("error");
                    }
                });
            }
            return item;
        });
        that.setState({
            shopCartList: that.state.shopCartList
        });
        that.computePay();

    }

    /*减少商品数量*/
    minusNum(e) {
        e.preventDefault();
        e.stopPropagation();
        let that = this,
            id = $(e.target).parents(".cart-list-inner").attr("id");
        that.state.shopCartList.map(function (item, index) {
            if (item.id == id) {
                if(item.number > 0){
                    item.number --;
                    $.ajax({
                        type: "GET",
                        dataType: "json",
                        url: that.apiUrl.updateShopCart,
                        data: {
                            id: id,
                            number: item.number
                        },
                        success: function(data) {
                            let resData = data;
                            if(resData){
                                console.log("success");
                            }else{
                                console.log("error");
                            }
                        },
                        error: function() {
                            console.log("error");
                        }
                    });
                }
            }
            return item;
        });
        that.setState({
            shopCartList: that.state.shopCartList
        });
        that.computePay();
    }

    //选中当前项
    selectItem(e) {
        e.preventDefault();
        e.stopPropagation();
        let id = $(e.target).parents(".cart-list-inner").attr("id");
        this.state.shopCartList.map(function (item, index) {
            if (item.id == id) {
                item.selected = !item.selected;
            }
            return item;
        });
        this.setState({
            shopCartList: this.state.shopCartList
        });
        let ifAll = this.state.shopCartList.every(function (item, index) {
            return item.selected
        });
        if(ifAll){
            this.setState({
                selectedAll: true
            });
        }else{
            this.setState({
                selectedAll: false
            });
        }
        this.computePay();
    }

    //全选
    selectAll(e) {
        e.preventDefault();
        e.stopPropagation();
        if(this.state.selectedAll){
            this.setState({
                selectedAll: false
            });
            this.state.shopCartList.map(function (item, index) {
                if (item.selected) {
                    item.selected = false;
                }
                return item;
            });
        }else{
            this.setState({
                selectedAll: true
            });
            this.state.shopCartList.map(function (item, index) {
                if (!item.selected) {
                    item.selected = true;
                }
                return item;
            });
        }
        this.computePay();
    }

    //计算支付金额
    computePay() {
        let payMoney = 0;
        this.state.shopCartList.forEach(function (item, index) {
            if(item.selected){
                payMoney += item.salesPrice * item.number;
            }
        });
        this.setState({
            payAccounts: payMoney
        });
    }

    //结算
    settleAccounts(e) {
        e.preventDefault();
        e.stopPropagation();
        let that = this,
            shoppingCartIdArr = [],
            mallMemberId = localStorage.getItem("mallMemberId");
        that.state.shopCartList.forEach(function (item, index) {
            if(item.selected){
                shoppingCartIdArr.push(item.id);
            }
        });
        if(shoppingCartIdArr.length == 0){
            that.setState({
                showToast: true,
                showToastMsg: "请选择商品"
            });
            that.state.toastTimer = setTimeout(()=> {
                that.setState({showToast: false});
            }, 2000);
            return false;
        }
        $.ajax({
            type: "GET",
            dataType: "json",
            url: that.apiUrl.settleAccounts,
            data: {
                mallMemberId: mallMemberId,
                shoppingCartId: shoppingCartIdArr.join(",")
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


    //组件生命周期
    componentDidMount() {
        let that = this;
        that.getShopCartList();
        setTimeout(function () {
            that.computePay();
        },100);
    }

    componentWillUnmount() {
        this.state.toastTimer && clearTimeout(this.state.toastTimer);
    }


    //组件渲染
    render() {
        //购物车列表
        this.shopCartList = this.state.shopCartList;
        this.shopCartListHtml = this.shopCartList.map((item, index) =>
            <div className="cart-list-inner" key={index} id={item.id}>
                <div className="cart-list">
                    {
                        item.selected ? <div className="select-icon selected" onClick={this.selectItem}></div> : <div className="select-icon" onClick={this.selectItem}></div>
                    }
                    <div className="product-img">
                        <img alt="" src={item.coverImage} />
                    </div>
                    <div className="product-info-wrap">
                        <h3>
                            <span>{item.name}</span>
                            {
                                item.isEdit ? <span onClick={this.cancelEdit}>取消</span> : <span onClick={this.startEdit}>编辑</span>
                            }
                        </h3>
                        <p>产品规格：{item.specification}</p>
                        <div className="product-count-wrap">
                            <p>￥{item.salesPrice}</p>
                            <div className="select-product-count">
                                <span onClick={this.minusNum}>-</span>
                                <span id="number">{item.number}</span>
                                <span onClick={this.plusNum}>+</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="delete-cart-list" onClick={this.showDialog}>删除</div>
            </div>
        );

        //购物车结算
        this.selectedAll = this.state.selectedAll;
        this.payAccounts = this.state.payAccounts;
        this.settleHtml = (
            <div className="checkout-wrap">
                {
                    this.selectedAll ? <div className="select-all-icon selected" onClick={this.selectAll}></div> : <div className="select-all-icon" onClick={this.selectAll}></div>
                }
                <div className="checkout-txt">全选</div>
                <div className="checkout-cost">￥{this.payAccounts}</div>
                <div className="checkout-btn" onClick={this.settleAccounts}>结算</div>
            </div>
        );



        return (
            <div className="Cart">
                <div className="cart-wrap">
                    <Dialog type="ios" title={this.state.dialogStyle.title} buttons={this.state.dialogStyle.buttons} show={this.state.showDialog}></Dialog>
                    <Toast icon="success-no-circle" show={this.state.showToast}>{this.state.showToastMsg}</Toast>
                    <div className="cart-list-wrap">{this.shopCartListHtml}</div>
                    <div className="settle-wrap">{this.settleHtml}</div>
                </div>
            </div>
        );
    }
}

export default Cart;
