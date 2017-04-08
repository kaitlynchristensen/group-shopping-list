import React, { Component, PropTypes } from 'react';
import request from 'superagent';
import { Icon } from 'react-native-material-design';
import { ListView, Text, StyleSheet, View, TouchableHighlight, Button, Image } from 'react-native';
import SendText from './SendText';


export default class ItemRows extends Component {
  constructor() {
    super();
    this.state = {}
  }

  onGetIt(){
    var self = this;
    request
     .get('http://10.0.2.2:8080/lists/')
     .set('Accept', 'application/json')
     .end(function(err, res) {
       if (err || !res.ok) {
         console.log('Oh no! error', err);
       }
    });
    console.log("Rows: " + this.props.username);
  }

  onGotIt(){

      this.props.navigator.push({
          id: 'GotItem',
          username: this.props.username,
          itemid: "kpc465g1vcf5y18257b9", //get from view
      });
  }

  render(){
      if (this.props.title == "My Shopping List") {
        return(
          <View>

            <View style={styles.itemsRow}>
              <TouchableHighlight style={styles.gotItButton} onPress={this.onGotIt.bind(this)}>
                <View>
                  <Image style={styles.gotItImage}
                    source={require('./igotit.png')}
                  />
                  <Text > Upload photo of you and the item! </Text>
                </View>
              </TouchableHighlight>
                <Text style={styles.text}> {this.props.data.itemname} </Text>

              <View style={styles.rightButtons}>
                <TouchableHighlight  style={styles.getItButton} onPress={this.onGetIt.bind(this)}>
                  <Text style={styles.buttonText}> Ill get it! </Text>
                </TouchableHighlight>
                <SendText />
              </View>

            </View>

          </View>

        )
      }else {
        return(
          <View>

            <View style={styles.itemsRow}>
              <TouchableHighlight style={styles.gotItButton} onPress={this.onGotIt.bind(this)}>
              <View>
                <Image style={styles.gotItImage}
                  source={require('./igotit.png')}
                />
                <Text > Upload photo of you and the item! </Text>
              </View>
              </TouchableHighlight>
              <Text style={styles.text}> {this.props.data.itemname} </Text>
            </View>

          </View>

        )
      }
  }
}

function goToGetItem(){
  console.log("yolo");
}



/*------- Styles --------*/


const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  itemsRow: {
    flexDirection:'row',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    width: 150,
    marginTop: 20,
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
  gotItImage: {
    height: 80,
    width: 80,
  },
  gotItButton: {
    padding: 20,
  },
  rightButtons: {
    flexDirection:'column',

  },
  getItButton: {
    height: 35,
    width: 100,
    paddingTop: 5,
    marginTop: 20,
    marginRight: 10,
    elevation: 5,
    backgroundColor: '#4286f4',
    alignItems: 'center',

  },
  buttonText: {
    fontSize: 14,
    alignItems: 'center',
    fontWeight: 'bold',
  }
});
