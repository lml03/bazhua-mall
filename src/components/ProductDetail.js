import React from 'react';
import '../css/ProductDetail.css';
import ApiUrl from '../api/apiUrl';
import {
    HashRouter as Router,
    Route,
    Switch,
    Link
} from 'react-router-dom';
import $ from 'n-zepto';
import { Swiper, Slide } from 'react-dynamic-swiper';
import 'react-dynamic-swiper/lib/styles.css';
import { Toast } from 'react-weui';

class ProductDetail extends React.Component {

    //组件初始化状态
    constructor(props) {
        //继承父级方法属性
        super(props);

        //状态管理
        this.state = {
            showSpecification: false,
            productDetail: {},
            slides: [],
            details: [],
            number: 1,
            shoppingCartCount: 0,
            showToast: false,
            toastTimer: null,
            commodityId: 0
        };

        //数据接口
        this.apiUrl = {
            findCommodityDetail: ApiUrl.findCommodityDetail,
            addShopCartCommodity: ApiUrl.addShopCartCommodity,
            settleAccounts: ApiUrl.settleAccounts
        };

        //方法作用域绑定
        this.selectSpecification = this.selectSpecification.bind(this);
        this.hideSpecification = this.hideSpecification.bind(this);
        this.getProductDetail = this.getProductDetail.bind(this);
        this.plusNum = this.plusNum.bind(this);
        this.minusNum = this.minusNum.bind(this);
        this.addShopCart = this.addShopCart.bind(this);
        this.buyNow = this.buyNow.bind(this);
    }

    //组件方法

