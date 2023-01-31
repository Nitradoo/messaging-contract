import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import MessageABI from "../ABI/ABIforBoard.json";

function App() {
    const [haveMetamask, sethaveMetamask] = useState(true);
    const [accountAddress, setAccountAddress] = useState('');
    const [accountBalance, setAccountBalance] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [allMessages, setAllMessages] = useState([]);
    const [messageValue, setMessageValue] = useState("");
    const [nameValue, setNameValue] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);
    const [network, setNetwork] = useState("");


    const contractAddress = "0xDC6481b0925e12B6CB8BCEe92485e2D8AB37D794";


    const handleChange = (event) => {
        if (event.target.id === "name") {
            setNameValue(event.target.value);
        } else {
            setMessageValue(event.target.value);
        }
    };

    useEffect(() => {
        const { ethereum } = window;
        if(ethereum){

        
        let provider = new ethers.providers.Web3Provider(ethereum);
        let contract = new ethers.Contract(contractAddress, MessageABI, provider);
        (async () => {
            setNetwork(await provider.getNetwork());
            let network = await provider.getNetwork();
            if(network.name !== "sepolia"){
                ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{
                       chainId: "0xaa36a7"
                    }]
                 })
                    .then(() => {
                        location.reload();
                    })
            }
            if (ethereum) {
                console.log('ethereum is available');
                const accounts = await window.ethereum.request({
                    method: "eth_accounts",
                });

                if (accounts.length > 0) {
                    connectWallet();
                }
            }
        
        
        
        contract.on("NewMessage", async () => {
            await getMessages();
          });
        getMessages();
        const checkMetamaskAvailability = async () => {
            if (!ethereum) {
                sethaveMetamask(false);
            }
            sethaveMetamask(true);
        };
        checkMetamaskAvailability();
    })();
    }
    }, []);

    const connectWallet = async () => {
        try {
            if (!ethereum) {
                sethaveMetamask(false);
            }
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await ethereum.request({
                method: 'eth_requestAccounts',
            });
            if (accounts.length > 0) {
                setIsConnected(true);
            }
            let balance = await provider.getBalance(accounts[0]);
            let bal = ethers.utils.formatEther(balance);
            setAccountAddress(accounts[0]);
            setAccountBalance(bal);
            setNetwork(await provider.getNetwork());
            setIsConnected(true);
        } catch (error) {
            setIsConnected(false);
        }
    };

    async function getMessages() {
        console.log("Getting messages");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        let contract = new ethers.Contract(
            contractAddress,
            MessageABI,
            provider
        );
        const messages = await contract.getAllMessages();
        setAllMessages([
            ...messages.map((item) => {
                return {
                    address: item.sender,
                    timestamp: new Date(
                        item.timestamp * 1000
                    ).toLocaleDateString(),
                    message: item.message,
                    name: item.name,
                };
            }),
        ]);
    }

    async function sendMessage() {
        if (nameValue === "") {
            alert("Please enter a name");
            return;
        }
        if (messageValue === "") {
            alert("Please enter a message");
            return;
        }
        setSendingMessage(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const rwContract = new ethers.Contract(
            contractAddress,
            MessageABI,
            provider.getSigner()
        );
        try {
            const transaction = await rwContract.sendMessage(
                messageValue,
                nameValue
            );
            await transaction.wait();
            setSendingMessage(false);
            getMessages();
        } catch (error) {
            console.log(error);
            setSendingMessage(false);
        }
    }


    return (
        <div className="w-full h-full">
            <header className="">
                {haveMetamask ? (
                    <div className="">
                        {isConnected ? (
                            <div className="">
                                <div className="">
                                    <h3>Wallet Address:</h3>
                                    <p>
                                        <a href={`https://etherscan.io/address/${accountAddress}`}>
                                            {accountAddress.slice(0, 4)}...
                                            {accountAddress.slice(38, 42)}
                                        </a>
                                    </p>
                                </div>
                                <div className="">
                                    <h3>Wallet Balance:</h3>
                                    <p>{accountBalance}</p>
                                </div>
                                <div className=''>
                                    <h3>Network:</h3>
                                    <p>{network.name}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-xl font-semibold">Connect wallet:</p>
                        )}
                        {isConnected ? (
                            <div>
                                <div>


                                    <div className="card w-96 bg-base-100 shadow-xl m-auto mb-16">
                                        <div className="card-body">
                                            <h2 className="card-title">Send a message!</h2>
                                            <label htmlFor="name">Name:</label>
                                            <input className='bg-neutral-focus rounded-md' type="text" id="name" value={nameValue} onChange={handleChange} />
                                            <br />
                                            <label htmlFor="message">Message:</label>
                                            <input className='bg-neutral-focus rounded-md' type="text" id="message" name="message" value={messageValue} onChange={handleChange} />
                                            <br />
                                            <div className="card-actions justify-end">
                                                {sendingMessage ? (
                                                    <p className="info">Sending message...</p>
                                                ) : (
                                                    <button className='btn btn-primary' onClick={sendMessage}>Send</button>
                                                )}
                                                
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {allMessages && allMessages.length > 0 && (
                                    <div className="overflow-x-auto">
                                        <table className="table w-full">
                                            <thead>
                                                <tr>
                                                    <th>Sender</th>
                                                    <th>Timestamp</th>
                                                    <th>Name</th>
                                                    <th>Message</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allMessages.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <a href={`https://etherscan.io/address/${item.address}`}>
                                                                {item.address}
                                                            </a>
                                                        </td>
                                                        <td>{item.timestamp}</td>
                                                        <td>{item.name}</td>
                                                        <td>{item.message}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ) : (
                        <div className='w-full h-full flex justify-center items-center'>
                            <button className="btn" onClick={connectWallet}>
                                Connect
                            </button>
                        </div>
                        )}
                    </div>
                ) : (
                    <p>Please Install MetaMask</p>
                )}
            </header>
        </div>
    );
}

export default App;