
const { keccak256, encodeFunctionUint, stringToBytes, hexToBytes, toHex } = require('viem');
const { getFunctionSelector } = require('viem/utils');

const functions = [
    "registerService(string,string,uint256,uint8,uint8)",
    "createRequest(uint256,string)",
    "submitEncryptedOffer(uint256,bytes32)",
    "revealOffer(uint256,uint256,uint256)",
    "settlePayment(uint256,address)"
];

functions.forEach(f => {
    console.log(`${f}: ${getFunctionSelector(f)}`);
});
