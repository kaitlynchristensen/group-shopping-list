import React, { Component, PropTypes } from 'react';
import request from 'superagent';
import ActionButton from 'react-native-action-button';
import NewList from './NewItem';

import { Button, Divider, Card, Subheader, THEME_NAME } from 'react-native-material-design';
import {
  AppRegistry,
  Navigator,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} from 'react-native';
import List from './List';
import Header from './Header';

export default class ItemList extends Component {
  constructor() {
    super();
    this.state = { items:[] }

    var list = [];
  }


  componentDidMount(){
    // var idList = this.props.items;
    var idList = ["cggflobln9ezrx06n7b9", "remjf88zfvrqruc2qpvi", "q8avww2ke29"];
    var self = this;
    var arr = self.state.items.slice();
    console.log('L: ' + this.props.imageData);
    for (var i = 0; i < idList.length; i++) {

      request
       .get('http://10.0.2.2:8080/item/' + idList[i])
       .set('Accept', 'application/json')
       .end(function(err, res) {
         if (err || !res.ok) {
           console.log('Oh no! error', err);
         } else {
           //console.log(res.body.response);
           arr.push(res.body.response);
           self.setState({items: arr});
         }
      });
    }

  }

  goToAddItem() {
      this.props.navigator.push({
          id: 'NewItem',
          username: this.props.username,
          listId: "70viu2tke29"
      });
  }

  goBack(){
    this.props.navigator.push({
        id: 'Home',
    });

  }

  render(){

    var lists = [ { _id: '584996ef4c75984bb3eee853',

itemid: 'zb6gx3nxw29',

itemname: 'Snacks',

asignee: '',

picture: null,

 price: 0,

 listid: '70viu2tke29' },

  { _id: '584997084c75984bb3eee855',

  itemid: 'fcfpwuerk9',

   itemname: 'Mulled wine',

   asignee: '',

   picture: null,

   price: 0,

   listid: 'fcfpwuerk9' },

   { _id: '584997034c75984bb3eee854',

    itemid: 'kpc465g1vcf5y18257b9',

  itemname: 'Apples',

    asignee: '',

    picture: null,

   price: 5.99,

   listid: '70viu2tke29' },
   { _id: '584997034c75984bb3eee854',

    itemid: 'dc88ril766r',

  itemname: 'Cups',

    asignee: '',

    picture: null,

   price: 0,

   listid: '70viu2tke29' } ];

    return(
      <View style={styles.container}>

        <Header back={true} title="Christmas party" navigator={this.props.navigator}/>
        <List rowType="ItemRow" data={lists} navigator={this.props.navigator} username={this.props.username} idList={this.props.idList} title="ItemList"/>

        <View style={styles.totaltextView}>
          <Text style={styles.totaltext}> TOTAL: $5.99</Text>
          <Text style={styles.totaltext2}> --> Venmo</Text>
        </View>

        <ActionButton onPress={this.goToAddItem.bind(this)} buttonColor='#4286f4'></ActionButton>


      </View>

    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dee9fc',
  },
  backButton: {
    backgroundColor: '#4286f4',
    padding: 10,
  },
  totaltext: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    padding: 10,
  },
  totaltext2: {
    padding: 10,
    paddingLeft: 100,
  },
  totaltextView: {
    height: 40,
    backgroundColor: '#4286f4',
    opacity: 0.8,
    alignItems: 'center',
    flexDirection: "row",
  }
});
