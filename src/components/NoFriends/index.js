import React, { Component } from 'react';
import ReactSVG from 'react-svg';
import RaisedButton from 'material-ui/RaisedButton';
import Styles from './styles.scss';

export default class NoFriends extends Component {

	constructor(props) {
		super(props);
	}

  	render() {
	    return (
			<div className={Styles.container}>
				<p>Your Friends List <br/> is empty</p>
				<ReactSVG
					path="noFriends.svg"
					className="class-name"
					wrapperClassName={Styles.img}
			  	/>
				<div>
				  	<RaisedButton
						label="GO BACK"
						primary={true}
						href="https://m.me/neargroup"
					/>
				</div>
		  	</div>
    	);
  	}
}
