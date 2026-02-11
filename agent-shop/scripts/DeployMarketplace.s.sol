// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/ServiceMarketplace.sol";

contract DeployMarketplace is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");

        vm.startBroadcast(deployerKey);

        ServiceMarketplace marketplace = new ServiceMarketplace();

        console.log("ServiceMarketplace deployed to:", address(marketplace));

        vm.stopBroadcast();
    }
}
