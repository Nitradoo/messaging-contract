// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;


contract MessageBoard {

	address public owner;
    
    Message[] messages;

	struct Message {
		address sender; 
		string message; 
		string name; 
		uint256 timestamp; 
	}

	event NewMessage(address indexed from, string message, string name);

	constructor() {
		owner = msg.sender;
	}

	function sendMessage(string memory _message, string memory _name) public {
		messages.push(Message(msg.sender, _message, _name, block.timestamp));

		emit NewMessage(msg.sender, _message, _name);
	}

	function getAllMessages() public view returns (Message[] memory) {
		return messages;
	}


}
