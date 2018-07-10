import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  Switch,
  TouchableOpacity,
  ToastAndroid,
  Image
} from 'react-native';
import BluetoothSerial from 'react-native-bluetooth-serial'
var TimerMixin = require('react-timer-mixin');
var _ = require('lodash');

export default class App extends Component<{}> {
  constructor(props) {
    super(props)
    this.state = {
      //IGUALAR A VARIAVEL A '' PARA LIMPAR AO INICIAR UM PROCESSO
      received: '',//ESTA VARIAVEL IRÁ FICAR GUARDANDO TODA A MSG RECEBIDA, CONCATENDANDO OS CARACTERES
      isEnabled: false,
      discovering: false,
      devices: [],
      unpairedDevices: [],
    }
  }

  componentWillMount() {
    Promise.all([
      BluetoothSerial.isEnabled(),
      BluetoothSerial.list()
    ])
      .then((values) => {
        const [isEnabled, devices] = values
        this.setState({ isEnabled, devices })
      })

    BluetoothSerial.on('bluetoothEnabled', () => {

      Promise.all([
        BluetoothSerial.isEnabled(),
        BluetoothSerial.list()
      ])
        .then((values) => {
          const [isEnabled, devices] = values
          this.setState({ devices })
        })

      BluetoothSerial.on('bluetoothDisabled', () => {
        this.setState({ devices: [] })

      })
      BluetoothSerial.on('error', (err) => console.log(`Error: ${err.message}`))

    })
  }

  componentDidMount() {
    this.timer = TimerMixin.setInterval(
      () => {

        BluetoothSerial.readFromDevice().then((data) => {
          BluetoothSerial.isConnected().then((connected) => {
            if (connected) {
              if (data != '') {
                this.setState({ received: this.state.received += data.charAt(0) })
                console.log(this.state.received)
              }
            }
          })
        })
      },
      500
    );
  }

  connect(device) {
    this.setState({ connecting: true })
    BluetoothSerial.connect(device.id)
      .then((res) => {
        console.log('conectou!')
        console.log(res)
        ToastAndroid.show(`Connected to device ${device.name}`, ToastAndroid.SHORT);
      })
      .catch((err) => console.log((err.message)))
  }

  _renderItem(item) {

    return (<TouchableOpacity onPress={() => this.connect(item.item)}>
      <View style={styles.deviceNameWrap}>
        <Text style={styles.deviceName}>{item.item.name ? item.item.name : item.item.id}</Text>
      </View>
    </TouchableOpacity>)
  }

  enable() {
    BluetoothSerial.enable()
      .then((res) => this.setState({ isEnabled: true }))
      .catch((err) => Toast.showShortBottom(err.message))
  }

  disable() {
    BluetoothSerial.disable()
      .then((res) => this.setState({ isEnabled: false }))
      .catch((err) => Toast.showShortBottom(err.message))
  }



  toggleBluetooth(value) {
    if (value === true) {
      this.enable()
    } else {
      this.disable()
    }
  }
  discoverAvailableDevices() {

    if (this.state.discovering) {
      return false
    } else {
      this.setState({ discovering: true })
      BluetoothSerial.discoverUnpairedDevices()
        .then((unpairedDevices) => {
          const uniqueDevices = _.uniqBy(unpairedDevices, 'id');
          console.log(uniqueDevices);
          this.setState({ unpairedDevices: uniqueDevices, discovering: false })
        })
        .catch((err) => console.log(err.message))
    }
  }

  toggleSwitch() {
    BluetoothSerial.write("T")
      .then((res) => {
        console.log(res);
        console.log('Successfuly wrote to device')

        //TimerMixin.clearInterval(this.timer);
      })
      .catch((err) => console.log(err.message))
  }

  clearCache(){
    this.setState({received: ''})
  }

  render() {

    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>Bluetooth Device List</Text>
          <View style={styles.toolbarButton}>
            <Switch
              value={this.state.isEnabled}
              onValueChange={(val) => this.toggleBluetooth(val)}
            />
          </View>
        </View>
        <Button
          onPress={this.discoverAvailableDevices.bind(this)}
          title="Scan for Devices"
          color="#841584"
        />
        <FlatList
          style={{ flex: 1 }}
          data={this.state.devices}
          keyExtractor={item => item.id}
          renderItem={(item) => this._renderItem(item)}
        />
        <Button
          onPress={this.toggleSwitch.bind(this)}
          title="Switch(On/Off)"
          color="#841584"
        />
        <Button
          onPress={this.clearCache.bind(this)}
          title="limpar Buffer"
          color="red"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  toolbar: {
    paddingTop: 30,
    paddingBottom: 30,
    flexDirection: 'row'
  },
  toolbarButton: {
    width: 50,
    marginTop: 8,
  },
  toolbarTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    flex: 1,
    marginTop: 6
  },
  deviceName: {
    fontSize: 17,
    color: "black"
  },
  deviceNameWrap: {
    margin: 10,
    borderBottomWidth: 1
  }
});