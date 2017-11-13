import React from 'react';
import '../css/Home.css';
import Section from './Section';

class Home extends React.Component {

    //组件初始化状态
    constructor(props) {
        //继承父级方法属性
        super(props);

        //状态管理
        this.state = {

        };

        //数据接口
        this.apiUrl = {

        };

        //方法作用域绑定

    }

  render() {
    return (
      <div className="Home">
        <div className="home-wrap">
            <div className="home-main">
                <Section></Section>
            </div>
        </div>
      </div>
    );
  }
}

export default Home;
