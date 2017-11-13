import React from 'react';
import '../css/App.css';
import {
    HashRouter as Router,
    Route,
    Switch,
    Link
} from 'react-router-dom';
import Home from './Home';
import Address from './Address';
import Pay from './Pay';
import Cart from './Cart';
import Logistics from './Logistics';
import Order from './Order';
import OrderDetail from './OrderDetail';
import ProductDetail from './ProductDetail';


class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
          <div className="App">
              <Router>
                  <Switch>
                      <Route exact path='/' component={Home} />
                      <Route path='/Home' component={Home} />
                      <Route path='/Address' component={Address} />
                      <Route path='/Pay' component={Pay} />
                      <Route path='/Cart' component={Cart} />
                      <Route path='/Logistics' component={Logistics} />
                      <Route path='/Order' component={Order} />
                      <Route path='/OrderDetail' component={OrderDetail} />
                      <Route path='/ProductDetail' component={ProductDetail} />
                  </Switch>
              </Router>
          </div>
        );
    }
}

export default App;
