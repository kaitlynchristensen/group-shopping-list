import React, { Component, PropTypes } from 'react';
import request from 'superagent';
import { Icon } from 'react-native-material-design';
import { ListView, Text, StyleSheet, View, TouchableHighlight, Button, Image } from 'react-native';
import Communications from 'react-native-communications';

export default class SendText extends Component {

  sendText(){

  }
  render(){
    console.log('SendText N: ' + this.props.number);
    return(
      <View>
      <TouchableHighlight style={styles.nudgeButton} onPress={() => Communications.text(this.props.number,'NUDGE: ')}>
         <View >
           <Text style={styles.buttonText}> Nudge</Text>
         </View>
       </TouchableHighlight>
    </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  nudgeButton: {
    height: 35,
    width: 100,
    paddingTop: 5,
    marginTop: 20,
    marginRight: 10,
    backgroundColor: '#4286f4',
    elevation: 5,
    alignItems: 'center',

  },
  buttonText: {
    fontSize: 14,
    alignItems: 'center',
    fontWeight: 'bold',
  }
});
