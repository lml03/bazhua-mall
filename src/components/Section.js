import React from 'react';
import '../css/Section.css';
import { Swiper, Slide } from 'react-dynamic-swiper';
import 'react-dynamic-swiper/lib/styles.css';
import $ from 'n-zepto';
import {
    HashRouter as Router,
    Route,
    Link
} from 'react-router-dom';
import placeholder from '../images/placeholder.png';
import ApiUrl from '../api/apiUrl';

class Section extends React.Component {

    //组件初始化状态
    constructor(props) {
        //继承父级方法属性
        super(props);

        //状态管理
        this.state = {
            productList: {},
            filterProductList: [],
            shocartNum: 0,
            isFilter: false,
            searchVal: "",
            isFromTech: true,
            recommendSlides: []
        };

        //数据接口
        this.apiUrl = {
            findHomePageInfo: ApiUrl.findHomePageInfo,
            findCommodityList: ApiUrl.findCommodityList
        };

        //方法作用域绑定
        this.getProductList = this.getProductList.bind(this);
        this.searchProductList = this.searchProductList.bind(this);
        this.getMoreProductList = this.getMoreProductList.bind(this);
        this.judgeFromWeb = this.judgeFromWeb.bind(this);
    }

    //组件方法
    /*初始化请求回去数据*/
    getProductList() {
        let that = this,
        userId = sessionStorage.getItem("mallUserId");
        // userId = 198;
        $.ajax({
            type: "GET",
            dataType: "json",
            url: that.apiUrl.findHomePageInfo,
            data: {
                userId: userId
            },
            success: function(data) {
                let resData = data.commodityList,
                    recommendSlides = [];

                //永久存储mallMemberId
                // localStorage.setItem("mallMemberId", 2);
                localStorage.setItem("mallMemberId", data.mallMemberId);

                //组装推荐到首页轮播图的数据
                resData.forEach(function (item, index) {
                    if(item.newCommodityList.length > 0){
                        item.newCommodityList.forEach(function (item2, index2) {
                            if(item2.recommendFlag == 0 && item2.profileImage){
                                let profileImageArr = item2.profileImage.split(";");
                                profileImageArr.length = profileImageArr.length - 1;
                                recommendSlides.push(profileImageArr[0]);
                            }
                        });
                    }
                });

                that.setState({
                    shocartNum: data.shoppingCartCount,
                    recommendSlides: recommendSlides,
                    productList: resData
                });
            },
            error: function() {
                console.log("error");
            }
        });
    }

    /*搜索商品列表*/
    searchProductList(e) {
        let that = this,
            mallMemberId = localStorage.getItem("mallMemberId");
        console.log("--搜索--");
        console.log(e.target.value);
        that.setState({
            searchVal:e.target.value
        }, function () {
            $.ajax({
                type: "GET",
                dataType: "json",
                url: that.apiUrl.findCommodityList,
                data: {
                    baseInfo: that.state.searchVal,
                    mallMemberId: mallMemberId
                },
                success: function(data) {
                    let resData = data.commodityList;
                    if(resData.length > 0){
                        resData.map(function (item, index) {
                            if(!item.coverImage){
                                item.coverImage = placeholder;
                            }
                            if(!item.name){
                                item.name = "暂无";
                            }
                            if(!item.salesPrice){
                                item.salesPrice = "暂无";
                            }
                            return item;
                        });
                    }
                    that.setState({
                        shocartNum: data.shoppingCartCount,
                        isFilter: true,
                        filterProductList: resData
                    });
                },
                error: function() {
                    console.log("error");
                }
            });
        });
    }

    /*更多获取商品列表*/
    getMoreProductList(e) {
        let that = this,
            postData = {},
            mallMemberId = localStorage.getItem("mallMemberId"),
            commodityLabel = $(e.currentTarget).attr("commoditylabel"),
            deviceType = $(e.currentTarget).attr("devicetype");
        if(!commodityLabel){
            commodityLabel = "";
        }
        if(!deviceType){
            deviceType = "";
        }
        postData.mallMemberId = mallMemberId;
        postData.commodityLabel = commodityLabel;
        postData.deviceType = deviceType;
        $.ajax({
            type: "GET",
            dataType: "json",
            url: that.apiUrl.findCommodityList,
            data: postData,
            success: function(data) {
                let resData = data.commodityList;
                if(resData.length > 0){
                    resData.map(function (item, index) {
                        if(!item.coverImage){
                            item.coverImage = placeholder;
                        }
                        if(!item.name){
                            item.name = "暂无";
                        }
                        if(!item.salesPrice){
                            item.salesPrice = "暂无";
                        }
                        return item;
                    });
                }
                that.setState({
                    shocartNum: data.shoppingCartCount,
                    isFilter: true,
                    filterProductList: resData
                });
            },
            error: function() {
                console.log("error");
            }
        });
    }

