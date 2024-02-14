import { ethers, artifacts } from "hardhat";
import { BTC_ADDRESS, USDC_ADDRESS } from "./constants";

const AMOUNT = 500;


async function main() {
    const [adminWallet] = await ethers.getSigners();

    const usdcArtifact = await artifacts.readArtifact("Erc20Token");
    const usdc = new ethers.Contract(USDC_ADDRESS, usdcArtifact.abi, adminWallet);
    const btc = new ethers.Contract(BTC_ADDRESS, usdcArtifact.abi, adminWallet);

    for (let i = 0; i < AMOUNT; i++) {
        try {

            const accountWallet = ethers.Wallet.createRandom().connect(adminWallet.provider);
            console.log(`Address:     ${accountWallet.address}\nPrivate key: ${accountWallet.privateKey}\n`);

            const tx = await adminWallet.sendTransaction({
                to: accountWallet.address,
                value: ethers.parseEther("0.01")
            });
            await tx.wait();

            const btcMintTx = await (btc.connect(accountWallet) as any).mint(accountWallet.address, ethers.parseUnits("1", 8));
            await btcMintTx.wait();

            const usdcMintTx = await (usdc.connect(accountWallet) as any).mint(accountWallet.address, ethers.parseUnits("45000", 6));
            await usdcMintTx.wait();
        } catch (e: any) {
            console.log("❌", e.toString());
        }

        await new Promise(r => setTimeout(r, 500));
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});