import React, { Component, PropTypes } from 'react';
import request from 'superagent';
import { Button, Card, Subheader, THEME_NAME } from 'react-native-material-design';
import {
  AppRegistry,
  Navigator,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  Image
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import Platform from 'react-native';

export default class GotItem extends Component {
  constructor(props){
    super(props);

    this.state = {
      avatarSource: null,
      itemPrice: '',
      imageData: '',
    };
  }

selectPhotoTapped() {
  const options = {
    quality: 1.0,
    maxWidth: 500,
    maxHeight: 500,
    storageOptions: {
      skipBackup: true
    }
  };

  ImagePicker.showImagePicker(options, (response) => {
    //console.log('Response = ', response);

    if (response.didCancel) {
      console.log('User cancelled photo picker');
    }
    else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
    }
    else if (response.customButton) {
      console.log('User tapped custom button: ', response.customButton);
    }
    else {
      var source;

      // You can display the image using either:
      source = {uri: 'data:image/jpeg;base64,' + response.data, isStatic: true};

      //Or:
      // if (Platform.OS === 'android') {
      //   source = {uri: response.uri, isStatic: true};
      // } else {
      //   source = {uri: response.uri.replace('file://', ''), isStatic: true};
      // }

      this.setState({
        avatarSource: source,
        imageData: response.data,
      });
    }
  });
}

  onButtonPress() {
      this.props.navigator.push({
          id: 'Home',

      });

      request
       .post('http://10.0.2.2:8080/item/' + this.props.itemid  + '/price/' + this.state.itemPrice)
       .set('Accept', 'application/json')
       .end(function(err, res) {
         if (err || !res.ok) {
           console.log('Oh no! error', err);
         }
      });
      console.log("LOOOOOOL " + this.props.itemid);
      request
      .post('http://10.0.2.2:8080/lists/gotItem/'+ "madeleine" + '/' + this.props.itemid )
      .set('Accept', 'application/json')
      .send(this.state.imageData)
      .end(function(err, res) {
        if (err || !res.ok) {
          console.log('Oh no! error', err);
        }else {
          //res.send(this.state.imageData);
        }
     });

    }

render(){
    return(

      <View style={styles.container}>
      <Image style={{width: 100, height: 50, resizeMode: Image.resizeMode.contain}} source={{uri: this.state.imageData}}/>

      < TouchableHighlight onPress={this.selectPhotoTapped.bind(this)}>
        <View style={styles.takePicture}>
        { this.state.avatarSource === null ? <Text style={styles.text}>Take a photo</Text> :
          <Image style={styles.avatar} source={this.state.avatarSource} />
        }
        </View>
      </  TouchableHighlight>

      <TextInput
          style={styles.priceInput}
          keyboardType = 'numeric'
          onChangeText={(itemPrice) => this.setState({itemPrice})}
          value={this.state.itemPrice}
          placeholder="How much was it?"/>
          <Button text="Add price" raised={true} onPress={this.onButtonPress.bind(this)} />
    </View>


    );
  }
  }

/*------- Styles --------*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4286f4'
  },
  avatarContainer: {
    borderColor: '#9B9B9B',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatar: {
    width: 200,
    height: 200
  },
  priceInput: {
    height: 40,
    width: 400,
    marginBottom: 10,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: '#F5FCFF',
  },
  takePicture: {
    height: 200,
    width: 200,
    marginBottom: 10,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: '#dee9fc',
    alignItems: 'center',

  },
  text: {
    fontSize: 16,
    fontWeight:  'bold',
    paddingTop: 50,
  }
});
