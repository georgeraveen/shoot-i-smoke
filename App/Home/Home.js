import React, { Component } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import axios from 'axios';
import config from '../config.json';
import getCurrentPosition from './utils/getCurrentPosition';
import pm25ToCigarettes from './utils/pm25ToCigarettes';

import About from '../About';
import Map from '../Map';

export default class Home extends Component {
  state = {
    api: null,
    isAboutVisible: false,
    isMapVisible: false,
    loadingApi: false,
    loadingGps: false
  };

  componentWillMount() {
    this.fetchData();
  }

  async fetchData() {
    this.setState({ api: null, loadingGps: true });
    const { coords } = await getCurrentPosition();
    this.setState({ loadingApi: true, loadingGps: false });
    const { data: response } = await axios.get(
      `http://api.waqi.info/feed/geo:${coords.latitude};${
        coords.longitude
      }/?token=${config.waqiToken}`
    );
    this.setState({ loadingApi: false });
    if (response.status === 'ok') {
      this.setState({ api: response.data });
    } else {
      // TODO do something
    }
  }

  handleAboutHide = () => this.setState({ isAboutVisible: false });

  handleAboutShow = () => this.setState({ isAboutVisible: true });

  handleMapHide = () => this.setState({ isMapVisible: false });

  handleMapShow = () => this.setState({ isMapVisible: true });

  render() {
    const { api, isAboutVisible, isMapVisible } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {api ? api.city.name : this.renderLoadingText()}
          </Text>
          <TouchableOpacity onPress={this.handleMapShow}>
            <Text style={styles.locationPin}>&#9660;</Text>
          </TouchableOpacity>
        </View>

        {api ? (
          <View>
            <Text style={styles.ohShit}>
              Oh shit! I smoked{' '}
              <Text style={styles.cigarettesCount}>
                {pm25ToCigarettes(api.iaqi.pm25.v)}
              </Text>{' '}
              cigarettes today.
            </Text>
          </View>
        ) : (
          <ActivityIndicator />
        )}

        <TouchableOpacity onPress={this.handleAboutShow}>
          <Text style={styles.footer}>
            &#9432; The equivalence between air pollution and cigarettes has
            been established by two physicists from Berkeley Group. Click to
            read more.
          </Text>
        </TouchableOpacity>

        <About onRequestClose={this.handleAboutHide} visible={isAboutVisible} />
        <Map onRequestClose={this.handleMapHide} visible={isMapVisible} />
      </View>
    );
  }

  renderLoadingText = () => {
    const { loadingApi, loadingGps } = this.state;
    if (loadingGps) {
      return 'Getting GPS coordinates...';
    }
    if (loadingApi) {
      return 'Fetching air data...';
    }
  };
}

const styles = StyleSheet.create({
  cigarettesCount: {
    fontSize: 72
  },
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingHorizontal: 10,
    paddingTop: 50
  },
  footer: {
    fontSize: 10,
    textAlign: 'center'
  },
  header: {
    flexDirection: 'row'
  },
  locationPin: {
    fontSize: 24,
    marginHorizontal: 5
  },
  ohShit: {
    fontSize: 48
  },
  title: {
    fontSize: 24
  }
});