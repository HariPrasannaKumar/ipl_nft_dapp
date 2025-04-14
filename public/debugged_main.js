console.log("✅ debugged_main.js loaded");

import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

let signer, provider, contract;

const minterContractAddress = "0xf415b8eC8a018565CA62d76530b93966477cefa8";  // <-- Your deployed Minter contract
const pinataBaseURI = "https://violet-hilarious-scallop-5.mypinata.cloud/ipfs/bafybeiazsav4iqoyobg3qbfv3hiwfa6p2enu3shtrzl7aivghmnl6vwgde";

const minterABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_nftAddress", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "mintPrice",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "tokenURI", "type": "string" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "tokenURI", "type": "string" }
    ],
    "name": "Minted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

function nameToFileName(name) {
  return name.trim().replace(/\s+/g, "_") + ".json";
}

async function connectWallet() {
  if (!window.ethereum) {
    alert("🦊 Please install MetaMask!");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();

  const address = await signer.getAddress();
  document.getElementById("walletAddress").innerText = `Connected: ${address}`;

  contract = new ethers.Contract(minterContractAddress, minterABI, signer);
  console.log("✅ Wallet connected");

  loadPlayers();
}

async function loadPlayers() {
  const playerFiles = [
    "MS_Dhoni.json",
    "Virat_Kohli.json",
    "Rohit_Sharma.json",
    "Ajinkya_Rahane.json",
    "KL_Rahul.json",
    "Pat_Cummins.json",
    "Rishabh_Pant.json",
    "Sanju_Samson.json",
    "Shreyas_Iyer.json",
    "Shubman_Gill.json",
    "Ravindra_Jadeja.json",
    "Surya_Kumar_Yadav.json"
  ];

  const container = document.getElementById("players");
  container.innerHTML = "";

  for (const fileName of playerFiles) {
    try {
      const res = await fetch(`${pinataBaseURI}/${fileName}`);
      const player = await res.json();

      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <img src="${player.image}" alt="${player.name}" style="width: 200px; height: auto;" />
        <h3>${player.name}</h3>
        <p>Team: ${player.team}</p>
        <p>Role: ${player.role}</p>
        <button onclick="window.mint('${player.name}')">Mint</button>
      `;
      container.appendChild(div);
    } catch (err) {
      console.error(`❌ Failed to load ${fileName}:`, err);
    }
  }
}

async function mint(playerName) {
  try {
    if (!contract) {
      alert("⛔ Contract not initialized. Connect wallet first.");
      return;
    }

    const tokenURI = `${pinataBaseURI}/${nameToFileName(playerName)}`;
    const price = await contract.mintPrice();
    const tx = await contract.mint(tokenURI, { value: price });

    alert(`🚀 Minting in progress...\nTx Hash: ${tx.hash}`);
    await tx.wait();
    alert("🎉 NFT Minted Successfully!");

  } catch (err) {
    alert("❌ Minting failed: " + err.message);
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 DOM Ready");
  document.getElementById("connectButton").addEventListener("click", connectWallet);
  window.mint = mint;
});
