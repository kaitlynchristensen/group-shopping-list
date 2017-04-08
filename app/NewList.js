import React, { Component, PropTypes } from 'react';
import request from 'superagent';
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

export default class NewList extends Component {
  constructor(props) {
      super(props);
      this.state = {
          listname: '',
      }
  }

  onButtonPress() {
      this.props.navigator.push({
          id: 'Home'
      });
console.log(this.props.username);

      request
       .put('http://10.0.2.2:8080/createList/' + this.state.listname + '/' + this.props.username)
       .set('Accept', 'application/json')
       .end(function(err, res) {
         if (err || !res.ok) {
           console.log('Oh no! error', err);
         }
      });
    }

  render(){
    return(
      <View style={styles.container}>
        <TextInput
          style={styles.loginInput}
          onChangeText={(listname) => this.setState({listname})}
          value={this.state.listname}
          placeholder="Give your list a describing name"
        />
        <TouchableHighlight onPress={this.onButtonPress.bind(this)} style={styles.loginButton}>
          <Text style={styles.buttonText}> Create new list and go back </Text>
        </TouchableHighlight>
      </View>
    )
  }
}



/*------- Styles --------*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4286f4',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  loginInput: {
    height: 60,
    width: 400,
    marginBottom: 10,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: '#dee9fc',

  },
  loginButton: {
    elevation: 10,
    width: 250,
    padding: 20,
    margin: 45,
    borderRadius: 3,
    backgroundColor: '#dee9fc',
    alignItems: 'center',
  },
  buttonText: {
    color: '#4286f4',
    fontWeight: 'bold',
  }
});
