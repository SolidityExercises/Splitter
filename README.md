# Splitter task

You will create a smart contract named Splitter whereby:

- there are 3 people: Alice, Bob and Carol
- we can see the balance of the Splitter contract on the web page
- whenever Alice sends ether to the contract, half of it goes to Bob and the other half to Carol
- we can see the balances of Alice, Bob and Carol on the web page
- we can send ether to it from the web page

It would be even better if you could team up with different people impersonating Alice, Bob and Carol, all cooperating on a test net.

Stretch goals:

- add a kill switch to the whole contract
- make the contract a utility that can be used by David, Emma and anybody with an address
- cover potentially bad input data

## Splitter contract Application Binary Interface

`[ {"constant":false,"inputs":[{"name":"_recipientAddress","type":"address"}],"name":"addRecipient","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getContractBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_holder","type":"address"},{"name":"_recipient","type":"address"}],"name":"isRecipientAdded","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_amount","type":"uint256"}],"name":"withdrawal","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"MAX_RECIPIENTS","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_requestor","type":"address"}],"name":"getMemberBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_holder","type":"address"}],"name":"getRecipientsCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"split","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"holder","type":"address"},{"indexed":true,"name":"recipient","type":"address"}],"name":"RecipientAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"holder","type":"address"},{"indexed":false,"name":"amountToSplit","type":"uint256"}],"name":"SplitPerformed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"recipient","type":"address"},{"indexed":false,"name":"amountToWithdrawal","type":"uint256"}],"name":"WithdrawalPerformed","type":"event"} ] `


