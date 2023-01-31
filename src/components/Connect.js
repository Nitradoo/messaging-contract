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


    const contractAddress = "0xbd784e82546e679D3d0AFB06a543a6D9788a8259";


    const handleChange = (event) => {
        if (event.target.id === "name") {
            setNameValue(event.target.value);
        } else {
            setMessageValue(event.target.value);
        }
    };

    useEffect(() => {
        const { ethereum } = window;
        let provider = new ethers.providers.Web3Provider(ethereum);
        let contract = new ethers.Contract(contractAddress, MessageABI, provider);
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
        (async () => {
            if (ethereum) {
                console.log('ethereum is available');
                const accounts = await window.ethereum.request({
                    method: "eth_accounts",
                });

                if (accounts.length > 0) {
                    connectWallet();
                }
            }
        })();
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
                            </div>
                        ) : (
                            <p> app logo</p>
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
                                                    <th>Message</th>
                                                    <th>Name</th>
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
                                                        <td>{item.message}</td>
                                                        <td>{item.name}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button className="btn" onClick={connectWallet}>
                                Connect
                            </button>
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