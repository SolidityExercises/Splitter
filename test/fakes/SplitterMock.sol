pragma solidity ^0.4.21;

import '../../contracts/Splitter.sol';

contract SplitterMock is Splitter {
	modifier allowedRecipientsCount() {
		require(holders[msg.sender].recipients.length < 2);
		_;
	}
}
