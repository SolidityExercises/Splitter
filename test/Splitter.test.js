const Splitter = artifacts.require('./fakes/SplitterMock.sol');

const assertRevert = require('./utils/assertRevert');
const watchEvent = require('./utils/watchEvent');

contract('Splitter', ([first, second, third, fourth]) => {
	let sut;

	before(() => {
		web3.eth.defaultAccount = first;
	});

	beforeEach(async () => {
		sut = await Splitter.new();
	});

	describe('MAX_RECIPIENTS should', async () => {

		it("MAX_RECIPIENTS return exact value", async () => {
			const result = await sut.MAX_RECIPIENTS();

			assert.equal(result, 254);
		});
	});

	describe('getContractBalance should', async () => {

		it("return default value on contract init", async () => {
			const balanceDefaultValue = 0;

			const result = await sut.getContractBalance.call();

			assert.equal(result, 0);
		});

		it("return exact value after split function call", async () => {
			await sut.addRecipient(second);
			await sut.split({ value: 1 });

			const result = await sut.getContractBalance.call();

			assert.equal(result, 1);
		});

		it("return exact value after split and withdrawal functions call", async () => {
			await sut.addRecipient(second);
			await sut.addRecipient(third);
			await sut.split({ value: 3 });
			await sut.withdrawal(1);

			const result = await sut.getContractBalance.call();

			assert.equal(result, 2);
		});
	});

	describe('getMemberBalance should', async () => {

		it("return default value for a member on contract init", async () => {
			const balanceDefaultValue = 0;

			const result = await sut.getMemberBalance(second);

			assert.equal(result, 0);
		});
	});

	describe('addRecipient should', async () => {

		it("revert when trying to add more than MAX_RECIPIENTS recipients", async () => {
			await sut.addRecipient(second);
			await sut.addRecipient(third);

			const result = sut.addRecipient(fourth);

			await assertRevert(result);
		});

		it("revert when trying to add already added recipient", async () => {
			await sut.addRecipient(second);

			const result = sut.addRecipient(second);

			await assertRevert(result);
		});

		it("revert when passed invalid argument", async () => {
			const result = sut.addRecipient(0x00000000000000000000);

			await assertRevert(result);
		});

		it("set allowed property to true for the newly added recipient", async () => {
			await sut.addRecipient(second);

			const result = await sut.isRecipientAdded(first, second);

			assert.isTrue(result, true);
		});

		it("add the added recipient to the recipients array", async () => {
			const oldRecipientsCount = await sut.getRecipientsCount(first);
			await sut.addRecipient(second);
			const newRecipientsCount = await sut.getRecipientsCount(first);

			assert.isAbove(newRecipientsCount, oldRecipientsCount);
		});

		it("raise RecipientAdded event", async () => {
			const event = sut.RecipientAdded();
			const promiEvent = watchEvent(event);

			await sut.addRecipient(second);
			const result = await promiEvent;
			event.stopWatching();

			assert.equal(result.args.holder, first);
			assert.equal(result.args.recipient, second);
		});
	});

	describe('split should', async () => {

		it("revert when `msg.sender` has no recipients", async () => {
			const result = sut.split({ value: 2 });

			await assertRevert(result);
		});

		it("revert when the value sent is less than recipients length", async () => {
			await sut.addRecipient(second);
			await sut.addRecipient(third);

			const result = sut.split({ value: 1 });

			await assertRevert(result);
		});

		it("return reminder", async () => {
			await sut.addRecipient(second);
			await sut.addRecipient(third);

			await sut.split({ value: 3 });
			const result = await sut.getMemberBalance(first);

			assert.equal(result, 1);
		});

		it("split the amount evenly to every recipient", async () => {
			await sut.addRecipient(second);
			await sut.addRecipient(third);

			await sut.split({ value: 3 });
			const reminder = await sut.getMemberBalance(first);
			const secondRecipientBalance = await sut.getMemberBalance(second);
			const thirdRecipientBalance = await sut.getMemberBalance(third);

			assert.equal(reminder, 1);
			assert.equal(secondRecipientBalance, 1);
			assert.equal(thirdRecipientBalance, 1);
		});

		it("raise SplitPerformed event", async () => {
			const event = sut.SplitPerformed();
			const promiEvent = watchEvent(event);
			await sut.addRecipient(second);

			await sut.split({ value: 1 });
			const result = await promiEvent;
			event.stopWatching();

			assert.equal(result.args.holder, first);
			assert.equal(result.args.amountToSplit, 1);
		});
	});

	describe('split should', async () => {

		it("withdrawal should revert when `msg.sender` doesn't have enough funds", async () => {
			const result = sut.withdrawal(1);

			await assertRevert(result);
		});

		it("withdrawal should decrease balances of `msg.sender` with exact amount", async () =>	{
			await sut.addRecipient(second);
			await sut.split({ value: 2 });
			const oldBalance = await sut.getMemberBalance(second);

			await sut.withdrawal(1, { from: second });
			const newBalance = await sut.getMemberBalance(second);

			assert.equal(oldBalance, 2);
			assert.equal(newBalance, 1);
		});

		it("withdrawal should raise WithdrawalPerformed event", async () => {
			const event = sut.WithdrawalPerformed();
			const promiEvent = watchEvent(event);
			await sut.addRecipient(second);
			await sut.split({ value: 2 });

			await sut.withdrawal(1, { from: second });
			const result = await promiEvent;
			event.stopWatching();

			assert.equal(result.args.recipient, second);
			assert.equal(result.args.amountToWithdrawal, 1);
		});
	});
});
