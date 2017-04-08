/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component, PropTypes } from 'react';
import { Button, Card } from 'react-native-material-design';
import {
  AppRegistry,
  Navigator,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View
} from 'react-native';

import Home from './Home';
import List from './List';
import Login from './Login';
import NewList from './NewList';
import NewItem from './NewItem';
import GotItem from './GotItem';
import ItemList from './ItemList';
import MyItems from './MyItems';


/*------------------ Class Definition ---------------------*/

export default class App extends Component {


  navigatorRenderScene(route, navigator) {
    switch (route.id) {
      case 'Login':
        return(<Login navigator={navigator} title="login page" />);
      case 'Home':
        return(<Home navigator={navigator} title="home page" username={route.username}/>);
      case 'Header':
        return(<Header navigator={navigator} title="header" username={route.username}/>);
      case 'List':
        return(<List navigator={navigator} title="My Lists" username={route.username}/>);
      case 'ItemRow':
        return(<ItemRow navigator={navigator} title="ItemRow" username={route.username}/>);
      case 'NewList':
        return(<NewList navigator={navigator} title="Create new list" username={route.username}/>);
      case 'NewItem':
        return(<NewItem navigator={navigator} title="Create new item" username={route.username}/>);

      case 'ItemList':
        return(<ItemList navigator={navigator} title="Items in list" idList={route.idList}/>);
      case 'GotItem':
        return(<GotItem navigator={navigator} title="Got Item upload page" username={route.username} itemid={route.itemid}/>);
      case 'MyItems':
        return(<MyItems navigator={navigator} title="Items assigned to me" username={route.username} />);
    }
  }


  render() {
    return (
      <Navigator
        initialRoute = {{
          id: 'Login'     // Initial scene to render
        }}
        renderScene = {
          this.navigatorRenderScene
        }
      />
    );
  }

}
