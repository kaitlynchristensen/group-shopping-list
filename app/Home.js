import React, { Component, PropTypes } from 'react';
import request from 'superagent';
import { Button, Card, Icon, Subheader } from 'react-native-material-design';
import ActionButton from 'react-native-action-button';
import { AppRegistry, ListView, Navigator, StyleSheet, Text, TextInput, TouchableHighlight, View, Image} from 'react-native';
import NewList from './NewList';
import Header from './Header';
import MyItems from './MyItems';


export default class Home extends Component {
    constructor() {
      super();
      const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      this.state = {
        data: [],
        dataSource: ds.cloneWithRows([]),
        nudgeDisabled: true,
        username: ''
      }
    }

    componentDidMount(){
      var self = this;
      request
        .get('http://10.0.2.2:8080/lists/')
        .set('Accept', 'application/json')
        .end(function(err, res) {
        if (err || !res.ok) {
          console.log('Oh no! error', err);
        } else {
          const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
          self.setState({
            data: res.body.response,
            dataSource: ds.cloneWithRows(res.body.response),
            nudgeDisabled: true,
            username: 'nishad'
          });
        }
      });
    }


    goHome() {
        this.props.navigator.push({
            id: 'Login'
        });
    }

    goToMyLists() {
        this.props.navigator.push({
            id: 'ListsView'
        });
    }

    goToNewList() {
        this.props.navigator.push({
            id: 'NewList',
            username: this.props.username
        });
    }



    render() {


        var lists = [

          {
            name: 'Christmas Dinner',
            finished: false
          },

          {
            name: 'House Party',
            finished: true
          },

          {
            name: 'Groceries',
            finished: false
          }
        ]


        var data = this.state.data;
        var dataSource = this.state.dataSource;
        console.log('HOME: ' + this.state.data);

        return (
            <View style={styles.container}>
              <Header back={true} title="Shopping With Friends" navigator={this.props.navigator} />
              <ListView
                enableEmptySections={true}
                style={styles.container}
                dataSource={dataSource}
                renderRow={(data) =>
                    <ListRow {...data}
                      navigator={this.props.navigator}
                    />
                }
                renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
              />
              <ActionButton onPress={this.goToNewList.bind(this)} buttonColor='#4286f4'></ActionButton>
            </View>
        );
    }
}


/*------- Row render() -----------*/
export class ListRow extends Component {
  constructor(props) {
    super(props);
  }


  /*-- Go to the ItemList view this row references --*/
  goToList() {
    console.log("(Home.js) -- in goToList from ListRow, this.props.items below");
    console.log(this.props.items);

    /*
    * Pass to the navigator
    *   1) the name of the next scene
    *   2) the items that belong to this list
    */
    this.props.navigator.push({
        id: 'ItemList',
        items: this.props.items,
    });
  }


  /*-- Render the row for this list element --*/
  render() {
    if(!this.props.finished){
         return(
           <View style={styles.container}>
             <TouchableHighlight onPress={this.goToList.bind(this)}>
               <View style={styles.listRow}>
               <Icon name="info" color="rgba(255,0,0,.9)" />

                 <Text style={styles.text}>
                   {this.props.listname}
                 </Text>
               </View>
             </TouchableHighlight>
           </View>
         )
       }
       else{
         return(
           <View style={styles.container}>
             <TouchableHighlight onPress={this.goToList.bind(this)}>
               <View style={styles.listRow}>
               <Icon name="done" color="#008000" />
                 <Text style={styles.text}>
                   {this.props.listname}
                 </Text>
               </View>
             </TouchableHighlight>
           </View>
         )

       }
  }

}

/*------- Styles --------*/


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dee9fc',
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
    backgroundColor: '#4286f4',
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
  goToItemsButton: {
    backgroundColor: '#4286f4',
    elevation: 10,
    width: 200,
    padding: 20,
    margin: 45,
    borderRadius: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    alignItems: 'center',
    fontWeight: 'bold',
  },
  listRow: {
    flexDirection:'row',
    alignItems: 'flex-start',
    padding: 15,
  },
  text: {
    fontSize: 20,
    width: 200,
    paddingLeft: 20,
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
});
