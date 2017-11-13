import React from 'react';
import { Swiper, Slide } from 'react-dynamic-swiper';
import 'react-dynamic-swiper/lib/styles.css';


class MySwiper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            slides: ["https://ss2.baidu.com/6ONYsjip0QIZ8tyhnq/it/u=1788349961,1391247768&fm=175&s=E4DA7589E4BB3B8C7CBD29520300C0B2&w=640&h=427&img.JPEG",
            "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1788318127,1388431295&fm=175&s=FB9C538C14DA57CC4298A9D40300D0B2&w=640&h=427&img.JPEG",
            "https://ss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=1788286293,1385614822&fm=175&s=1E306981FCEFB30FB01E80D90300C093&w=640&h=427&img.JPEG"
            ]
        }
    }

    render() {
        let slides = this.state.slides;
        return (
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
        )
    }
}

export default MySwiper;