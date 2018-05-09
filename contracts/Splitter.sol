pragma solidity ^0.4.21;

import '../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';
import '../node_modules/zeppelin-solidity/contracts/lifecycle/Destructible.sol';

contract Splitter is Destructible {
    using SafeMath for uint256;

    event RecipientAdded(address indexed holder, address indexed recipient);
	event SplitPerformed(address indexed holder, uint256 amountToSplit);
	event WithdrawalPerformed(address indexed recipient, uint256 amountToWithdrawal);

    uint8 public constant MAX_RECIPIENTS = 254;

    struct Recipients {
        address[] recipients;
        mapping(address => bool) allowed;
    }

    mapping (address => uint256) public balances;
    mapping (address => Recipients) holders;

	modifier allowedRecipientsCount() {
		require(getRecipientsCount(msg.sender) < MAX_RECIPIENTS);
		_;
	}

	modifier onlyIfNewRecipient(address _recipientAddress) {
		require(!isRecipientAdded(msg.sender, _recipientAddress));
		_;
	}

	modifier onlyIfAmountEnoughForSplit() {
		require(msg.value >= holders[msg.sender].recipients.length);
		_;
	}

	modifier onlyIfBalanceEnough(uint256 _amount) {
		require(balances[msg.sender] >= _amount);
		_;
	}

	function getMemberBalance(address _requestor) public view returns (uint256) {
		return balances[_requestor];
	}

	function getContractBalance() public view returns (uint256) {
		return address(this).balance;
	}

	function isRecipientAdded(address _holder, address _recipient) public view returns (bool) {
		return holders[_holder].allowed[_recipient];
	}

	function getRecipientsCount(address _holder) public view returns (uint256) {
		return holders[_holder].recipients.length;
	}

    function addRecipient(address _recipientAddress) public allowedRecipientsCount onlyIfNewRecipient(_recipientAddress) {
        require(_recipientAddress != address(0));
        require(_recipientAddress != msg.sender);

        holders[msg.sender].allowed[_recipientAddress] = true;
        holders[msg.sender].recipients.push(_recipientAddress);

        emit RecipientAdded(msg.sender, _recipientAddress);
    }

    function split() public payable onlyIfAmountEnoughForSplit {
        require(getRecipientsCount(msg.sender) > 0);

        uint256 reminder = msg.value % holders[msg.sender].recipients.length;
        
        if(reminder != 0){
            balances[msg.sender] = balances[msg.sender].add(reminder);
        }
        
        uint256 splittedAmount = msg.value.div(holders[msg.sender].recipients.length);

        address recipientAddress;
        for(uint8 i = 0; i < holders[msg.sender].recipients.length; i++){
            recipientAddress = holders[msg.sender].recipients[i];
            balances[recipientAddress] = balances[recipientAddress].add(splittedAmount);
        }

        emit SplitPerformed(msg.sender, splittedAmount);
    }

    function withdrawal(uint256 _amount) public onlyIfBalanceEnough(_amount) {
        balances[msg.sender] = balances[msg.sender].sub(_amount);

        msg.sender.transfer(_amount);

        emit WithdrawalPerformed(msg.sender, _amount);
    }
}
