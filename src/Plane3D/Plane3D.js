import React, { Component } from 'react';
import './Plane3D.css';
import Plane3DThree from './Plane3DThree';

class Plane3D extends Component{
	constructor(props){
		super(props);
		
		this.canvas = React.createRef();
	}
	goToArduinoHomepage(){
	}

   componentDidMount(){
   	let plane = new Plane3DThree(this.canvas.current);
	}
	render(){
		return (
			<div className="Plane3D">				
				<canvas className="ThreeCanvas"
						  ref={this.canvas}>
				</canvas>
			</div>
		);
	}
}



export default Plane3D;

