import { ethers, artifacts } from "hardhat";
import { BTC_ADDRESS, USDC_ADDRESS } from "./constants";

const AMOUNT = 500;

//TEST ADDRESS
// Address:     0x7c1F08052b94DD8BF8FBCE284eaa703e4F5b5667
// Private key: 0x72ed4f61fc90ebcbdf295d5a1e2beb947d13857b4d7ab31ed579ad4b45691534

async function main() {
    const [adminWallet] = await ethers.getSigners();

    const usdcArtifact = await artifacts.readArtifact("Erc20Token");
    const usdc = new ethers.Contract(USDC_ADDRESS, usdcArtifact.abi, adminWallet);
    const btc = new ethers.Contract(BTC_ADDRESS, usdcArtifact.abi, adminWallet);

    for (let i = 0; i < AMOUNT; i++) {
        const accountWallet = ethers.Wallet.createRandom().connect(adminWallet.provider);
        console.log(`Address:     ${accountWallet.address}\nPrivate key: ${accountWallet.privateKey}\n`);

        const tx = await adminWallet.sendTransaction({
            to: accountWallet.address,
            value: ethers.parseEther("0.001")  //"0.0005"
        });
        await tx.wait();

        const btcMintTx = await (btc.connect(accountWallet) as any).mint(accountWallet.address, ethers.parseUnits("1", 8));
        await btcMintTx.wait();

        const usdcMintTx = await (usdc.connect(accountWallet) as any).mint(accountWallet.address, ethers.parseUnits("45000", 6));
        await usdcMintTx.wait();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});