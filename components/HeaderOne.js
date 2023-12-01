import React from 'react'
import { H1 } from 'native-base'

export default class HeaderOne extends React.Component { 

	render(){
		return <H1 style={{...{fontWeight: 'bold', color: '#484848'}, ...this.props.style}}>{this.props.children}</H1>
	}
}