    /*判断来自技师端还是客户端*/
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
        this.judgeFromWeb();
        this.getProductList();
    }


    //组件渲染
    render() {

        //轮播图
        let slides = this.state.recommendSlides;
        this.swiperHtml = (
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
        );




        //搜索商品
        this.searchHtml = (
            <div className="search-wrap">
                <div className="search-inner">
                    <i className="search-icon"></i>
                    <div className="search-info-wrap">
                        <input placeholder="搜索您要找的商品" value={this.state.searchVal} onChange={this.searchProductList} className="search-info" type="text"/>
                    </div>
                </div>
            </div>
        );

        //商品设备类型分类
        this.type = [
            {
                "name": "冷链设备",
                "iconClass": "cold-chain"
            },
            {
                "name": "燃气设备",
                "iconClass": "gas"
            },
            {
                "name": "电热设备",
                "iconClass": "heat"
            },
            {
                "name": "抽排设备",
                "iconClass": "emission"
            }
        ];
        this.typeHtml = (
            <ul className="type-wrap">
                {
                    this.type.map((item, index) =>
                        <li key={index} onClick={this.getMoreProductList} devicetype={item.name}>
                            <i className={item.iconClass}></i>
                            <p>{item.name}</p>
                        </li>
                    )
                }
            </ul>
        );

        //商品列表
        this.productList =  this.state.productList;
        this.productListHtml = "";
        if(this.productList.length > 0){
            this.productListHtml = this.productList.map((item, index) =>
                <div className="section-wrap" key={index}>
                    <div className="section-tit">
                        <h3>{item.labelType}</h3>
                        <span onClick={this.getMoreProductList} commoditylabel={item.labelType}>更多></span>
                    </div>
                    <ul className="section-con" ref="sectionWrap">
                        {
                            item.newCommodityList.map((item2, index2) =>
                                <li key={index2}>
                                    <Link to={"/ProductDetail/" + item2.id}>
                                        <img alt="" src={item2.coverImage} />
                                        <h4>{item2.name}</h4>
                                        <p>￥{item2.salesPrice}元</p>
                                    </Link>
                                </li>
                            )
                        }
                    </ul>
                </div>
            )
        }else{
            this.productListHtml = (
                <div className="no-data">无数据</div>
            );
        }

        //条件过滤商品列表
        this.filterProductList =  this.state.filterProductList;
        this.filterProductListHtml = "";
        if(this.filterProductList.length > 0){
            this.filterProductListHtml = (
                <div className="section-wrap">
                    <ul className="section-con">
                        {
                            this.filterProductList.map((item, index) =>
                                <li key={index}>
                                    <Link to={"/ProductDetail/" + item.id}>
                                        <img alt="" src={item.coverImage} />
                                        <h4>{item.name}</h4>
                                        <p>￥{item.salesPrice}元</p>
                                    </Link>
                                </li>
                            )
                        }
                    </ul>
                </div>
            );
        }else{
            this.filterProductListHtml = (
                <div className="no-data">无数据</div>
            );
        }


        //底部导航
        this.navHtml = (
            this.state.isFromTech ? <ul className="nav-wrap">
                <li className="home">
                    <a href="/technician/front/showFrontEntry.htm#/">
                        <i></i>
                        <p>首页</p>
                    </a>
                </li>
                <li className="mall current">
                    <a href="/commodity/front/shopMallHomepage.htm#/">
                        <i></i>
                        <p>商城</p>
                    </a>
                </li>
                <li className="order">
                    <a href="/commodity/front/shopMallHomepage.htm#/Order">
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
                <li className="mall current">
                    <a href="/commodity/front/shopMallHomepage.htm#/">
                        <i></i>
                        <p>商城</p>
                    </a>
                </li>
                <li className="order">
                    <a href="/commodity/front/shopMallHomepage.htm#/Order">
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
                <div className="Swiper">{this.swiperHtml}</div>
                <div className="Search">{this.searchHtml}</div>
                <div className="Type">{this.typeHtml}</div>
                <div className="Section">
                    {this.state.isFilter ? this.filterProductListHtml : this.productListHtml}
                    <div className="shop-cart-show">
                        <Link to="/Cart">
                            <span>{this.state.shocartNum}</span>
                        </Link>
                    </div>
                </div>
                <div className="Nav">
                    {this.navHtml}
                </div>
            </div>
        );
    }
}

export default Section;
