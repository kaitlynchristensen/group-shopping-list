import React, { Component, PropTypes } from 'react';
import request from 'superagent';
import { Avatar, Button, Card } from 'react-native-material-design';
import {
  Navigator,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View
} from 'react-native';


export default class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            phnumber: ''
        }
    }

    onButtonPress() {
        this.props.navigator.push({
            id: 'Home',
            username: this.state.username,
        });

      /*
      request
       .post('http://10.0.2.2:8080/login/' + this.state.username + '/' + this.state.phnumber)
       .set('Accept', 'application/json')
       .end(function(err, res) {
         if (err || !res.ok) {
           console.log('Oh no! error', err);
         }
      });
      */
    }




    render() {
        return (
            <View style={styles.container}>
            <Text style={styles.subtitle}>Login</Text>

                <TextInput
                    style={styles.loginInput}
                    onChangeText={(username) => this.setState({username})}
                    value={this.state.username}
                    placeholder="Username"
                />
                <TextInput
                    style={styles.loginInput}
                    onChangeText={(phnumber) => this.setState({phnumber})}
                    value={this.state.phnumber}
                    placeholder="Phone Number"
                />

                <Button text="Login" raised={true} onPress={this.onButtonPress.bind(this)} />

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
    backgroundColor: '#F5FCFF',
  },
  subtitle: {
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
    height: 40,
    width: 200,
    marginBottom: 10,
    borderColor: 'gray',
    borderWidth: 1,
  },
});
