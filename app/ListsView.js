import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ListView,
} from 'react-native';

import {PullList} from 'react-native-pull';

export default class ListsView extends Component {

  constructor(props) {
    super(props);
    this.dataSource = [{
      id: 0,
      title: 'this is the first.',
    }];
    this.state = {
      list: (new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})).cloneWithRows(this.dataSource),
    };
    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.loadMore = this.loadMore.bind(this);
  }

  onPullRelease(resolve) {
    request
     .post('http://10.0.2.2:8080/lists/')
     .set('Accept', 'application/json')
     .end(function(err, res) {
       if (err || !res.ok) {
         console.log('Oh no! error', err);
       }else {
         console.log("YOLOOOOOOOOO");
         console.log(res.body);
       }
    });
      setTimeout(() => {
        resolve();
      }, 2000);
  }

  topIndicatorRender(pulling, pullok, pullrelease) {
    return <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 60}}>
      <ActivityIndicator size="small" color="gray" />
      {pulling ? <Text>Pull to refresh</Text> : null}
      {pullok ? <Text>Refreshing</Text> : null}
      {pullrelease ? <Text> Refreshing</Text> : null}
    </View>;
  }

    render() {
        return (
          <View style={styles.container}>
              <PullList
                  style={{}}
                  onPullRelease={this.onPullRelease} topIndicatorRender={this.topIndicatorRender} topIndicatorHeight={60}
                  renderHeader={this.renderHeader}
                  dataSource={this.state.list}
                  pageSize={5}
                  initialListSize={5}
                  renderRow={this.renderRow}
                  onEndReached={this.loadMore}
                  onEndReachedThreshold={60}
                  renderFooter={this.renderFooter}
              />
          </View>
        );
    }

    renderHeader() {
      return (
          <View style={{height: 50, backgroundColor: '#eeeeee', alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{fontWeight: 'bold'}}>Pull to refresh demo</Text>
          </View>
      );
    }

    renderRow(item, sectionID, rowID, highlightRow) {
      return (
          <View style={{height: 50, backgroundColor: '#fafafa', alignItems: 'center', justifyContent: 'center'}}>
              <Text>{item.title}</Text>
          </View>
      );
    }

    renderFooter() {
      if(this.state.nomore) {
          return null;
      }
      return (
          <View style={{height: 100}}>
              <ActivityIndicator />
          </View>
      );
    }

    loadMore() {
        this.dataSource.push({
            id: 0,
            title: `begin to create data ...`,
        });
        for(var i = 0; i < 5; i++) {
            this.dataSource.push({
                id: i + 1,
                title: `this is ${i}`,
            })
        }
        this.dataSource.push({
            id: 6,
            title: `finish create data ...`,
        });
        setTimeout(() => {
            this.setState({
                list: this.state.list.cloneWithRows(this.dataSource)
            });
        }, 1000);
    }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F5FCFF',
  },
});
