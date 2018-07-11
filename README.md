# react-native-bluetooth
Simple app to work with bluetooth serial communication
Para utilizar o programa, e a biblioteca bluletooth serial, rodar o npm install
Más quando instalar a bibliioteca, em um projeto novo, usar:

  -npm i -S react-native-bluetooth-serial
  
  -react-native link
  
  -npm install
  
  -verificar se no android/app/build.grandle tem :dependencies{compile project(':react-native-bluetooth-serial')}
  
  -adicionar no AndroidManifest.xml:     
  
                                         <uses-permission android:name="android.permission.BLUETOOTH" />
                                         <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
                                         
                                         
  -verificar se no arquivo:android\app\src\main\java\com\bluetoothteste\MainApplication.java
    o método getUseDeveloperSupport() está :public
    
    
  - verificar o arquivo node_modules\react-native-bluetooth-    serial\android\src\main\java\com\rusel\RCTBluetoothSerial\RCTBluetoothSerialPackage.java
    remover o @override do método: createJSModules()
  
    Em caso de erro       npm start -- --reset-cache e : cd android, ./gradlew clean
