import React from 'react';
import '../css/Address.css';
import ApiUrl from '../api/apiUrl';
import cnCity from '../js/cnCity';
import $ from 'n-zepto';
import 'react-jweixin';
import {Toptips, CityPicker} from 'react-weui';

class Address extends React.Component {

    //组件初始化状态
    constructor(props) {
        //继承父级方法属性
        super(props);

        //状态管理
        this.state = {
            id: "",
            consignee: "",
            mobile: "",
            addr: "",
            warnTimer: null,
            toptip: "",
            cityShow: false,
            cityValue: "请选择所在地区",
            orderNo: ""

        };

        //数据接口
        this.apiUrl = {
            manageShippingAddr: ApiUrl.manageShippingAddr,
            findShippingAddrs: ApiUrl.findShippingAddrs,
            settleAccounts: ApiUrl.settleAccounts
        };

        //方法作用域绑定
        this.getAddressDetail = this.getAddressDetail.bind(this);
        this.saveAddress = this.saveAddress.bind(this);
        this.changeContactName = this.changeContactName.bind(this);
        this.changeContactPhone = this.changeContactPhone.bind(this);
        this.changeContactAddress = this.changeContactAddress.bind(this);
        this.showWarn = this.showWarn.bind(this);
    }

    //组件方法

    /*提示*/
    showWarn() {
        this.setState({showWarn: true});
        this.state.warnTimer = setTimeout(()=> {
            this.setState({showWarn: false});
        }, 2000);
    }

    changeContactName(e) {
        this.setState({
            consignee: e.target.value
        });
    }
    changeContactPhone(e) {

        this.setState({
            mobile: e.target.value
        });
    }
    changeContactAddress(e) {
        this.setState({
            addr: e.target.value
        });
    }

    /*获取地址详情*/
    getAddressDetail() {
        let that = this,
            mallMemberId = localStorage.getItem("mallMemberId");
        $.ajax({
            type: "GET",
            dataType: "json",
            url: that.apiUrl.findShippingAddrs,
            data: {
                mallMemberId: mallMemberId
            },
            success: function(data) {
                if(data.length > 0) {
                    let resData = data[0];
                    if (resData.consignee) {
                        that.setState({
                            consignee: resData.consignee
                        });
                    }
                    if (resData.mobile) {
                        that.setState({
                            mobile: resData.mobile
                        });
                    }
                    if (resData.addr) {
                        let addrArr = resData.addr.split(" ");
                        console.log(addrArr);
                        that.setState({
                            cityValue: addrArr[0] + " " + addrArr[1] + " " + addrArr[2] + " ",
                            addr: addrArr[3]
                        });
                    }
                    that.setState({
                        id: resData.id
                    });
                }
            },
            error: function() {
                console.log("error");
            }
        });
    }

    /*保存地址*/
    saveAddress() {
        let that = this,
            consignee = that.state.consignee,
            mobile = that.state.mobile,
            cityValue = that.state.cityValue,
            addr = that.state.addr,
            mobilePattern = /^1\d{10}$/,
            phonePattern = /^0\d{2,3}-?\d{7,8}$/,
            phonePattern2 = /^\d{7,8}$/,
            mallMemberId = localStorage.getItem("mallMemberId");
        if(consignee == ""){
            that.setState({
                toptip: "收件人不能为空"
            });
            that.showWarn();
            return false;
        }
        if(mobile == ""){
            that.setState({
                toptip: "联系方式不能为空"
            });
            that.showWarn();
            return false;
        }
        if(cityValue == "请选择所在地区"){
            that.setState({
                toptip: "请选择所在地区"
            });
            that.showWarn();
            return false;
        }
        if(addr == ""){
            that.setState({
                toptip: "收货地址不能为空"
            });
            that.showWarn();
            return false;
        }
        if(!mobilePattern.test(mobile) && !phonePattern.test(mobile) && !phonePattern2.test(mobile)){
            that.setState({
                toptip: "联系方式有误"
            });
            that.showWarn();
            return false;
        }
        $.ajax({
            type: "GET",
            dataType: "json",
            url: that.apiUrl.manageShippingAddr,
            data: {
                id: that.state.id,
                mallMemberId: mallMemberId,
                consignee: consignee,
                mobile: mobile,
                addr: cityValue + addr
            },
            success: function(data) {
                if(data){
                    let mallMemberId = localStorage.getItem("mallMemberId"),
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
        let that = this,
            orderNo = that.props.location.query.orderNo;
        that.setState({
            orderNo: orderNo
        });
        that.getAddressDetail();
    }

    //组件渲染
    render() {
        return (
            <div className="Address">
                <CityPicker
                    data={cnCity}
                    onCancel={e=>this.setState({cityShow: false})}
                    onChange={text=>this.setState({cityValue: text, cityShow: false})}
                    show={this.state.cityShow}
                />
                <Toptips type="warn" show={this.state.showWarn}>{this.state.toptip}</Toptips>
                <div className="address-wrap">
                    <div className="address-list">
                        <div className="address-tit">联系人：</div>
                        <div className="address-info">
                            <input value={this.state.consignee} onChange={this.changeContactName}/>
                        </div>
                    </div>
                    <div className="address-list">
                        <div className="address-tit">联系电话：</div>
                        <div className="address-info">
                            <input type="number" value={this.state.mobile} onChange={this.changeContactPhone}/>
                        </div>
                    </div>
                    <div className="address-list">
                        <div className="address-tit">所在地区：</div>
                        <div className="address-info" onClick={ e=> {
                            e.preventDefault();
                            this.setState({cityShow: true})
                        }}>
                            {this.state.cityValue}
                        </div>
                    </div>
                    <div className="address-list">
                        <div className="address-tit">详细地址：</div>
                        <div className="address-info"></div>
                    </div>
                    <div className="address-detail">
                        <textarea value={this.state.addr} onChange={this.changeContactAddress}></textarea>
                    </div>
                </div>
                <div className="save-btn-wrap">
                    <div className="save-btn" onClick={this.saveAddress}>保存</div>
                </div>
            </div>
        );
    }
}

export default Address;
