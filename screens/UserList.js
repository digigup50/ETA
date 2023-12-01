import React, { useState } from "react";
import { View, FlatList, Image, Text, TouchableOpacity } from 'react-native';
import StylerInstance from "../managers/BaseStyler";

export default function UserList() {

    const [data, setData] = useState([]);
    const [isloading, setisLoading] = useState(false);


    const renderUserList = () => {

        return (
            <TouchableOpacity style={{ width: '48%', borderColor: '#000', alignSelf: "center", borderRadius: 10, padding: 5, margin: 5, borderWidth: 0.2, height: 150, elevation: 10 }} activeOpacity={0.8}>
                <View style={{ height: 100, width: 100, alignItems: "center", alignSelf: "center" }}>
                    <Image style={{ height: '100%', width: '100%', borderRadius: 100 }} resizeMode="contain" source={require('../assets/images/background2.jpg')} />
                </View>
                <Text style={{ color: 'green', fontWeight: '700', textAlign: 'right' }}>Online</Text>
                <Text style={{ fontWeight: "bold", color: '#808080' }}>Dany Barbie | @danibarbie</Text>

            </TouchableOpacity>
        );
    }


    return (
        <View style={{ flex: 1, alignItems: "center", backgroundColor: StylerInstance.getBackgroundColor() }}>

            <FlatList
                data={[1, 1, 1, 1, 1, 1, 1]}
                renderItem={renderUserList}
                keyExtractor={index => index.toString()}
                numColumns={2}
            />


        </View>
    )
}