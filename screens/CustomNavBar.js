import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


const CustomNavBar = ({ onBackPress }) => {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, marginTop: '10%', }}>
            <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} onPress={onBackPress} activeOpacity={0.5}>
                <MaterialIcons name='arrow-back-ios' size={24} color={'#00A3A3'} />
                <Text style={{ color: '#00A3A3' }}>Back</Text>
            </TouchableOpacity>
        </View>
    );
};

export default CustomNavBar;
