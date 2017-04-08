import React, { Component, PropTypes } from 'react';
import { Icon } from 'react-native-material-design';
import { ListView, Text, StyleSheet, View, TouchableHighlight, Button, Image } from 'react-native';
import ItemList from './ItemList';
import SendText from './SendText';
import request from 'superagent';

export default class List extends Component {

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows(this.props.data), nudgeDisabled: true, username: ''
    };
  }
  componentDidMount(){
    console.log('LIST: ' + this.props.username);
  }



  /*--------- data in renderRow() is the `data` prop being passed in ------------*/
  /*
   renderRow={(data) => <Text style={styles.row}>
                {data.name} <Icon name="done" color="rgba(255,0,0,.9)" /></Text>}
  */

  render() {
    console.log('LIST RENDER: ' + this.props.username);
    switch (this.props.rowType) {

      case 'ListRow':

        return (
         <ListView
            style={styles.container}
            dataSource={this.state.dataSource}
            renderRow={(data) => <ListRow {...data} navigator={this.props.navigator}  username={this.props.username} />}

            renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
          />
        );


      case 'ItemRow':
        return (
             <ListView
                style={styles.container}
                dataSource={this.state.dataSource}
                renderRow={(data) => <ItemRow {...data} navigator={this.props.navigator} username={this.props.username} listId={this.props.listId} title={this.props.title}/>}

                renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
              />
        );

    }

  }
}


/*------- Row render() -----------*/
export class ListRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      itemIds: [],
    };
  }


  componentDidMount(){
    var self = this;
    request
     .get('http://10.0.2.2:8080/list/' + this.props.listid)
     .set('Accept', 'application/json')
     .end(function(err, res) {
       if (err || !res.ok) {
         console.log('Oh no! error', err);
       }else {
         self.setState({itemIds: res.body.response.items});
       }


    });

  }
  goToList() {

    this.props.navigator.push({
        id: 'ItemList',
        idList: this.state.itemIds,
    });

}

  render(){
    console.log('LISTROW: ' + this.props.username);
    return(
      <View style={styles.container}>
        <TouchableHighlight onPress={this.goToList.bind(this)}>
          <View style={styles.listRow}>
            <Icon name="done" color="rgba(255,0,0,.9)" />
            <Text style={styles.text}>
              {this.props.listname}
            </Text>
          </View>
        </TouchableHighlight>
      </View>

  )
  }

}

export class ItemRow extends Component {
  constructor(props){
    super(props);

    this.state = {
      number: '',
      image: '',
      pressStatus: true,
    };
  }

  componentDidMount(){
    var self = this;
    request
     .get('http://10.0.2.2:8080/user/' + "madeleine" )
     .set('Accept', 'application/json')
     .end(function(err, res) {
       if (err || !res.ok) {
         console.log('Oh no! error', err);
       }else {

         self.setState({number: res.body.response.number});
       }
    });

    request
     .get('http://10.0.2.2:8080/item/' + this.props.itemid )
     .set('Accept', 'application/json')
     .end(function(err, res) {
       if (err || !res.ok) {
         console.log('Oh no! error', err);
       }else {
         self.setState({image: res.body.response.picture});
       }
    });
  }

  onGetIt(){
    var self = this;

    request
     .post('http://10.0.2.2:8080/lists/willGetItem/' + "silvia" + '/' + this.props.itemid)
     .set('Accept', 'application/json')
     .end(function(err, res) {
       if (err || !res.ok) {
         console.log('Oh no! error', err);
       }else {
       }
    });
    self.setState({pressStatus: false});
  }

  onGotIt(){
      this.props.navigator.push({
          id: 'GotItem',
          username: this.props.username,
          itemid: this.props.itemid,
      });
  }

  render(){
    console.log("PICTUR     " + this.state.image);
      if (this.props.title == "My Shopping List") {
        return(
          <View>

            <View style={styles.itemsRow}>
              <TouchableHighlight style={styles.gotItButton} onPress={this.onGotIt.bind(this)}>
                <View>
                  <Image style={{width: 80, height: 80, resizeMode: Image.resizeMode.contain,}} source={{uri:'data:image/jpeg;base64,' + this.state.image}}/>
                </View>
              </TouchableHighlight>
                <Text style={styles.text}>   {this.props.itemname} </Text>



            </View>

          </View>

        )
      } else {
        var price = "";
        var button = <TouchableHighlight  style={ this.state.pressStatus ? styles.getItButton : styles.getItButtonPressed} onPress={this.onGetIt.bind(this)}>
                <Text style={styles.buttonText}> Ill get it! </Text>
              </TouchableHighlight>;
        if (this.props.price != 0 && this.props.price != "0" ) {
          price = ", $" + this.props.price;
          button = <View><SendText number={this.state.number}/><Text style={styles.textGotIt}> Madeleine got it! </Text></View>;
        }

        return(
          <View>

            <View style={styles.itemsRow}>
              <TouchableHighlight style={styles.gotItButton} onPress={this.onGotIt.bind(this)}>
              <View>
                  <Image style={{width: 80, height: 80, resizeMode: Image.resizeMode.contain}} source={{uri:'data:image/jpeg;base64,' + this.state.image}}/>

              </View>
              </TouchableHighlight>

              <View style={styles.gotItText}>
                <Text style={styles.text}> {this.props.itemname}{price}</Text>
              </View>

            <View style={styles.rightButtons}>
              {button}
            </View>

          </View>
          </View>

        )
      }
  }

}
/*------- Styles --------*/


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemsRow: {
    flexDirection:'row',
    alignItems: 'flex-start'
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    width: 200,
    paddingTop: 10,
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
    marginTop: 32,
    marginBottom: 14,
  },
  row: {

    fontSize: 16,
  },
  photo: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },

  gotItButton: {
    height: 100,
    width: 100,
  },
  rightButtons: {
    flexDirection:'column',
    alignItems: 'flex-end',

  },
  getItButton:{
    height: 30,
    width: 100,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#2979FF',
    opacity: 0.5,

  },
  nudgeButton: {
    height: 30,
    width: 100,
    padding: 10,
    marginRight: 10,


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
    marginLeft: -70
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
  getItButtonPressed: {
    height: 35,
    width: 100,
    paddingTop: 5,
    marginTop: 20,
    marginRight: 10,
    elevation: 5,
    backgroundColor: '#4286f4',
    alignItems: 'center',
    opacity: 0.1,
  },
  buttonText: {
    fontSize: 14,
    alignItems: 'center',
    fontWeight: 'bold',
  },

  none: {
    color: "#dee9fc"
  },
  gotItText: {
    flexDirection: 'column',
    fontSize: 7,

  }
});