    /*立即购买*/
    buyNow() {
        let that = this,
            mallMemberId = localStorage.getItem("mallMemberId"),
            number = that.state.number,
            commodityId = that.state.commodityId;
        $.ajax({
            type: "GET",
            dataType: "json",
            url: that.apiUrl.settleAccounts,
            data: {
                mallMemberId: mallMemberId,
                number: number,
                commodityId: commodityId
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

    /*规格数量选择*/
    selectSpecification() {
        console.log("---选择数量规格---");
        this.setState({
            showSpecification: true
        });
    }

    /*加入购物车*/
    addShopCart() {
        let that = this,
            number = that.state.number,
            mallMemberId = localStorage.getItem("mallMemberId"),
            commodityId = that.state.commodityId;
        $.ajax({
            type: "GET",
            dataType: "json",
            url: that.apiUrl.addShopCartCommodity,
            data: {
                commodityId: commodityId,
                mallMemberId: mallMemberId,
                number: number
            },
            success: function(data) {
                if(data.flag){
                    that.setState({
                        showToast: true,
                        shoppingCartCount: data.shoppingCartCount
                    });
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

    /*增加商品数量*/
    plusNum(e) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            number: ++this.state.number
        });
    }

    /*减少商品数量*/
    minusNum(e) {
        e.preventDefault();
        e.stopPropagation();
        if(this.state.number > 1){
            this.setState({
                number: --this.state.number
            });
        }
    }


    /*隐藏规格选择框*/
    hideSpecification(e) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            showSpecification: false
        });
    }
    /*获取商品详情*/
    getProductDetail() {
        let that = this,
            mallMemberId = localStorage.getItem("mallMemberId"),
            commodityId = that.state.commodityId;
        $.ajax({
            type: "GET",
            dataType: "json",
            url: that.apiUrl.findCommodityDetail,
            data: {
                commodityId: commodityId,
                mallMemberId: mallMemberId
            },
            success: function(data) {
                let resData = data;
                console.log(resData);
                let commodityDetailImageArr = resData.commodityDetail.commodityDetailImage.split(";");
                commodityDetailImageArr.length = commodityDetailImageArr.length - 1;
                resData.commodityDetailImage = commodityDetailImageArr;
                let profileImageArr = resData.commodityDetail.profileImage.split(";");
                profileImageArr.length = profileImageArr.length - 1;
                resData.profileImage = profileImageArr;
                console.log(resData);
                that.setState({
                    productDetail: resData.commodityDetail,
                    slides: resData.profileImage,
                    details: resData.commodityDetailImage,
                    shoppingCartCount: resData.shoppingCartCount
                });
            },
            error: function() {
                console.log("error");
            }
        });
    }


    //组件生命周期
    componentDidMount() {
        //获取商品id
        let that = this;
        let commodityId = this.props.location.pathname.split("/ProductDetail/")[1];
        console.log("--commodityId--");
        console.log(commodityId);
        that.setState({
            commodityId: commodityId
        }, function () {
            that.getProductDetail();
        });

    }

    componentWillUnmount() {
        this.state.toastTimer && clearTimeout(this.state.toastTimer);
    }


    //组件渲染
    render() {

        //商品详情
        this.productHtml = (
            <div>
                <div className="detail-info-wrap">
                    <h3>{this.state.productDetail.name}</h3>
                    <p>{this.state.productDetail.specification}</p>
                    <div>
                        <i>￥{this.state.productDetail.salesPrice}</i>
                        <span>￥{this.state.productDetail.marketPrice}</span>
                    </div>
                </div>
                <div className="detail-parameter-wrap">
                    <div>
                        <span onClick={this.selectSpecification}>规格数量选择</span>
                        <i></i>
                    </div>
                    {/*<div>*/}
                    {/*<span>领取卡券：<em>领取卡券</em></span>*/}
                    {/*<i></i>*/}
                    {/*</div>*/}
                </div>
                <div className="detail-descript-wrap">
                    {
                        this.state.details.map((item, index) =>
                            <img key={index} alt="" src={item} />
                        )
                    }
                </div>
            </div>
        );

        //底部购买操作
        let number = this.state.number;
        this.buyOperate = (
            <div className="shop-cart-wrap">
                <div className="shop-cart">
                    <Link to="/Cart">
                        <div><i>{this.state.shoppingCartCount}</i></div>
                        <p>购物车</p>
                    </Link>
                </div>
                <div className="shopcart-btn-wrap" onClick={this.addShopCart}>加入购物车</div>
                <div className="buy-btn-wrap" onClick={this.buyNow}>立即购买</div>
            </div>
        );


        //规格选择弹框
        this.showSpecification = this.state.showSpecification;
        this.specificationHtml = "";
        if(this.showSpecification){
            this.specificationHtml = (
                <div className="product-parameter-wrap">
                    <div className="product-parameter-inner">
                        <div className="close-parameter-wrap">
                            <i className="close-parameter-btn" onClick={this.hideSpecification}></i>
                        </div>
                        <div className="show-product-parameter-wrap">
                            <div className="display-product-wrap">
                                <div className="display-product-img">
                                    <img alt="" src={this.state.productDetail.coverImage} />
                                </div>
                                <div className="display-product-name">
                                    <h4>{this.state.productDetail.name}</h4>
                                    <div>
                                        <i>￥{this.state.productDetail.salesPrice}</i>
                                        <span>￥{this.state.productDetail.marketPrice}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="select-parameter-wrap">
                                <p>规格选择</p>
                                <span>{this.state.productDetail.specification}</span>
                            </div>
                        </div>
                        <div className="select-quantity-wrap">
                            <p>购买数量</p>
                            <div className="select-quantity">
                                <span onClick={this.minusNum}>-</span>
                                <span id="number">{this.state.number}</span>
                                <span onClick={this.plusNum}>+</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        let slides = this.state.slides;
        return (
            <div className="ProductDetail">
                <div className="product-detail-wrap">
                    <Toast icon="success-no-circle" show={this.state.showToast}>加入成功</Toast>
                    <Swiper
                        swiperOptions={{slidesPerView: 'auto', autoplay: 3000}}
                        navigation={false}
                    >
                        {slides.map((slide, index) => (
                            <Slide key={index}>
                                <img src={slide}  alt="" />
                            </Slide>
                        ))}
                    </Swiper>
                    {this.productHtml}
                    {this.buyOperate}
                    {this.specificationHtml}
                </div>
            </div>
        );
    }
}

export default ProductDetail;
