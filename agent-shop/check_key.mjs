import { privateKeyToAccount } from 'viem/accounts';
const account = privateKeyToAccount('0x52d884477b9977f573b8874a094137735cb06006861cf9cfa1b0db9423858c2d');
console.log(account.address);
