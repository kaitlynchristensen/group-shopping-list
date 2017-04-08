import React, { Component, PropTypes } from 'react';
import request from 'superagent';
import { Button, Card, Icon, Subheader } from 'react-native-material-design';
import ActionButton from 'react-native-action-button';
import {
  AppRegistry,
  ListView,
  Navigator,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  Image
} from 'react-native';

import NewList from './NewList';
import Header from './Header';
import List from './List';


export default class MyItems extends Component {

    constructor(props) {
      super(props);
      const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      this.state = {

      };
    }

  getItems() {
    return fetch('http://68.54.18.164:8080/items/' + this.props.username)
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson.response);
        return responseJson.response;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  getListById(id) {
    return fetch('http://localhost:8080/list/' + id)
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson.response[0]);
        return responseJson.response[0];
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    // var itemsJson = this.getItems();
    // var items = [];
    // for (var i = 0; i < items.length; i++) {
    //   var listId = itemsJson[i].listid;
    //   var list = getListById(listId);
    //   items.push({
    //     name: itemsJson[i].itemname,
    //     listId: list.listname,
    //     listName: list.listname
    //   });
    // }

    var lists = [ { _id: '584996ef4c75984bb3eee853',

  itemid: 'zb6gx3nxw29',

  itemname: 'Soap (kitchen)',

  asignee: '',

  picture: null,

  price: 0,

  listid: '70viu2tke29' },

  { _id: '584997084c75984bb3eee855',

  itemid: 'fcfpwuerk9',

   itemname: 'Soap (bathroom)',

   asignee: '',

   picture: null,

   price: 0,

   listid: 'fcfpwuerk9' },

   { _id: '584997034c75984bb3eee854',

    itemid: 'dc88ril766r',

  itemname: 'Cups',

    asignee: '',

    picture: null,

   price: 5.99,

   listid: '70viu2tke29' } ];

    return (

      <View style={styles.container}>
        <Header back={true} title="My Shopping List" navigator={this.props.navigator}/>
        <List title="My Shopping List" rowType="ItemRow" data={lists} navigator={this.props.navigator}/>

      </View>
    );

  }
}


/*------- Row render() -----------*/
const ListRow = (list) => (
  <View style={styles.container}>
    <Text style={styles.text}>
      {list.name}
    </Text>

    <Icon name="done" color="rgba(255,0,0,.9)" />
  </View>
);

/*------- Styles --------*/


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dee9fc',
  },
  gotItButton: {
    height: 100,
    width: 100,
  },
  getItButton: {
    height: 50,
    width: 100,

  },
  header: {
    fontSize: 18,
    paddingLeft: 12,
    paddingTop: 16,
    paddingBottom: 16,
    marginBottom: 20,
    color: "white",
    backgroundColor: '#4286f4',
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
    marginTop: 32,
    marginBottom: 14,
  },
  row: {
    paddingLeft: 12,
    fontSize: 16,
  },
  photo: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
});
