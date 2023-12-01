import React, { Component } from 'react'
import { TouchableWithoutFeedback, View, Text } from 'react-native'
import { Button } from 'native-base'


export default class BufferedTextField extends Component { 
	static numberOfLines = 8

	constructor(props) { 
		super(props)
		this.state = { 
			canShowMore: true,
			showingEntire: false
		}
	}

	componentDidMount() { 
		const lines = (this.props.text.match(/\r?\n/g) || '').length + 1
		console.log("===LINES IN description===")
		console.log(lines)
		if (lines <= BufferedTextField.numberOfLines) { 
			this.setState({showingEntire:true, canShowMore: false})
		} 
	}

	getNumberOfLines(){ 
		if (this.state.showingEntire == false) { 
			return BufferedTextField.numberOfLines
		} else { 
			return 1000
		}
	}

	getShowMore() { 
		if (this.state.canShowMore == false) { 
			return null
		}

		if (this.state.showingEntire == false) { 
			return (<Button transparent info
							style={{backgroundColor: 'transparent'}}
							onPress={()=> this.setState({showingEntire: true})}> 
								<Text style={{color: 'blue'}}>Show More</Text>
							</Button>)
		} else { 
			return (<Button transparent info
							style={{backgroundColor: 'transparent'}}
							onPress={()=> this.setState({showingEntire: false})}> 
								<Text style={{color: 'blue'}}>Show Less</Text>
							</Button>)
		}
	}

	render() { 
		return (
			<TouchableWithoutFeedback
						onPress={() => this.setState({showingEntire: !this.state.showingEntire})}>
						<View>
							<Text numberOfLines={this.getNumberOfLines()}
							style={this.props.textStyle}>{this.props.text}</Text>
							{this.getShowMore()}
						</View>
			</TouchableWithoutFeedback>
		)

	}
}