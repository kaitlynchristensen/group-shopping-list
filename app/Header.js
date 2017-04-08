import React, { Component, PropTypes } from 'react';
import { Text, StyleSheet, View, ToolbarAndroid, Button, TouchableHighlight } from 'react-native';
import { Icon } from 'react-native-material-design';
import MyItems from './MyItems';

// <ToolbarAndroid title={this.props.title} titleColor="#ffffff" style={styles.toolbar}/>

export default class Header extends Component {

  goBack() {
    this.props.navigator.push({
        id: 'Home',
        username: this.props.username
    });
  }
  goToMyLists() {
    this.props.navigator.push({
        id: 'Home',
        username: this.props.username
    });
  }
  goToMyItems() {
    this.props.navigator.push({
        id: 'MyItems',
        username: this.props.username
    });
  }

  render() {
    if (this.props.title === "Shopping With Friends" ){
      console.log("(Header.js) -- this.props.title == 'Shopping With Friends'")

      return (
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.text}>Shopping With Friends</Text>
          </View>
          <View style={styles.headerBottom}>
             <TouchableHighlight style={styles.buttonSelectedHome} onPress={this.goToMyLists.bind(this)}>
              <Text>All lists</Text>
            </TouchableHighlight>
            <TouchableHighlight style={styles.goToItemsButton} onPress={this.goToMyItems.bind(this)}>
              <Text>My Shopping List</Text>
            </TouchableHighlight>
          </View>
        </View>
      )

    }
    else if(this.props.title == "My Shopping List"){
        return (
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.text}>
                  {this.props.title}
              </Text>
            </View>
            <View style={styles.headerBottom}>
              <TouchableHighlight style={styles.goToItemsButton} onPress={this.goToMyLists.bind(this)}>
                <Text> All lists</Text>
              </TouchableHighlight>
              <TouchableHighlight style={styles.buttonSelectedList} onPress={this.goToMyItems.bind(this)}>
                <Text> My shopping list</Text>
              </TouchableHighlight>
          </View>
          </View>
        )
      }
    else {
      console.log("(Header.js) -- this.props.title in else")
      return (
          <View style={styles.headerList}>
            <TouchableHighlight onPress={this.goBack.bind(this)}>
              <View>
                <Icon name="chevron-left" color="#ffffff" style={styles.icon} />
              </View>
            </TouchableHighlight>
            <Text style={styles.text}>
                {this.props.title}
            </Text>
        </View>
      )
    }

  }
}


/*----- Styles -----*/

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#4286f4',
    flexDirection: 'column',
  },
  headerList: {
    backgroundColor: '#4286f4',
    flexDirection: 'row',
    paddingBottom: 20,
    paddingTop: 10,
  },
  headerTop: {
    paddingLeft: 15,
    paddingTop: 25,
    paddingBottom: 20,
  },
  headerBottom: {
    flexDirection: 'row',
    backgroundColor: '#5190f7'
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
    color: "white",
    marginTop: 2
  },
  buttonSelectedHome:{
    paddingTop: 15,
    paddingBottom: 15,
    width: 210,
    alignItems: 'center',
    backgroundColor: "#dee9fc",
  },
  buttonSelectedList:{
    paddingTop: 15,
    paddingBottom: 15,
    width: 210,
    alignItems: 'center',
    backgroundColor: "#dee9fc",
  },
  goToItemsButton: {
    paddingTop: 15,
    paddingBottom: 15,
    width: 210,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4389f9',
  },
});
