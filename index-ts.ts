import {
  createWalletClient,
  custom,
  createPublicClient,
  parseEther,
  defineChain,
  formatEther,
  type WalletClient,
  type PublicClient,
  type Chain,
} from "viem";
import "viem/window";
import { contractAddress, coffeeAbi } from "./constants.js";

const connectButton = document.getElementById("connectButton") as HTMLButtonElement;
const fundButton = document.getElementById("fundButton") as HTMLButtonElement;
const ethAmountInput = document.getElementById("ethAmount") as HTMLInputElement;
const balanceButton = document.getElementById("balanceButton") as HTMLButtonElement;
const withdrawButton = document.getElementById("withdrawButton") as HTMLButtonElement;

let walletClient: WalletClient | undefined;
let publicClient: PublicClient | undefined;

async function connect(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum!),
    });
    await walletClient.requestAddresses();
    publicClient = createPublicClient({
      transport: custom(window.ethereum!),
    });
    connectButton.innerHTML = "Connected!";
  } else {
    connectButton.innerHTML = "Please install MetaMask!";
  }
}

async function withdraw(): Promise<void> {
  walletClient = createWalletClient({
    transport: custom(window.ethereum!),
  });
  const [connectedAccount] = await walletClient.requestAddresses();
  const currentChain = await getCurrentChain(walletClient);
  publicClient = createPublicClient({
    transport: custom(window.ethereum!),
  });
  const { request } = await publicClient.simulateContract({
    address: contractAddress as `0x${string}`,
    abi: coffeeAbi,
    functionName: "withdraw",
    account: connectedAccount,
    chain: currentChain,
  });
  const hash = await walletClient.writeContract(request);
  console.log(hash);
}

async function fund(): Promise<void> {
  const ethAmount = ethAmountInput.value;
  walletClient = createWalletClient({
    transport: custom(window.ethereum!),
  });
  const [connectedAccount] = await walletClient.requestAddresses();
  const currentChain = await getCurrentChain(walletClient);
  publicClient = createPublicClient({
    transport: custom(window.ethereum!),
  });
  const { request } = await publicClient.simulateContract({
    address: contractAddress as `0x${string}`,
    abi: coffeeAbi,
    functionName: "fund",
    account: connectedAccount,
    chain: currentChain,
    value: parseEther(ethAmount),
  });
  const hash = await walletClient.writeContract(request);
  console.log(hash);
}

async function getCurrentChain(client: WalletClient): Promise<Chain> {
  const chainId = await client.getChainId();
  return defineChain({
    id: chainId,
    name: "Custom Chain",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["http://localhost:8545"] } },
  });
}

async function getbalance(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    publicClient = createPublicClient({
      transport: custom(window.ethereum!),
    });
    const balance = await publicClient.getBalance({
      address: contractAddress as `0x${string}`,
    });
    console.log(formatEther(balance));
  }
}

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getbalance;
withdrawButton.onclick = withdraw;