import React, { Component } from 'react';
import { View, Text, TouchableHighlight, Alert, ScrollView, Image, Share, Platform, Switch } from 'react-native';
import { Thumbnail, Container, Header, Form, Item, Input, Label, Button, Body, CheckBox, Picker, Radio } from 'native-base'
import StylerInstance from '../managers/BaseStyler'
import { connect } from 'react-redux'
import { updateTheme } from '../store'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsManager, events } from '../api/Analytics';


function AppThemeCheckBox(props) { 
    StylerInstance.setAppearance(props.theme);
    const darkThemeInUse = props.theme === "dark"
    
    return <View {...props} >
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
        <Text style={{color: StylerInstance.getOutlineColor()}}>Dark theme</Text>
        <Switch
            trackColor={{ false: "#767577", true: "green" }}
            thumbColor={darkThemeInUse ? "white" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => {
                const newTheme = props.theme === "dark" ? "light" : "dark"
                AnalyticsManager.logEvent(events.USER_CHANGE_APP_THEME, {theme: newTheme})
                props.dispatch(updateTheme(newTheme))
                AsyncStorage.setItem("theme", newTheme);
            }}
            value={darkThemeInUse}
        />
    </View>
    </View>
}
const mapStateToProps = (state) =>  { 
	const { theme } = state
	return { theme }
}
export default connect(mapStateToProps)(AppThemeCheckBox)